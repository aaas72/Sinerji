/**
 * ============================================================
 * Sinerji Student Verification Microservice — Entry Point
 * ============================================================
 *
 * A standalone, stateless, KVKK-compliant microservice that
 * verifies Turkish university student documents (YÖK Öğrenci
 * Belgesi) by scraping the e-Devlet Belge Doğrulama portal.
 *
 * Architecture:
 * - Express HTTP server with security middleware
 * - Multer for in-memory PDF upload handling
 * - pdf-parse for text extraction
 * - Puppeteer for headless browser scraping
 *
 * No database. No disk writes. No PII persistence.
 */

// Load config first (validates env vars on import)
const config = require("./config");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const verifyRoutes = require("./routes/verify.routes");

// ── Create Express app ──
const app = express();

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

// Helmet: Sets various HTTP security headers
app.use(helmet());

// CORS: Only allow requests from trusted origins in production
app.use(
  cors({
    origin: config.isProduction
      ? process.env.ALLOWED_ORIGINS?.split(",") || []
      : "*",
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type", "x-api-key"],
  })
);

// Rate Limiting: Protect against brute-force and abuse
// 10 verification requests per minute per IP
const verifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many verification requests. Please try again in a minute.",
  },
});

// Body parser for JSON (for potential future endpoints)
app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /health
 * Health check endpoint for load balancers and monitoring.
 * Returns 200 with service status — no authentication required.
 */
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "sinerji-student-verification",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/verify-student
 * Main verification endpoint — protected by rate limiter + API key.
 */
app.use("/api", verifyLimiter, verifyRoutes);

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", {
    errorMessage: err.message,
    errorStack: config.isProduction ? undefined : err.stack,
  });

  res.status(500).json({
    success: false,
    error: config.isProduction
      ? "Internal server error."
      : err.message,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found.",
  });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
const server = app.listen(config.PORT, () => {
  logger.info(`Student Verification Microservice started`, {
    port: config.PORT,
    environment: config.NODE_ENV,
  });
  logger.info("Available endpoints:", {
    health: `GET  http://localhost:${config.PORT}/health`,
    verify: `POST http://localhost:${config.PORT}/api/verify-student`,
  });
});

// ---------------------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------------------
function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed. Process exiting.");
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Prevent crashes from unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason?.message || String(reason),
  });
});

module.exports = app; // Export for testing
