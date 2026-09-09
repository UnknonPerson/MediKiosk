import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters");

const otpSchema = z
  .string()
  .regex(/^\d{6}$/, "OTP must be exactly 6 digits");

const resetTokenSchema = z
  .string()
  .regex(
    /^[a-f0-9]{64}$/i,
    "Password reset token is invalid"
  );

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters"),
    email: emailSchema,
    password: passwordSchema,
  })
  .strip();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  })
  .strip();

export const verifyEmailOtpSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
  })
  .strip();

export const resendVerificationOtpSchema = z
  .object({
    email: emailSchema,
  })
  .strip();

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  })
  .strip();

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .strip();

export const verifyPasswordResetOtpSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
  })
  .strip();

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    resetToken: resetTokenSchema,
    password: passwordSchema,
  })
  .strip();
