import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      "Missing required environment variable: " + variable
    );
  }
}

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

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: getPositiveInteger("PORT", 5000),
  mongoUri: process.env.MONGODB_URI,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: getJwtDuration(
      "JWT_ACCESS_EXPIRES_IN",
      "15m"
    ),
    refreshExpiresIn: getJwtDuration(
      "JWT_REFRESH_EXPIRES_IN",
      "7d"
    ),
  },

  auth: {
    otpExpiresMinutes: getPositiveInteger(
      "OTP_EXPIRES_MINUTES",
      10
    ),
    maxOtpAttempts: getPositiveInteger(
      "OTP_MAX_ATTEMPTS",
      5
    ),
    verificationOtpResendCooldownSeconds: getPositiveInteger(
      "VERIFICATION_OTP_RESEND_COOLDOWN_SECONDS",
      60
    ),
    passwordResetOtpResendCooldownSeconds: getPositiveInteger(
      "PASSWORD_RESET_OTP_RESEND_COOLDOWN_SECONDS",
      60
    ),
    passwordResetTokenExpiresMinutes: getPositiveInteger(
      "PASSWORD_RESET_TOKEN_EXPIRES_MINUTES",
      10
    ),
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM,
  },
};

export default env;
