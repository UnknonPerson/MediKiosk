import { z } from "zod";

const mongoIdSchema = z
  .string()
  .trim()
  .regex(
    /^[a-f\d]{24}$/i,
    "Invalid MongoDB ID"
  );

/**
 * Create an intake for an existing consultation.
 *
 * The consultation determines whether the intake
 * is MODERN or AYUSH.
 */
export const createIntakeSchema = z
  .object({
    consultationId: mongoIdSchema,
  })
  .strip();

/**
 * Validate an answer submitted for the current question.
 *
 * The frontend sends ONLY the answer.
 *
 * The backend gets question metadata from:
 *
 * intake.currentQuestion
 *
 * Actual validation based on:
 * - answerType
 * - options
 * - required
 *
 * happens inside the service layer.
 */
export const submitIntakeAnswerSchema = z
  .object({
    answer: z
      .union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.unknown()),
        z.null(),
      ]),
  })
  .strict();

export const intakeIdParamsSchema = z
  .object({
    intakeId: mongoIdSchema,
  })
  .strip();
