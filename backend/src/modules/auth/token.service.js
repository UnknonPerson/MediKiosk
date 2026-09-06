import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';
import Session from './session.model.js';

function accessTokenSecret() {
  if (!env.auth.accessTokenSecret) {
    throw new ApiError(500, 'Authentication service is not configured', {
      code: 'AUTH_CONFIGURATION_ERROR',
    });
  }

  return env.auth.accessTokenSecret;
}

export function assertAccessTokenConfiguration() {
  accessTokenSecret();
}

function invalidRefreshToken() {
  return new ApiError(401, 'Invalid or expired refresh token', {
    code: 'INVALID_REFRESH_TOKEN',
  });
}

function refreshTokenExpiryDate() {
  return new Date(Date.now() + (env.auth.refreshTokenTtlDays * 24 * 60 * 60 * 1000));
}

export function generateAccessToken(user) {
  if (!user?._id || !user.accountType) {
    throw new TypeError('A persisted user with an account type is required to generate an access token');
  }

  return jwt.sign({
    sub: user._id.toString(),
    accountType: user.accountType,
  }, accessTokenSecret(), {
    algorithm: 'HS256',
    expiresIn: env.auth.accessTokenTtlSeconds,
    issuer: env.auth.jwtIssuer,
    audience: env.auth.jwtAudience,
  });
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('base64url');
}

export function hashRefreshToken(token) {
  if (typeof token !== 'string' || token.length === 0) {
    throw invalidRefreshToken();
  }

  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export function verifyAccessToken(token) {
  if (typeof token !== 'string' || token.length === 0) {
    throw new jwt.JsonWebTokenError('Access token is required');
  }

  return jwt.verify(token, accessTokenSecret(), {
    algorithms: ['HS256'],
    issuer: env.auth.jwtIssuer,
    audience: env.auth.jwtAudience,
  });
}

export async function createSession({
  userId,
  refreshToken,
  deviceInfo,
  ipAddress,
  expiresAt,
  databaseSession,
} = {}) {
  if (!userId) {
    throw new TypeError('userId is required to create a session');
  }

  const rawRefreshToken = refreshToken || generateRefreshToken();
  const sessionData = {
    userId,
    refreshTokenHash: hashRefreshToken(rawRefreshToken),
    deviceInfo,
    ipAddress,
    expiresAt: expiresAt || refreshTokenExpiryDate(),
  };
  const [session] = databaseSession
    ? await Session.create([sessionData], { session: databaseSession })
    : [await Session.create(sessionData)];

  return { session, refreshToken: rawRefreshToken };
}

export async function rotateRefreshToken(refreshToken, { deviceInfo, ipAddress } = {}) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const now = new Date();
  const previousSession = await Session.findOneAndUpdate({
    refreshTokenHash,
    revokedAt: null,
    expiresAt: { $gt: now },
  }, {
    $set: { revokedAt: now },
  }, {
    new: true,
  });

  if (!previousSession) {
    throw invalidRefreshToken();
  }

  const nextSession = await createSession({
    userId: previousSession.userId,
    deviceInfo: deviceInfo || previousSession.deviceInfo,
    ipAddress: ipAddress || previousSession.ipAddress,
  });

  return {
    userId: previousSession.userId,
    ...nextSession,
  };
}

export async function revokeSession(refreshToken) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const result = await Session.updateOne({
    refreshTokenHash,
    revokedAt: null,
  }, {
    $set: { revokedAt: new Date() },
  });

  return result.modifiedCount === 1;
}

export const accessTokenExpiresIn = env.auth.accessTokenTtlSeconds;
