import { Router } from "express";

import {
  forgotPasswordRequest,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
  resendVerification,
  resetPasswordRequest,
  verifyEmail,
  verifyPasswordReset,
} from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resendVerificationOtpSchema,
  resetPasswordSchema,
  verifyEmailOtpSchema,
  verifyPasswordResetOtpSchema,
} from "./auth.validation.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post(
  "/verify-email",
  validate(verifyEmailOtpSchema),
  verifyEmail
);
router.post(
  "/resend-verification-otp",
  validate(resendVerificationOtpSchema),
  resendVerification
);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshTokenSchema), refresh);
router.post("/logout", validate(refreshTokenSchema), logout);
router.post("/logout-all", requireAuth, logoutAll);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordRequest
);
router.post(
  "/verify-password-reset-otp",
  validate(verifyPasswordResetOtpSchema),
  verifyPasswordReset
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordRequest
);
router.get("/me", requireAuth, me);

export default router;
