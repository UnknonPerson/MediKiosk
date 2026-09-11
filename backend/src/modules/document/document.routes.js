import multer from "multer";
import { Router } from "express";

import env from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { USER_ROLES } from "../../constants/roles.js";
import ApiError from "../../utils/ApiError.js";

import { getAll, getById, remove, upload, getProcessingStatus } from "./document.controller.js";
import { SUPPORTED_MIME_TYPES } from "./document.constants.js";
import {
  documentIdParamsSchema,
  uploadDocumentSchema,
} from "./document.validation.js";

const router = Router();

const multipartUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.document.maxUploadBytes,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
      callback(new ApiError(400, "Only PDF, JPEG, and PNG files are supported."));
      return;
    }

    callback(null, true);
  },
});

function receiveDocument(req, res, next) {
  multipartUpload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new ApiError(413, "The document is larger than the allowed upload size."));
        return;
      }

      next(new ApiError(400, "Please upload one document using the file field."));
      return;
    }

    next(error);
  });
}

router.use(requireAuth, requireRole(USER_ROLES.PATIENT));

router.post("/", receiveDocument, validate(uploadDocumentSchema), upload);
router.get("/", getAll);
router.get("/:documentId/processing-status", validate(documentIdParamsSchema, "params"), getProcessingStatus);
router.get("/:documentId", validate(documentIdParamsSchema, "params"), getById);
router.delete("/:documentId", validate(documentIdParamsSchema, "params"), remove);

export default router;
