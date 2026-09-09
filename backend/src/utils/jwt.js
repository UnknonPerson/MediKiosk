import jwt from "jsonwebtoken";

import env from "../config/env.js";

const JWT_ALGORITHM = "HS256";

function getExpiryDate(expiresIn) {
  if (typeof expiresIn === "number") {
    return new Date(Date.now() + expiresIn * 1000);
  }

  const match = /^(\d+)([smhdw])$/.exec(expiresIn);

  if (!match) {
    throw new Error("Unsupported JWT expiration format");
  }

  const value = Number(match[1]);
  const unit = match[2];
  const millisecondsByUnit = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * millisecondsByUnit[unit]);
}

export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      type: "access",
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
      algorithm: JWT_ALGORITHM,
    }
  );
}

export function generateRefreshToken({ userId, sessionId }) {
  return jwt.sign(
    {
      userId: userId.toString(),
      sessionId: sessionId.toString(),
      type: "refresh",
    },
    env.jwt.refreshSecret,
    {
      expiresIn: env.jwt.refreshExpiresIn,
      algorithm: JWT_ALGORITHM,
    }
  );
}

export function getRefreshTokenExpiryDate() {
  return getExpiryDate(env.jwt.refreshExpiresIn);
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, env.jwt.accessSecret, {
    algorithms: [JWT_ALGORITHM],
  });

  if (decoded.type !== "access" || !decoded.userId) {
    throw new jwt.JsonWebTokenError("Invalid access token");
  }

  return decoded;
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, env.jwt.refreshSecret, {
    algorithms: [JWT_ALGORITHM],
  });

  if (
    decoded.type !== "refresh" ||
    !decoded.userId ||
    !decoded.sessionId
  ) {
    throw new jwt.JsonWebTokenError("Invalid refresh token");
  }

  return decoded;
}
