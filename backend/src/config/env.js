import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(configDirectory, '../../.env'), quiet: true });

function required(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function integer(name, defaultValue, { min, max }) {
  const rawValue = process.env[name];
  const value = rawValue === undefined ? defaultValue : Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`Environment variable ${name} must be an integer between ${min} and ${max}`);
  }

  return value;
}

function boolean(name, defaultValue = false) {
  const rawValue = process.env[name];

  if (rawValue === undefined) return defaultValue;
  if (rawValue === 'true') return true;
  if (rawValue === 'false') return false;

  throw new Error(`Environment variable ${name} must be true or false`);
}

function optionalSecret(name) {
  const value = process.env[name]?.trim();

  if (!value) return undefined;

  if (Buffer.byteLength(value, 'utf8') < 32) {
    throw new Error(`Environment variable ${name} must be at least 32 bytes long`);
  }

  return value;
}

function optionalValue(name) {
  return process.env[name]?.trim() || undefined;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (nodeEnv === 'production' && configuredOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must be configured in production');
}

const developmentOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const serviceName = process.env.SERVICE_NAME?.trim() || 'vaidyam-api';
const accessTokenSecret = optionalSecret('JWT_ACCESS_TOKEN_SECRET');
const otpHashSecret = optionalSecret('OTP_HASH_SECRET');
const otpProvider = (process.env.OTP_PROVIDER?.trim() || 'mock').toLowerCase();
const abhaProvider = (process.env.ABHA_PROVIDER?.trim() || 'mock').toLowerCase();
const aadhaarProvider = (process.env.AADHAAR_PROVIDER?.trim() || 'mock').toLowerCase();
const identityMockChallengeSecret = optionalSecret('IDENTITY_MOCK_CHALLENGE_SECRET');
const identityLinkHashSecret = optionalSecret('IDENTITY_LINK_HASH_SECRET');
const identityMockLogCodes = boolean('IDENTITY_MOCK_LOG_CODES');
const cloudinary = {
  cloudName: optionalValue('CLOUDINARY_CLOUD_NAME'),
  apiKey: optionalValue('CLOUDINARY_API_KEY'),
  apiSecret: optionalValue('CLOUDINARY_API_SECRET'),
};
const suppliedCloudinaryValues = Object.values(cloudinary).filter(Boolean).length;
const cloudinaryConfigured = suppliedCloudinaryValues === 3;

if (nodeEnv === 'production' && !accessTokenSecret) {
  throw new Error('JWT_ACCESS_TOKEN_SECRET must be configured in production');
}

if (nodeEnv === 'production' && !otpHashSecret) {
  throw new Error('OTP_HASH_SECRET must be configured in production');
}

if (otpProvider !== 'mock') {
  throw new Error(`Unsupported OTP_PROVIDER: ${otpProvider}`);
}

if (nodeEnv === 'production' && otpProvider === 'mock') {
  throw new Error('OTP_PROVIDER=mock cannot be used in production');
}

if (!['mock', 'abdm'].includes(abhaProvider)) {
  throw new Error(`Unsupported ABHA_PROVIDER: ${abhaProvider}`);
}

if (!['mock', 'production'].includes(aadhaarProvider)) {
  throw new Error(`Unsupported AADHAAR_PROVIDER: ${aadhaarProvider}`);
}

if (nodeEnv === 'production' && (abhaProvider === 'mock' || aadhaarProvider === 'mock')) {
  throw new Error('Mock identity providers cannot be used in production');
}

if (identityMockLogCodes && nodeEnv !== 'development') {
  throw new Error('IDENTITY_MOCK_LOG_CODES can only be enabled in development');
}

if (suppliedCloudinaryValues > 0 && !cloudinaryConfigured) {
  throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be configured together');
}

if (nodeEnv === 'production' && !cloudinaryConfigured) {
  throw new Error('Cloudinary credentials must be configured in production');
}

const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development',
  serviceName,
  server: {
    port: integer('PORT', 7200, { min: 1, max: 65535 }),
    trustProxy: boolean('TRUST_PROXY'),
  },
  database: {
    uri: required('MONGODB_URI'),
  },
  cors: {
    origins: configuredOrigins.length > 0 ? configuredOrigins : developmentOrigins,
  },
  rateLimit: {
    windowMs: integer('API_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000, {
      min: 1_000,
      max: 24 * 60 * 60 * 1000,
    }),
    max: integer('API_RATE_LIMIT_MAX', 300, { min: 1, max: 10_000 }),
  },
  auth: {
    accessTokenSecret,
    accessTokenTtlSeconds: integer('JWT_ACCESS_TOKEN_TTL_SECONDS', 900, {
      min: 60,
      max: 86_400,
    }),
    refreshTokenTtlDays: integer('REFRESH_TOKEN_TTL_DAYS', 30, {
      min: 1,
      max: 90,
    }),
    jwtIssuer: process.env.JWT_ISSUER?.trim() || serviceName,
    jwtAudience: process.env.JWT_AUDIENCE?.trim() || 'vaidyam-client',
  },
  otp: {
    hashSecret: otpHashSecret,
    provider: otpProvider,
    mockLogCodes: boolean('OTP_MOCK_LOG_CODES'),
    length: integer('OTP_LENGTH', 6, { min: 4, max: 8 }),
    expiryMinutes: integer('OTP_EXPIRY_MINUTES', 5, { min: 1, max: 15 }),
    maxAttempts: integer('OTP_MAX_ATTEMPTS', 5, { min: 1, max: 10 }),
    rateLimit: {
      windowMs: integer('OTP_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000, {
        min: 60_000,
        max: 24 * 60 * 60 * 1000,
      }),
      sendMax: integer('OTP_SEND_RATE_LIMIT_MAX', 5, { min: 1, max: 30 }),
      verifyMax: integer('OTP_VERIFY_RATE_LIMIT_MAX', 10, { min: 1, max: 50 }),
    },
  },
  identity: {
    abhaProvider,
    aadhaarProvider,
    mockChallengeSecret: identityMockChallengeSecret,
    linkHashSecret: identityLinkHashSecret,
    mockLogCodes: identityMockLogCodes,
    challengeLength: integer('IDENTITY_MOCK_CHALLENGE_LENGTH', 6, { min: 4, max: 8 }),
    challengeExpiryMinutes: integer('IDENTITY_MOCK_CHALLENGE_EXPIRY_MINUTES', 5, {
      min: 1,
      max: 15,
    }),
    maxAttempts: integer('IDENTITY_MOCK_MAX_ATTEMPTS', 5, { min: 1, max: 10 }),
    rateLimit: {
      windowMs: integer('IDENTITY_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000, {
        min: 60_000,
        max: 24 * 60 * 60 * 1000,
      }),
      initiateMax: integer('IDENTITY_INITIATE_RATE_LIMIT_MAX', 5, { min: 1, max: 30 }),
      verifyMax: integer('IDENTITY_VERIFY_RATE_LIMIT_MAX', 10, { min: 1, max: 50 }),
    },
  },
  cloudinary: {
    ...cloudinary,
    configured: cloudinaryConfigured,
  },
  uploads: {
    maxProfilePhotoSize: integer('MAX_PROFILE_PHOTO_SIZE', 5 * 1024 * 1024, {
      min: 1_024,
      max: 10 * 1024 * 1024,
    }),
    maxDocumentSize: integer('MAX_DOCUMENT_SIZE', 10 * 1024 * 1024, {
      min: 1_024,
      max: 25 * 1024 * 1024,
    }),
  },
});

export default env;
