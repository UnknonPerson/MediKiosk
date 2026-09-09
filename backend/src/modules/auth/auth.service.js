import crypto from "crypto";

import User from "../users/user.model.js";
import {
  compareToken,
  createSession,
  findValidSession,
  hashToken,
  revokeAllUserSessions,
  revokeSession,
  rotateSessionRefreshToken,
  setSessionRefreshToken,
} from "../session/session.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiryDate,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import {
  compareOtp,
  generateOtp,
  getOtpExpiryDate,
  hashOtp,
} from "../../utils/otp.js";
import {
  sendPasswordResetOtpEmail,
  sendVerificationOtpEmail,
} from "../../services/email.service.js";
import {
  ACCOUNT_STATUS,
  USER_ROLES,
} from "../../constants/roles.js";
import env from "../../config/env.js";
import ApiError from "../../utils/ApiError.js";

const GENERIC_PASSWORD_RESET_MESSAGE =
  "If an eligible account exists, a password reset OTP has been sent.";

const GENERIC_RESEND_MESSAGE =
  "If an unverified account exists, a new verification OTP has been sent.";

function getCooldownRemainingSeconds(lastSentAt, cooldownSeconds) {
  if (!lastSentAt) {
    return 0;
  }

  const elapsedMilliseconds = Date.now() - lastSentAt.getTime();
  const cooldownMilliseconds = cooldownSeconds * 1000;

  if (elapsedMilliseconds >= cooldownMilliseconds) {
    return 0;
  }

  return Math.ceil(
    (cooldownMilliseconds - elapsedMilliseconds) / 1000
  );
}

function clearEmailVerificationOtp(user) {
  user.emailVerificationOtpHash = undefined;
  user.emailVerificationOtpExpires = undefined;
  user.emailVerificationOtpAttempts = 0;
  user.emailVerificationOtpLastSentAt = null;
}

function clearPasswordResetOtp(user) {
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpires = undefined;
  user.passwordResetOtpAttempts = 0;
  user.passwordResetOtpLastSentAt = null;
}

function clearPasswordResetToken(user) {
  user.passwordResetTokenHash = undefined;
  user.passwordResetTokenExpires = undefined;
}

async function sendAndPersistEmailVerificationOtp(user) {
  const previousOtpState = {
    hash: user.emailVerificationOtpHash,
    expires: user.emailVerificationOtpExpires,
    attempts: user.emailVerificationOtpAttempts,
    lastSentAt: user.emailVerificationOtpLastSentAt,
  };
  const otp = generateOtp();

  user.emailVerificationOtpHash = hashOtp(otp);
  user.emailVerificationOtpExpires = getOtpExpiryDate(
    env.auth.otpExpiresMinutes
  );
  user.emailVerificationOtpAttempts = 0;
  user.emailVerificationOtpLastSentAt = new Date();

  await user.save();

  try {
    await sendVerificationOtpEmail({
      to: user.email,
      fullName: user.fullName,
      otp,
    });
  } catch (error) {
    user.emailVerificationOtpHash = previousOtpState.hash;
    user.emailVerificationOtpExpires = previousOtpState.expires;
    user.emailVerificationOtpAttempts = previousOtpState.attempts;
    user.emailVerificationOtpLastSentAt = previousOtpState.lastSentAt;

    await user.save();
    throw error;
  }
}

async function sendAndPersistPasswordResetOtp(user) {
  const previousOtpState = {
    hash: user.passwordResetOtpHash,
    expires: user.passwordResetOtpExpires,
    attempts: user.passwordResetOtpAttempts,
    lastSentAt: user.passwordResetOtpLastSentAt,
  };
  const otp = generateOtp();

  user.passwordResetOtpHash = hashOtp(otp);
  user.passwordResetOtpExpires = getOtpExpiryDate(
    env.auth.otpExpiresMinutes
  );
  user.passwordResetOtpAttempts = 0;
  user.passwordResetOtpLastSentAt = new Date();
  clearPasswordResetToken(user);

  await user.save();

  try {
    await sendPasswordResetOtpEmail({
      to: user.email,
      fullName: user.fullName,
      otp,
    });
  } catch (error) {
    user.passwordResetOtpHash = previousOtpState.hash;
    user.passwordResetOtpExpires = previousOtpState.expires;
    user.passwordResetOtpAttempts = previousOtpState.attempts;
    user.passwordResetOtpLastSentAt = previousOtpState.lastSentAt;

    await user.save();
    throw error;
  }
}

function getRefreshTokenPayload(refreshToken) {
  try {
    return verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}

async function getSessionForRefreshToken(refreshToken) {
  const payload = getRefreshTokenPayload(refreshToken);
  const session = await findValidSession(payload.sessionId);

  if (
    !session ||
    session.user.toString() !== payload.userId ||
    !compareToken(refreshToken, session.refreshTokenHash)
  ) {
    if (session && session.user.toString() === payload.userId) {
      await revokeSession(session._id);
    }

    throw new ApiError(401, "Invalid or expired refresh token");
  }

  return {
    payload,
    session,
  };
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId).select("+isDeleted");

  if (!user || user.isDeleted) {
    throw new ApiError(401, "Authentication required");
  }

  if (
    user.accountStatus !== ACCOUNT_STATUS.ACTIVE ||
    !user.emailVerified
  ) {
    throw new ApiError(403, "This account is not active");
  }

  return user;
}

export async function registerUser({ fullName, email, password }) {
  const existingUser = await User.findOne({ email }).select("_id");

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const otp = generateOtp();
  const user = await User.create({
    fullName,
    email,
    password,
    role: USER_ROLES.PATIENT,
    accountStatus: ACCOUNT_STATUS.PENDING_VERIFICATION,
    emailVerificationOtpHash: hashOtp(otp),
    emailVerificationOtpExpires: getOtpExpiryDate(
      env.auth.otpExpiresMinutes
    ),
    emailVerificationOtpAttempts: 0,
    emailVerificationOtpLastSentAt: new Date(),
  });

  try {
    await sendVerificationOtpEmail({
      to: user.email,
      fullName: user.fullName,
      otp,
    });
  } catch (error) {
    await user.deleteOne();
    throw error;
  }

  return {
    user,
    message: "Registration successful. Please verify your email.",
  };
}

export async function verifyEmailOtp({ email, otp }) {
  const user = await User.findOne({
    email,
    isDeleted: false,
  }).select(
    "+emailVerificationOtpHash " +
      "+emailVerificationOtpExpires " +
      "+emailVerificationOtpAttempts " +
      "+emailVerificationOtpLastSentAt"
  );

  if (!user) {
    throw new ApiError(400, "Invalid verification request");
  }

  if (user.emailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  if (
    !user.emailVerificationOtpHash ||
    !user.emailVerificationOtpExpires
  ) {
    throw new ApiError(400, "No verification OTP found");
  }

  if (
    user.emailVerificationOtpAttempts >=
    env.auth.maxOtpAttempts
  ) {
    throw new ApiError(
      429,
      "Too many invalid OTP attempts. Please request a new OTP."
    );
  }

  if (user.emailVerificationOtpExpires <= new Date()) {
    throw new ApiError(
      400,
      "OTP has expired. Please request a new OTP."
    );
  }

  if (!compareOtp(otp, user.emailVerificationOtpHash)) {
    user.emailVerificationOtpAttempts += 1;
    await user.save();

    if (
      user.emailVerificationOtpAttempts >=
      env.auth.maxOtpAttempts
    ) {
      throw new ApiError(
        429,
        "Too many invalid OTP attempts. Please request a new OTP."
      );
    }

    throw new ApiError(400, "Invalid OTP");
  }

  user.emailVerified = true;
  user.accountStatus = ACCOUNT_STATUS.ACTIVE;
  clearEmailVerificationOtp(user);
  await user.save();

  return {
    user,
    message: "Email verified successfully. Your account is now active.",
  };
}

export async function resendVerificationOtp({ email }) {
  const user = await User.findOne({
    email,
    isDeleted: false,
  }).select(
    "+emailVerificationOtpHash " +
      "+emailVerificationOtpExpires " +
      "+emailVerificationOtpAttempts " +
      "+emailVerificationOtpLastSentAt"
  );

  if (!user) {
    return { message: GENERIC_RESEND_MESSAGE };
  }

  if (user.emailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  if (
    user.accountStatus !==
    ACCOUNT_STATUS.PENDING_VERIFICATION
  ) {
    throw new ApiError(403, "This account cannot be verified");
  }

  const remainingSeconds = getCooldownRemainingSeconds(
    user.emailVerificationOtpLastSentAt,
    env.auth.verificationOtpResendCooldownSeconds
  );

  if (remainingSeconds > 0) {
    throw new ApiError(
      429,
      "Please wait " +
        remainingSeconds +
        " seconds before requesting another OTP."
    );
  }

  await sendAndPersistEmailVerificationOtp(user);

  return {
    message: "A new verification OTP has been sent.",
  };
}

export async function loginUser({
  email,
  password,
  userAgent,
  ipAddress,
}) {
  const user = await User.findOne({
    email,
    isDeleted: false,
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (
    user.accountStatus !== ACCOUNT_STATUS.ACTIVE ||
    !user.emailVerified
  ) {
    throw new ApiError(403, "Your account is currently not active");
  }

  const session = await createSession({
    userId: user._id,
    userAgent,
    ipAddress,
    expiresAt: getRefreshTokenExpiryDate(),
  });
  const refreshToken = generateRefreshToken({
    userId: user._id,
    sessionId: session._id,
  });
  const updatedSession = await setSessionRefreshToken({
    sessionId: session._id,
    refreshToken,
  });

  if (!updatedSession) {
    await revokeSession(session._id);
    throw new ApiError(500, "Unable to create an authenticated session");
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken,
  };
}

export async function refreshAccessToken({ refreshToken }) {
  const { session } = await getSessionForRefreshToken(refreshToken);
  const user = await getCurrentUser(session.user);
  const newRefreshToken = generateRefreshToken({
    userId: user._id,
    sessionId: session._id,
  });
  const updatedSession = await rotateSessionRefreshToken({
    sessionId: session._id,
    currentRefreshTokenHash: session.refreshTokenHash,
    newRefreshToken,
  });

  if (!updatedSession) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  return {
    accessToken: generateAccessToken(user),
    refreshToken: newRefreshToken,
  };
}

export async function logoutUser({ refreshToken }) {
  const { session } = await getSessionForRefreshToken(refreshToken);
  const revokedSession = await revokeSession(session._id);

  if (!revokedSession) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}

export async function logoutAllSessions(userId) {
  await revokeAllUserSessions(userId);
}

export async function forgotPassword({ email }) {
  const user = await User.findOne({
    email,
    isDeleted: false,
  }).select(
    "+passwordResetOtpHash " +
      "+passwordResetOtpExpires " +
      "+passwordResetOtpAttempts " +
      "+passwordResetOtpLastSentAt " +
      "+passwordResetTokenHash " +
      "+passwordResetTokenExpires"
  );

  if (
    !user ||
    !user.emailVerified ||
    user.accountStatus !== ACCOUNT_STATUS.ACTIVE
  ) {
    return { message: GENERIC_PASSWORD_RESET_MESSAGE };
  }

  const remainingSeconds = getCooldownRemainingSeconds(
    user.passwordResetOtpLastSentAt,
    env.auth.passwordResetOtpResendCooldownSeconds
  );

  if (remainingSeconds === 0) {
    await sendAndPersistPasswordResetOtp(user);
  }

  return { message: GENERIC_PASSWORD_RESET_MESSAGE };
}

export async function verifyPasswordResetOtp({ email, otp }) {
  const user = await User.findOne({
    email,
    isDeleted: false,
  }).select(
    "+passwordResetOtpHash " +
      "+passwordResetOtpExpires " +
      "+passwordResetOtpAttempts " +
      "+passwordResetOtpLastSentAt " +
      "+passwordResetTokenHash " +
      "+passwordResetTokenExpires"
  );

  if (
    !user ||
    !user.emailVerified ||
    user.accountStatus !== ACCOUNT_STATUS.ACTIVE ||
    !user.passwordResetOtpHash ||
    !user.passwordResetOtpExpires
  ) {
    throw new ApiError(400, "Invalid password reset request");
  }

  if (
    user.passwordResetOtpAttempts >=
    env.auth.maxOtpAttempts
  ) {
    throw new ApiError(
      429,
      "Too many invalid OTP attempts. Please request a new OTP."
    );
  }

  if (user.passwordResetOtpExpires <= new Date()) {
    throw new ApiError(
      400,
      "Password reset OTP has expired. Please request a new OTP."
    );
  }

  if (!compareOtp(otp, user.passwordResetOtpHash)) {
    user.passwordResetOtpAttempts += 1;
    await user.save();

    if (
      user.passwordResetOtpAttempts >=
      env.auth.maxOtpAttempts
    ) {
      throw new ApiError(
        429,
        "Too many invalid OTP attempts. Please request a new OTP."
      );
    }

    throw new ApiError(400, "Invalid OTP");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  clearPasswordResetOtp(user);
  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetTokenExpires = getOtpExpiryDate(
    env.auth.passwordResetTokenExpiresMinutes
  );
  await user.save();

  return {
    resetToken,
    message: "Password reset OTP verified successfully.",
  };
}

export async function resetPassword({ email, resetToken, password }) {
  const user = await User.findOne({
    email,
    isDeleted: false,
  }).select(
    "+passwordResetTokenHash " +
      "+passwordResetTokenExpires"
  );

  if (
    !user ||
    !user.emailVerified ||
    user.accountStatus !== ACCOUNT_STATUS.ACTIVE ||
    !user.passwordResetTokenHash ||
    !user.passwordResetTokenExpires ||
    user.passwordResetTokenExpires <= new Date() ||
    !compareToken(resetToken, user.passwordResetTokenHash)
  ) {
    throw new ApiError(
      401,
      "Invalid or expired password reset request"
    );
  }

  user.password = password;
  clearPasswordResetOtp(user);
  clearPasswordResetToken(user);

  await revokeAllUserSessions(user._id);
  await user.save();
}
