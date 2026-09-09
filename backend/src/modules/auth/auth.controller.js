import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutAllSessions,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendVerificationOtp,
  resetPassword,
  verifyEmailOtp,
  verifyPasswordResetOtp,
} from "./auth.service.js";

function sendSuccess(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);
    return sendSuccess(res, 201, result.message, {
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const result = await verifyEmailOtp(req.body);
    return sendSuccess(res, 200, result.message, {
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const result = await resendVerificationOtp(req.body);
    return sendSuccess(res, 200, result.message);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.get("user-agent") || null,
      ipAddress: req.ip || null,
    });

    return sendSuccess(res, 200, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await refreshAccessToken(req.body);
    return sendSuccess(res, 200, "Access token refreshed", result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await logoutUser(req.body);
    return sendSuccess(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(req, res, next) {
  try {
    await logoutAllSessions(req.user.id);
    return sendSuccess(res, 200, "Logged out from all sessions");
  } catch (error) {
    next(error);
  }
}

export async function forgotPasswordRequest(req, res, next) {
  try {
    const result = await forgotPassword(req.body);
    return sendSuccess(res, 200, result.message);
  } catch (error) {
    next(error);
  }
}

export async function verifyPasswordReset(req, res, next) {
  try {
    const result = await verifyPasswordResetOtp(req.body);
    return sendSuccess(res, 200, result.message, {
      resetToken: result.resetToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordRequest(req, res, next) {
  try {
    await resetPassword(req.body);
    return sendSuccess(
      res,
      200,
      "Password reset successfully. Please log in again."
    );
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    return sendSuccess(res, 200, "Current user retrieved", {
      user,
    });
  } catch (error) {
    next(error);
  }
}
