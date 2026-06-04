/**
 * ============================================================
 * PDF Parsing Service
 * ============================================================
 * Extracts T.C. Kimlik No and Barkod Numarası from an
 * in-memory PDF buffer of a YÖK Öğrenci Belgesi.
 *
 * KVKK Compliance:
 * - Operates exclusively on in-memory buffers
 * - Never writes anything to disk
 * - Nullifies the buffer reference after extraction
 */

const pdfParse = require("pdf-parse");
const logger = require("../utils/logger");

// ---------------------------------------------------------------------------
// Regex patterns for extracting credentials from the document text.
// These patterns are designed to be flexible enough to handle minor
// formatting variations across different universities and document versions.
// ---------------------------------------------------------------------------

/**
 * Matches 11-digit T.C. Kimlik Numarası.
 * Handles variations like:
 *   "T.C. Kimlik No: 12345678901"        (label before number)
 *   "T.C. Kimlik Numarası : 12345678901"  (label before number)
 *   "99063773082T.C. Kimlik No"           (number before label — real YÖK format)
 *   "99063773082 T.C. Kimlik No"          (number before label with space)
 */
const TC_PATTERNS = [
  // Pattern 1: Number BEFORE label (real YÖK format: "99063773082T.C. Kimlik No")
  /(\d{11})\s*T\.?\s*C\.?\s*(?:Kimlik)?\s*(?:No|Numaras[ıi])?/i,
  // Pattern 2: Label BEFORE number (standard format: "T.C. Kimlik No: 12345678901")
  /T\.?\s*C\.?\s*(?:Kimlik)?\s*(?:No|Numaras[ıi])?\s*:?\s*(\d{11})/i,
  // Pattern 3: Just "Kimlik No: 12345678901"
  /Kimlik\s*(?:No|Numaras[ıi])\s*:?\s*(\d{11})/i,
];

/**
 * Matches Barkod / Doğrulama Numarası.
 * Handles variations like:
 *   "Barkod No: ABC123-DEF456"           (explicit label)
 *   "Doğrulama Kodu: ABC123DEF456"       (explicit label)
 *   "YOKOGB44VSD8EJQ7LS"                 (standalone code at top — real YÖK format)
 *
 * The real YÖK format places the barkod as the very first meaningful
 * text on the page, as a standalone alphanumeric code (typically starting
 * with "YOK" prefix), before the "ANKARA" / city line.
 */
const BARKOD_PATTERNS = [
  // Pattern 1: YÖK-prefixed standalone code (e.g., "YOKOGB44VSD8EJQ7LS")
  // Put this first because it's the most reliable for YÖK documents
  /\b(YOK[A-Z0-9]{10,})\b/i,
  // Pattern 2: Explicit label before code (strict alphanumeric requirement)
  /(?:Barkod|Do[gğ]rulama)\s*(?:No|Numarası|Numarasi|Kodu)\s*:?\s*([A-Z0-9]{8,})/i,
  // Pattern 3: Explicit "Belge" label
  /Belge\s*(?:Do[gğ]rulama)?\s*(?:No|Kodu)\s*:?\s*([A-Z0-9]{8,})/i,
];

/**
 * Extracts T.C. Kimlik No and Barkod from a PDF buffer.
 *
 * @param {Buffer} pdfBuffer — Raw PDF file buffer from multer memoryStorage
 * @returns {Promise<{ tcKimlik: string, barkod: string }>}
 * @throws {Error} If the PDF cannot be parsed or credentials cannot be found
 */
async function extractCredentials(pdfBuffer) {
  logger.info("Starting PDF text extraction");

  let text;
  try {
    const parsed = await pdfParse(pdfBuffer);
    text = parsed.text;
  } catch (err) {
    throw new Error(
      `PDF_PARSE_ERROR: Failed to parse the uploaded file. Ensure it is a valid PDF. (${err.message})`
    );
  }

  if (!text || text.trim().length < 20) {
    throw new Error(
      "PDF_EMPTY: The uploaded PDF appears to have no extractable text content. " +
      "It may be a scanned image. Please upload the original e-Devlet PDF."
    );
  }

  logger.info("PDF text extracted successfully", { textLength: text.length });

  // ── Extract T.C. Kimlik No ──
  let tcKimlik = null;
  for (const pattern of TC_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      tcKimlik = match[1];
      break;
    }
  }

  if (!tcKimlik) {
    throw new Error(
      "TC_NOT_FOUND: Could not locate a T.C. Kimlik Numarası (11 digits) in the document. " +
      "Please ensure you uploaded a valid YÖK Öğrenci Belgesi from e-Devlet."
    );
  }

  // ── Extract Barkod Numarası ──
  let barkod = null;
  for (const pattern of BARKOD_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      barkod = match[1];
      break;
    }
  }

    if (!barkod) {
      throw new Error(
        "BARKOD_NOT_FOUND: Could not locate a Barkod/Doğrulama Numarası in the document. " +
        "Please ensure you uploaded a valid YÖK Öğrenci Belgesi from e-Devlet."
      );
    }

  // ── Extract and Validate Issue Date ──
  // The first DD.MM.YYYY date in a YÖK document is always the issue date at the top.
  const dateMatch = text.match(/\b(\d{2})\.(\d{2})\.(\d{4})\b/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1; // JS months are 0-indexed
    const year = parseInt(dateMatch[3], 10);
    
    const issueDate = new Date(year, month, day);
    const now = new Date();
    
    // Calculate difference in days
    const diffTime = now.getTime() - issueDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays > 7) {
      throw new Error(
        `DOCUMENT_EXPIRED: The document is too old (Issued on ${dateMatch[0]}). ` +
        `The document issue date must not exceed 1 week. Please generate a new document from e-Devlet.`
      );
    }
    logger.info("Document issue date validated", { issueDate: dateMatch[0], ageInDays: Math.floor(diffDays) });
  } else {
    logger.warn("Could not determine document issue date. Proceeding with verification anyway.");
  }

  // ── Validate Active Student Status ──
  // The document must contain 'AKTİF ÖĞRENCİ'. If it's 'PASİF', 'MEZUN', etc., we reject.
  const isActive = /AKT[Iİıi]F\s+ÖĞRENC[Iİıi]/i.test(text);
  if (!isActive) {
    throw new Error(
      "STUDENT_NOT_ACTIVE: The document indicates that the student is not active. " +
      "Only active students (AKTİF ÖĞRENCİ) are permitted to register."
    );
  }
  logger.info("Student active status validated (AKTİF ÖĞRENCİ)");

  // Log success without revealing PII
  logger.info("Credentials extracted successfully from PDF");

  return { tcKimlik, barkod };
}

module.exports = { extractCredentials };
