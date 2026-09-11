import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { getTimeline } from "./timeline.controller.js";

const router = Router();

// Apply authentication middleware to all timeline routes
router.use(requireAuth);

/**
 * @route GET /api/patient/timeline
 * @description Get patient health timeline with pagination and filtering
 * @access Private
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page (max 50)
 * @query {string} [filter=ALL] - Filter by event type: ALL, CONSULTATION, INTAKE, DOCUMENT
 */
router.get("/", getTimeline);

export default router;