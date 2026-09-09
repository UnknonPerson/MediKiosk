import { z } from "zod";

import {
  QUESTION_SECTIONS,
  ANSWER_TYPES,
} from "./intake.engine.js";

/**
 * Validation contract for a question returned by the AI provider.
 * Additional section-progression and repetition checks are applied by the
 * question engine because they depend on the particular intake.
 */
export const dynamicQuestionSchema = z
  .object({
    questionId: z
      .string()
      .trim()
      .regex(
        /^[A-Za-z][A-Za-z0-9_-]{2,99}$/,
        "Question ID must be a safe identifier"
      ),

    section: z.enum(QUESTION_SECTIONS, {
      error: "Invalid question section",
    }),

    question: z
      .string()
      .trim()
      .min(5, "Question is too short")
      .max(500, "Question is too long"),

    answerType: z.enum(ANSWER_TYPES, {
      error: "Invalid answer type",
    }),

    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Option cannot be empty")
          .max(100, "Option is too long")
      )
      .min(2, "Select questions need at least two options")
      .max(10)
      .nullable(),

    required: z.boolean(),
  })
  .strict()
  .superRefine((data, ctx) => {
    /**
     * Select questions require options.
     */
    if (
      ["SINGLE_SELECT", "MULTI_SELECT"].includes(
        data.answerType
      )
    ) {
      if (!data.options) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message:
            "Select questions must contain options",
        });
      }
    }

    /**
     * Non-select questions should not contain options.
     */
    if (
      !["SINGLE_SELECT", "MULTI_SELECT"].includes(
        data.answerType
      ) &&
      data.options !== null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message:
          "Options are only allowed for select questions",
      });
    }

    if (data.options) {
      const normalizedOptions = data.options.map((option) =>
        option.toLocaleLowerCase()
      );

      if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "Question options must be unique",
      });
      }
    }
  });
