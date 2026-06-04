/**
 * ============================================================
 * e-Devlet Document Verification Scraper Service
 * ============================================================
 * Uses Puppeteer (headless Chrome) to submit the T.C. Kimlik No
 * and Barkod Numarası to the official e-Devlet "Belge Doğrulama"
 * portal and scrapes the verification result.
 *
 * Target URL: https://www.turkiye.gov.tr/belge-dogrulama
 *
 * KVKK Compliance:
 * - Browser session is ephemeral (no cookies/cache persist)
 * - All PII is discarded after the browser closes
 * - Browser is ALWAYS closed in a finally block
 *
 * Cloud Deployment:
 * - Uses --no-sandbox and related flags for containerized environments
 * - Configurable executable path for using system Chromium in Docker
 */

const puppeteer = require("puppeteer");
const logger = require("../utils/logger");
const config = require("../config");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EDEVLET_VERIFY_URL = "https://www.turkiye.gov.tr/belge-dogrulama";

/** Maximum time (ms) to wait for e-Devlet pages to load */
const NAVIGATION_TIMEOUT = 30_000;

/** Maximum time (ms) for the entire scraping operation */
const OPERATION_TIMEOUT = 45_000;

/**
 * Puppeteer launch arguments optimized for cloud/container environments.
 * These flags are essential for running Chrome in Docker, Render, Heroku, etc.
 */
const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--disable-extensions",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-sync",
  "--no-first-run",
  "--single-process",
  "--no-zygote",
];

// ---------------------------------------------------------------------------
// Main verification function
// ---------------------------------------------------------------------------

/**
 * Launches a headless browser, navigates to e-Devlet Belge Doğrulama,
 * submits the student document credentials, and scrapes the result.
 *
 * @param {string} tcKimlik — 11-digit T.C. Kimlik Numarası
 * @param {string} barkod  — Barkod/Doğrulama Numarası
 * @returns {Promise<{
 *   verified: boolean,
 *   studentName: string | null,
 *   university: string | null,
 *   program: string | null,
 *   studentStatus: string | null,
 *   rawMessage: string | null
 * }>}
 */
async function verifyOnEDevlet(tcKimlik, barkod) {
  logger.info("Starting e-Devlet verification scraping");

  let browser = null;

  try {
    // ── Launch browser ──
    const launchOptions = {
      headless: "new",
      args: BROWSER_ARGS,
      timeout: NAVIGATION_TIMEOUT,
    };

    // In Docker, use the system-installed Chromium instead of bundled one
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Set a realistic viewport and user agent to avoid bot detection
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set default navigation timeout
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);

    // ── Step 1: Navigate to the verification page ──
    logger.info("Navigating to e-Devlet Belge Doğrulama page (Step 1)");
    await page.goto(EDEVLET_VERIFY_URL, { waitUntil: "networkidle2" });

    // Check for CAPTCHA
    let pageContent = await page.content();
    if (pageContent.includes("captcha") || pageContent.includes("güvenlik doğrulaması")) {
      logger.warn("CAPTCHA detected on e-Devlet page");
      return { verified: false, studentName: null, university: null, program: null, studentStatus: null, rawMessage: "CAPTCHA_DETECTED" };
    }

    // ── Step 1: Fill Barkod ──
    logger.info("Filling Barkod in Step 1");
    const barkodField = await waitForField(page, ['#sorgulananBarkod', 'input[name="sorgulananBarkod"]']);
    if (!barkodField) throw new Error("Could not find barkod field on Step 1");
    
    await barkodField.click({ clickCount: 3 });
    await barkodField.type(barkod, { delay: 10 });
    
    await page.click(".submitButton").catch(() => page.keyboard.press("Enter"));

    // ── Step 2: Fill T.C. Kimlik ──
    logger.info("Filling T.C. Kimlik in Step 2");
    // Reduce timeout to 5000 per selector so it fails faster
    const tcField = await waitForField(page, ['#ikinciAlan', 'input[name="ikinciAlan"]', 'input[type="number"]'], 5000);
    if (!tcField) {
      // Take a screenshot to debug what went wrong in headless mode
      await page.screenshot({ path: require('path').resolve(__dirname, '../../error-step2.png'), fullPage: true });
      
      logger.warn("Could not find T.C. Kimlik field on Step 2. Barcode might be invalid.");
      return { verified: false, studentName: null, university: null, program: null, studentStatus: "INVALID", rawMessage: "The provided Barkod Numarası was not recognized by e-Devlet." };
    }

    await tcField.click({ clickCount: 3 });
    await tcField.type(tcKimlik, { delay: 10 });

    await page.click(".submitButton").catch(() => page.keyboard.press("Enter"));

    // ── Step 3: Accept Terms (Checkbox) ──
    logger.info("Accepting terms in Step 3");
    const checkbox = await waitForField(page, ['#chkOnay', 'input[name="chkOnay"]'], 10000);
    if (!checkbox) {
      logger.warn("Could not find checkbox on Step 3. Credentials might mismatch.");
      return { verified: false, studentName: null, university: null, program: null, studentStatus: "INVALID", rawMessage: "The T.C. Kimlik No and Barkod do not match or the document is invalid." };
    }

    // Use evaluate for checkbox as click() sometimes fails if element is obscured
    await page.evaluate((el) => el.click(), checkbox);

    await page.click(".submitButton").catch(() => page.keyboard.press("Enter"));

    // ── Step 4: Scrape the result page ──
    logger.info("Scraping verification result (Step 4)");
    
    // Wait for either the download button (success) or an error message to appear
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes("Dosyayı İndir") || text.includes("Geçersiz") || text.includes("bulunamadı");
    }, { timeout: 15000 }).catch(() => logger.warn("Timeout waiting for result page text. Proceeding to scrape anyway."));

    const resultHtml = await page.content();
    const resultText = await page.evaluate(() => document.body.innerText);
    const url = page.url();

    // If we reached the 'belge=goster' page or see 'Dosyayı İndir', it's valid!
    if (url.includes("belge=goster") || resultText.includes("Dosyayı İndir")) {
      logger.info("Document verified successfully via e-Devlet");
      return { 
        verified: true, 
        studentName: null, // Microservice just returns verification status, main server has the name
        university: null, 
        program: null, 
        studentStatus: "AKTIF", 
        rawMessage: "Document successfully verified on e-Devlet." 
      };
    }

    return parseVerificationResult(resultText, resultHtml);

  } catch (err) {
    // Handle specific Puppeteer errors
    if (err.name === "TimeoutError" || err.message.includes("timeout")) {
      logger.error("Puppeteer timeout during e-Devlet verification", {
        errorMessage: err.message,
      });
      return {
        verified: false,
        studentName: null,
        university: null,
        program: null,
        studentStatus: null,
        rawMessage: "TIMEOUT: e-Devlet portal did not respond within the allowed time. Please try again later.",
      };
    }

    logger.error("Unexpected error during e-Devlet scraping", {
      errorMessage: err.message,
      errorName: err.name,
    });
    return {
      verified: false,
      studentName: null,
      university: null,
      program: null,
      studentStatus: null,
      rawMessage: `SCRAPER_ERROR: ${err.message}`,
    };

  } finally {
    // CRITICAL: Always close the browser to prevent resource leaks and
    // ensure no PII remains in browser memory/cache.
    if (browser) {
      try {
        await browser.close();
        logger.info("Browser session closed and cleaned up");
      } catch (closeErr) {
        logger.error("Failed to close browser", { errorMessage: closeErr.message });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Tries multiple CSS selectors to wait for a form field on the page.
 * Returns the first matching ElementHandle, or null if none found within timeout.
 *
 * @param {import("puppeteer").Page} page
 * @param {string[]} selectors
 * @param {number} timeout
 * @returns {Promise<import("puppeteer").ElementHandle|null>}
 */
async function waitForField(page, selectors, timeout = 5000) {
  for (const selector of selectors) {
    try {
      const element = await page.waitForSelector(selector, { visible: true, timeout });
      if (element) return element;
    } catch {
      // Timeout reached for this selector, try the next one
    }
  }
  return null;
}

/**
 * Parses the e-Devlet verification result page text to determine
 * whether the document is valid and extract student information.
 *
 * @param {string} text — The innerText of the result page body
 * @param {string} html — The full HTML of the result page
 * @returns {{
 *   verified: boolean,
 *   studentName: string|null,
 *   university: string|null,
 *   program: string|null,
 *   studentStatus: string|null,
 *   rawMessage: string|null
 * }}
 */
function parseVerificationResult(text, html) {
  // Normalize Turkish characters for case-insensitive matching
  const normalizedText = text.toUpperCase();

  // ── Check for explicit error/invalid states ──
  const errorIndicators = [
    "BELGE BULUNAMADI",
    "GEÇERSİZ",
    "HATALI",
    "SONUÇ BULUNAMADI",
    "SORGULAMA YAPILAMADI",
  ];

  for (const indicator of errorIndicators) {
    if (normalizedText.includes(indicator)) {
      logger.info("Document verification failed: invalid document", {
        indicator,
      });
      return {
        verified: false,
        studentName: null,
        university: null,
        program: null,
        studentStatus: "INVALID",
        rawMessage: `Document verification failed. The e-Devlet portal returned: "${indicator}"`,
      };
    }
  }

  // ── Check for positive verification indicators ──
  const positiveIndicators = [
    "GEÇERLİ",
    "AKTİF",
    "AKTİF ÖĞRENCİ",
    "BELGE GEÇERLİDİR",
    "DOĞRULANDI",
  ];

  let isVerified = false;
  for (const indicator of positiveIndicators) {
    if (normalizedText.includes(indicator)) {
      isVerified = true;
      break;
    }
  }

  // ── Extract student details using regex ──
  // Name extraction
  const namePatterns = [
    /Ad[ıi]\s*(?:\/\s*)?Soyad[ıi]\s*:?\s*([^\n\r]+)/i,
    /(?:Öğrenci\s+)?Ad[ıi]\s+Soyad[ıi]\s*:?\s*([^\n\r]+)/i,
    /İsim\s*:?\s*([^\n\r]+)/i,
  ];

  let studentName = null;
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      studentName = match[1].trim();
      break;
    }
  }

  // University / Program extraction
  const uniPatterns = [
    /(?:Üniversite|Kurum)\s*:?\s*([^\n\r]+)/i,
    /(?:Yükseköğretim\s+Kurumu)\s*:?\s*([^\n\r]+)/i,
  ];

  let university = null;
  for (const pattern of uniPatterns) {
    const match = text.match(pattern);
    if (match) {
      university = match[1].trim();
      break;
    }
  }

  // Program / Department extraction
  const programPatterns = [
    /(?:Program|Bölüm|Fakülte)\s*:?\s*([^\n\r]+)/i,
    /(?:Birim)\s*:?\s*([^\n\r]+)/i,
  ];

  let program = null;
  for (const pattern of programPatterns) {
    const match = text.match(pattern);
    if (match) {
      program = match[1].trim();
      break;
    }
  }

  // Student status extraction (Aktif Öğrenci, Mezun, etc.)
  const statusPatterns = [
    /(?:Öğrenci\s+)?(?:Durum|Statü)\s*:?\s*([^\n\r]+)/i,
    /(AKTİF\s+ÖĞRENCİ)/i,
    /(MEZUN)/i,
  ];

  let studentStatus = null;
  for (const pattern of statusPatterns) {
    const match = text.match(pattern);
    if (match) {
      studentStatus = match[1].trim();
      break;
    }
  }

  // If we found positive indicators OR extracted meaningful data, consider it verified
  if (!isVerified && studentName) {
    // Sometimes the portal shows student data without explicit "GEÇERLİ" text
    isVerified = true;
  }

  logger.info("Verification result parsed", {
    verified: isVerified,
    hasName: !!studentName,
    hasUniversity: !!university,
    hasProgram: !!program,
    hasStatus: !!studentStatus,
  });

  return {
    verified: isVerified,
    studentName,
    university,
    program,
    studentStatus: studentStatus || (isVerified ? "AKTİF" : "UNKNOWN"),
    rawMessage: isVerified
      ? "Document successfully verified via e-Devlet."
      : "Could not confirm document validity. The portal may have returned an unexpected response.",
  };
}

module.exports = { verifyOnEDevlet };
