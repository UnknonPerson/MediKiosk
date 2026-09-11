import { Router } from "express";

import {
  getSummary,
} from "./summary.controller.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

import { USER_ROLES } from "../../constants/roles.js";

const router = Router();

/**
 * All summary routes require:
 * 1. Authentication
 * 2. PATIENT role (since doctor authorization doesn't exist, we restrict to patient only)
 */
router.use(
  requireAuth,
  requireRole(USER_ROLES.PATIENT)
);

/**
 * Get health summary for the authenticated patient
 */
router.get(
  "/",
  getSummary
);

export default router;