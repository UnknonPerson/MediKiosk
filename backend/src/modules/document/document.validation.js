import { z } from "zod";

import { DOCUMENT_TYPES } from "./document.constants.js";

const mongoIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ID");

export const uploadDocumentSchema = z
  .object({
    documentType: z.enum(DOCUMENT_TYPES),
    consultationId: mongoIdSchema.optional(),
  })
  .strip();

export const documentIdParamsSchema = z
  .object({
    documentId: mongoIdSchema,
  })
  .strip();
