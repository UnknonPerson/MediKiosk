import { Router } from "express";

import {
  createProfile,
  getProfile,
  updateConsent,
  updateProfile,
} from "./patient.controller.js";

import {
  createPatientProfileSchema,
  updatePatientConsentSchema,
  updatePatientProfileSchema,
} from "./patient.validation.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

import { USER_ROLES } from "../../constants/roles.js";

const router = Router();

/**
 * All patient routes require:
 * 1. Authentication
 * 2. PATIENT role
 */
router.use(
  requireAuth,
  requireRole(USER_ROLES.PATIENT)
);

/**
 * Create patient profile
 */
router.post(
  "/profile",
  validate(createPatientProfileSchema),
  createProfile
);

/**
 * Get authenticated patient's profile
 */
router.get(
  "/profile",
  getProfile
);

/**
 * Update authenticated patient's profile
 */
router.patch(
  "/profile",
  validate(updatePatientProfileSchema),
  updateProfile
);

/**
 * Update authenticated patient's consent
 */
router.patch(
  "/consent",
  validate(updatePatientConsentSchema),
  updateConsent
);

export default router;