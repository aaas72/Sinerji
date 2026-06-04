/**
 * ============================================================
 * Centralized Configuration Module
 * ============================================================
 * Loads environment variables from .env file and validates
 * that all required secrets are present before the service
 * starts accepting requests.
 */

const dotenv = require("dotenv");
const path = require("path");

// Load .env from the microservice root (two levels up from /src/config/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  /** Port the Express server listens on */
  PORT: parseInt(process.env.PORT, 10) || 4000,

  /** Shared secret for authenticating requests from the Sinerji main server */
  SINERJI_MICROSERVICE_SECRET: process.env.SINERJI_MICROSERVICE_SECRET,

  /** Current runtime environment */
  NODE_ENV: process.env.NODE_ENV || "development",

  /** Whether we are running in production */
  isProduction: process.env.NODE_ENV === "production",
};

// ---------------------------------------------------------------------------
// Startup validation — fail fast if critical config is missing
// ---------------------------------------------------------------------------
const REQUIRED_VARS = ["SINERJI_MICROSERVICE_SECRET"];

for (const varName of REQUIRED_VARS) {
  if (!config[varName] || config[varName] === "change-me-to-a-strong-random-secret") {
    console.error(
      `[FATAL] Missing or default value for required environment variable: ${varName}.\n` +
      `Please set it in your .env file. See .env.example for reference.`
    );
    process.exit(1);
  }
}

module.exports = config;
