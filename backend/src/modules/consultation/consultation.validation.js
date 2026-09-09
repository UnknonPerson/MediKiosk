import { z } from "zod";

const healthcareSystemValues = [
  "MODERN",
  "AYUSH",
];

/**
 * Create a new consultation.
 *
 * Detailed MODERN and AYUSH intake validation
 * will be handled separately later.
 */
export const createConsultationSchema = z
  .object({
    healthcareSystem: z.enum(
      healthcareSystemValues,
      {
        error: "Please select a valid healthcare system",
      }
    ),

    chiefComplaint: z
      .string()
      .trim()
      .min(
        3,
        "Chief complaint must be at least 3 characters"
      )
      .max(
        1000,
        "Chief complaint cannot exceed 1000 characters"
      ),
  })
  .strip();

  const mongoIdSchema = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Invalid consultation ID"
  );

export const consultationIdParamsSchema = z
  .object({
    consultationId: mongoIdSchema,
  })
  .strip();