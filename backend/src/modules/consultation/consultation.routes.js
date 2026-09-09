import { Router } from "express";

import {
  create,
  getAll,
  getById,
} from "./consultation.controller.js";

import {
  consultationIdParamsSchema,
  createConsultationSchema,
} from "./consultation.validation.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

import { USER_ROLES } from "../../constants/roles.js";

const router = Router();

/**
 * All consultation routes require:
 * 1. Authentication
 * 2. PATIENT role
 */
router.use(
  requireAuth,
  requireRole(USER_ROLES.PATIENT)
);

/**
 * Create consultation
 */
router.post(
  "/",
  validate(createConsultationSchema),
  create
);

/**
 * Get all consultations of authenticated patient
 */
router.get(
  "/",
  getAll
);

/**
 * Get one consultation by ID
 */
router.get(
  "/:consultationId",
  validate(
    consultationIdParamsSchema,
    "params"
  ),
  getById
);

export default router;