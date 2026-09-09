import { Resend } from "resend";

import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const resend = new Resend(env.resend.apiKey);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createOtpEmailHtml({
  heading,
  fullName,
  otp,
  description,
}) {
  const safeFullName = escapeHtml(fullName);
  const safeHeading = escapeHtml(heading);
  const safeDescription = escapeHtml(description);

  return [
    "<!DOCTYPE html>",
    "<html>",
    "<body style=\"font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;\">",
    "<div style=\"max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 12px;\">",
    "<h2>" + safeHeading + "</h2>",
    "<p>Hello " + safeFullName + ",</p>",
    "<p>" + safeDescription + "</p>",
    "<div style=\"font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center;\">",
    otp,
    "</div>",
    "<p>This OTP expires in 10 minutes.</p>",
    "<p>If you did not request this, you can safely ignore this email.</p>",
    "</div>",
    "</body>",
    "</html>",
  ].join("");
}

export async function sendEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: env.resend.emailFrom,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error(
        JSON.stringify({
          level: "error",
          event: "email.send_failed",
          provider: "resend",
          message: error.message,
        })
      );

      throw new ApiError(502, "Unable to send email");
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      JSON.stringify({
        level: "error",
        event: "email.send_failed",
        provider: "resend",
        errorName: error.name,
        message: error.message,
      })
    );

    throw new ApiError(502, "Unable to send email");
  }
}

export async function sendVerificationOtpEmail({
  to,
  fullName,
  otp,
}) {
  return sendEmail({
    to,
    subject: "Verify your Vaidyam account",
    html: createOtpEmailHtml({
      heading: "Verify your Vaidyam account",
      fullName,
      otp,
      description: "Use this OTP to verify your email address:",
    }),
  });
}

export async function sendPasswordResetOtpEmail({
  to,
  fullName,
  otp,
}) {
  return sendEmail({
    to,
    subject: "Reset your Vaidyam password",
    html: createOtpEmailHtml({
      heading: "Reset your Vaidyam password",
      fullName,
      otp,
      description: "Use this OTP to continue resetting your password:",
    }),
  });
}
