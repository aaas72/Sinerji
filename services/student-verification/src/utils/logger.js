/**
 * ============================================================
 * Minimal Structured Logger
 * ============================================================
 * Provides simple, structured logging that is KVKK-safe.
 *
 * CRITICAL RULE: This logger must NEVER output any PII
 * (T.C. Kimlik No, Barkod, student names, etc.).
 * Only operational/diagnostic information is logged.
 */

const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

/**
 * Formats and prints a structured log line.
 * @param {"INFO"|"WARN"|"ERROR"|"DEBUG"} level
 * @param {string} message — Must NOT contain PII
 * @param {object} [meta] — Optional metadata object (must NOT contain PII)
 */
function log(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "student-verification",
    message,
    ...meta,
  };

  // In production, output pure JSON for log aggregators (e.g., Datadog, ELK)
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry));
  } else {
    // In development, output a human-readable format
    const metaStr = Object.keys(meta).length
      ? ` | ${JSON.stringify(meta)}`
      : "";
    console.log(
      `[${entry.timestamp}] [${level}] ${message}${metaStr}`
    );
  }
}

module.exports = {
  info: (msg, meta) => log(LOG_LEVELS.INFO, msg, meta),
  warn: (msg, meta) => log(LOG_LEVELS.WARN, msg, meta),
  error: (msg, meta) => log(LOG_LEVELS.ERROR, msg, meta),
  debug: (msg, meta) => log(LOG_LEVELS.DEBUG, msg, meta),
};
