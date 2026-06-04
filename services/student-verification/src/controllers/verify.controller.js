/**
 * ============================================================
 * Verification Controller
 * ============================================================
 * Orchestrates the full student document verification flow:
 *
 * 1. Validate the uploaded PDF file
 * 2. Extract T.C. Kimlik and Barkod from PDF (in-memory)
 * 3. Verify credentials against e-Devlet portal
 * 4. Destroy all PII from memory
 * 5. Return standardized JSON response
 *
 * KVKK Compliance:
 * - PII variables are explicitly nullified after use
 * - No data is persisted to disk or database
 * - Errors never leak PII in responses
 */

const pdfService = require("../services/pdf.service");
const scraperService = require("../services/scraper.service");
const logger = require("../utils/logger");

/**
 * POST /api/verify-student
 *
 * Expects: multipart/form-data with a single PDF file field named "document"
 * Returns: JSON with verification results
 */
async function verifyStudent(req, res) {
  // Track timing for performance monitoring
  const startTime = Date.now();

  // Mutable PII references — will be nullified in the finally block
  let pdfBuffer = null;
  let tcKimlik = null;
  let barkod = null;

  try {
    // ── Step 1: Validate the uploaded file ──
    if (!req.file) {
      logger.warn("Verification request received without a file");
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please upload a PDF document.",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      logger.warn("Non-PDF file uploaded", { mimetype: req.file.mimetype });
      return res.status(400).json({
        success: false,
        error: `Invalid file type: "${req.file.mimetype}". Only PDF files are accepted.`,
      });
    }

    // Maximum file size check (5 MB — e-Devlet docs are typically < 500 KB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (req.file.size > MAX_SIZE) {
      logger.warn("Oversized file uploaded", { size: req.file.size });
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum allowed size is 5 MB.",
      });
    }

    pdfBuffer = req.file.buffer;
    logger.info("Verification request received", {
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    // ── Step 2: Extract credentials from the PDF ──
    const credentials = await pdfService.extractCredentials(pdfBuffer);
    tcKimlik = credentials.tcKimlik;
    barkod = credentials.barkod;

    // Immediately nullify the PDF buffer — no longer needed
    pdfBuffer = null;
    if (req.file) req.file.buffer = null;

    // ── Step 3: Verify on e-Devlet ──
    logger.info("Starting e-Devlet verification");
    const result = await scraperService.verifyOnEDevlet(tcKimlik, barkod);

    // ── Step 4: Build and send response ──
    const duration = Date.now() - startTime;
    logger.info("Verification completed", {
      verified: result.verified,
      durationMs: duration,
    });

    return res.status(200).json({
      success: result.verified,
      studentName: result.studentName,
      university: result.university,
      program: result.program,
      status: result.studentStatus,
      message: result.rawMessage,
      meta: {
        processedInMs: duration,
      },
    });

  } catch (err) {
    const duration = Date.now() - startTime;

    // Parse error codes from our services for appropriate HTTP status
    let statusCode = 500;
    if (err.message.startsWith("PDF_")) statusCode = 422; // Unprocessable Entity
    if (err.message.startsWith("TC_") || err.message.startsWith("BARKOD_")) statusCode = 422;

    logger.error("Verification failed", {
      errorCode: err.message.split(":")[0],
      durationMs: duration,
    });

    return res.status(statusCode).json({
      success: false,
      error: err.message,
      studentName: null,
      university: null,
      program: null,
      status: null,
    });

  } finally {
    // ──────────────────────────────────────────────────────
    // KVKK CRITICAL: Destroy ALL PII from memory
    // ──────────────────────────────────────────────────────
    pdfBuffer = null;
    tcKimlik = null;
    barkod = null;
    if (req.file) {
      req.file.buffer = null;
      req.file = null;
    }
  }
}

module.exports = { verifyStudent };
