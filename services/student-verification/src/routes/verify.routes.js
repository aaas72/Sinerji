/**
 * ============================================================
 * Verification Routes
 * ============================================================
 * Defines the HTTP routes for the student document verification
 * microservice. All routes are protected by API key middleware.
 */

const { Router } = require("express");
const multer = require("multer");
const authenticateApiKey = require("../middleware/auth.middleware");
const verifyController = require("../controllers/verify.controller");

const router = Router();

// ---------------------------------------------------------------------------
// Multer configuration — MEMORY STORAGE ONLY (KVKK compliance)
// ---------------------------------------------------------------------------
const upload = multer({
  storage: multer.memoryStorage(), // Files stay in RAM, never touch disk
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1,                   // Only one file per request
  },
  fileFilter: (_req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted."), false);
    }
  },
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * POST /api/verify-student
 *
 * Accepts a multipart/form-data request with a single PDF file
 * in the "document" field. Requires x-api-key header.
 *
 * Response:
 * {
 *   "success": true|false,
 *   "studentName": "Ali Yılmaz" | null,
 *   "university": "İstanbul Teknik Üniversitesi" | null,
 *   "program": "Bilgisayar Mühendisliği" | null,
 *   "status": "AKTİF" | "INVALID" | null,
 *   "message": "..." | null,
 *   "meta": { "processedInMs": 3200 }
 * }
 */
router.post(
  "/verify-student",
  authenticateApiKey,
  upload.single("document"),
  verifyController.verifyStudent
);

// ---------------------------------------------------------------------------
// Multer error handler
// ---------------------------------------------------------------------------
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "File too large. Maximum allowed size is 5 MB.",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }
  if (err.message === "Only PDF files are accepted.") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next(err);
});

module.exports = router;
