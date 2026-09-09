import { z } from "zod";

const genderValues = [
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
];

const preferredLanguageSchema = z
  .string()
  .trim()
  .min(2, "Preferred language must be at least 2 characters")
  .max(50, "Preferred language cannot exceed 50 characters");

const consentSchema = z
  .object({
    medicalDataProcessing: z.boolean(),
    documentProcessing: z.boolean(),
    aiProcessing: z.boolean(),
  })
  .strip();

export const createPatientProfileSchema = z
  .object({
    dateOfBirth: z.coerce
      .date({
        error: "Please provide a valid date of birth",
      })
      .max(new Date(), "Date of birth cannot be in the future")
      .optional(),

    gender: z
      .enum(genderValues, {
        error: "Please provide a valid gender",
      })
      .optional(),

    preferredLanguage: preferredLanguageSchema.optional(),

    consent: consentSchema.optional(),
  })
  .strip();

export const updatePatientProfileSchema = z
  .object({
    dateOfBirth: z.coerce
      .date({
        error: "Please provide a valid date of birth",
      })
      .max(new Date(), "Date of birth cannot be in the future")
      .nullable()
      .optional(),

    gender: z
      .enum(genderValues, {
        error: "Please provide a valid gender",
      })
      .optional(),

    preferredLanguage: preferredLanguageSchema.optional(),
  })
  .strip()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one profile field to update"
  );

export const updatePatientConsentSchema = z
  .object({
    medicalDataProcessing: z.boolean().optional(),

    documentProcessing: z.boolean().optional(),

    aiProcessing: z.boolean().optional(),
  })
  .strip()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one consent field to update"
  );
