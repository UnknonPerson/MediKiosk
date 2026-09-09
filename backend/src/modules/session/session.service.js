import crypto from "crypto";

import Session from "./session.model.js";

export function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");
}

export function compareToken(token, storedTokenHash) {
  if (!storedTokenHash) {
    return false;
  }

  const tokenHashBuffer = Buffer.from(hashToken(token), "hex");
  const storedHashBuffer = Buffer.from(storedTokenHash, "hex");

  if (tokenHashBuffer.length !== storedHashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(tokenHashBuffer, storedHashBuffer);
}

export async function createSession({
  userId,
  userAgent = null,
  ipAddress = null,
  expiresAt,
}) {
  return Session.create({
    user: userId,
    userAgent,
    ipAddress,
    expiresAt,
  });
}

export async function setSessionRefreshToken({
  sessionId,
  refreshToken,
}) {
  return Session.findOneAndUpdate(
    {
      _id: sessionId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      refreshTokenHash: hashToken(refreshToken),
    },
    {
      new: true,
    }
  );
}

export async function findValidSession(sessionId) {
  return Session.findOne({
    _id: sessionId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select("+refreshTokenHash");
}

export async function rotateSessionRefreshToken({
  sessionId,
  currentRefreshTokenHash,
  newRefreshToken,
}) {
  return Session.findOneAndUpdate(
    {
      _id: sessionId,
      refreshTokenHash: currentRefreshTokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      refreshTokenHash: hashToken(newRefreshToken),
    },
    {
      new: true,
    }
  );
}

export async function revokeSession(sessionId) {
  return Session.findOneAndUpdate(
    {
      _id: sessionId,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    },
    {
      new: true,
    }
  );
}

export async function revokeAllUserSessions(userId) {
  return Session.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    }
  );
}
