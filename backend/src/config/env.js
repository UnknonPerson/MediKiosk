import path from "node:path";

import dotenv from "dotenv";

dotenv.config();

/**
 * Environment variables that must always exist.
 */
const requiredEnvVariables = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "GEMINI_API_KEY",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      "Missing required environment variable: " + variable
    );
  }
}

/**
 * Validate positive integer environment variables.
 */
function getPositiveInteger(name, defaultValue) {
  const value = process.env[name] ?? defaultValue;

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(
      "Environment variable " +
        name +
        " must be a positive integer"
    );
  }

  return parsedValue;
}

/**
 * Validate JWT duration format.
 *
 * Examples:
 * 15m
 * 1h
 * 7d
 */
function getJwtDuration(name, defaultValue) {
  const value = process.env[name] || defaultValue;

  if (!/^\d+[smhdw]$/.test(value)) {
    throw new Error(
      "Environment variable " +
        name +
        " must use a positive duration such as 15m or 7d"
    );
  }

  return value;
}

const configuredFrontendUrls = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const localFrontendAliases = configuredFrontendUrls.flatMap((url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost") {
      parsed.hostname = "127.0.0.1";
      return [parsed.toString().replace(/\/$/, "")];
    }
    if (parsed.hostname === "127.0.0.1") {
      parsed.hostname = "localhost";
      return [parsed.toString().replace(/\/$/, "")];
    }
  } catch {
    // Leave malformed values for the CORS library to reject safely.
  }
  return [];
});

const env = {
  /**
   * Application
   */
  nodeEnv: process.env.NODE_ENV || "development",

  port: getPositiveInteger(
    "PORT",
    5000
  ),

  frontendUrl: configuredFrontendUrls[0],
  frontendUrls: [...new Set([...configuredFrontendUrls, ...localFrontendAliases])],

  document: {
    maxUploadBytes: getPositiveInteger(
      "DOCUMENT_MAX_UPLOAD_BYTES",
      10 * 1024 * 1024
    ),
    uploadDirectory: path.resolve(
      process.env.DOCUMENT_UPLOAD_DIR || "uploads/documents"
    ),
  },

  /**
   * Document Processing Service
   */
  pythonService: {
    url: process.env.PYTHON_SERVICE_URL || "http://localhost:8001",
    token: process.env.PYTHON_SERVICE_TOKEN || "",
    timeoutMs: getPositiveInteger(
      "PROCESSING_TIMEOUT_MS",
      120000
    ),
  },

  /**
   * Database
   */
  mongoUri: process.env.MONGODB_URI,

  /**
   * JWT
   */
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET,

    refreshSecret:
      process.env.JWT_REFRESH_SECRET,

    accessExpiresIn: getJwtDuration(
      "JWT_ACCESS_EXPIRES_IN",
      "15m"
    ),

    refreshExpiresIn: getJwtDuration(
      "JWT_REFRESH_EXPIRES_IN",
      "7d"
    ),
  },

  /**
   * Authentication configuration
   */
  auth: {
    otpExpiresMinutes: getPositiveInteger(
      "OTP_EXPIRES_MINUTES",
      10
    ),

    maxOtpAttempts: getPositiveInteger(
      "OTP_MAX_ATTEMPTS",
      5
    ),

    verificationOtpResendCooldownSeconds:
      getPositiveInteger(
        "VERIFICATION_OTP_RESEND_COOLDOWN_SECONDS",
        60
      ),

    passwordResetOtpResendCooldownSeconds:
      getPositiveInteger(
        "PASSWORD_RESET_OTP_RESEND_COOLDOWN_SECONDS",
        60
      ),

    passwordResetTokenExpiresMinutes:
      getPositiveInteger(
        "PASSWORD_RESET_TOKEN_EXPIRES_MINUTES",
        10
      ),
  },

  /**
   * Email service
   */
  resend: {
    apiKey:
      process.env.RESEND_API_KEY,

    emailFrom:
      process.env.EMAIL_FROM,
  },

  /**
   * Gemini AI configuration
   */
  gemini: {
    apiKey:
      process.env.GEMINI_API_KEY,

    model:
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash",
  },
};

export default env;
