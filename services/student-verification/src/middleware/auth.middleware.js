/**
 * ============================================================
 * API Key Authentication Middleware
 * ============================================================
 * Protects the verification endpoint so that only the Sinerji
 * main server (which knows the shared secret) can call it.
 *
 * Security features:
 * - Constant-time string comparison to prevent timing attacks
 * - Separate 401 (missing) vs 403 (invalid) responses
 */

const crypto = require("crypto");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Express middleware that validates the x-api-key header.
 */
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  // ── Case 1: No API key provided at all ──
  if (!apiKey) {
    logger.warn("Request rejected: missing x-api-key header", {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      error: "Authentication required. Provide x-api-key header.",
    });
  }

  // ── Case 2: API key provided — verify with constant-time comparison ──
  const expected = config.SINERJI_MICROSERVICE_SECRET;

  // Both buffers must be the same length for timingSafeEqual.
  // We hash both values with SHA-256 to normalize length.
  const expectedHash = crypto.createHash("sha256").update(expected).digest();
  const receivedHash = crypto.createHash("sha256").update(apiKey).digest();

  const isValid = crypto.timingSafeEqual(expectedHash, receivedHash);

  if (!isValid) {
    logger.warn("Request rejected: invalid API key", {
      ip: req.ip,
      path: req.path,
    });
    return res.status(403).json({
      success: false,
      error: "Invalid API key.",
    });
  }

  // ── Valid key — proceed ──
  next();
}

module.exports = authenticateApiKey;
