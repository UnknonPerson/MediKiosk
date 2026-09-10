import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
  create,
  getAnswers,
  getByConsultation,
  getById,
  getQuestion,
  submitAnswer,
} from "./intake.controller.js";

import {
  createIntakeSchema,
  consultationIdParamsSchema,
  intakeIdParamsSchema,
  submitIntakeAnswerSchema,
} from "./intake.validation.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

import { USER_ROLES } from "../../constants/roles.js";
import ApiError from "../../utils/ApiError.js";

const router = Router();

const questionGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  handler(req, res, next) {
    next(
      new ApiError(
        429,
        "Too many intake question requests. Please try again shortly."
      )
    );
  },
});

/**
 * All intake routes require authentication
 * and a PATIENT account.
 */
router.use(
  requireAuth,
  requireRole(USER_ROLES.PATIENT)
);

/**
 * Create an intake for an existing consultation.
 */
router.post(
  "/",
  validate(createIntakeSchema),
  create
);

/**
 * Get the currently active intake question.
 *
 * If no question is currently stored,
 * the backend generates the next dynamic question.
 */
router.get(
  "/:intakeId/question",
  validate(intakeIdParamsSchema, "params"),
  questionGenerationLimiter,
  getQuestion
);

/**
 * Submit an answer to the currently active question.
 *
 * The client sends only:
 *
 * {
 *   "answer": ...
 * }
 */
router.post(
  "/:intakeId/answer",
  validate(intakeIdParamsSchema, "params"),
  validate(submitIntakeAnswerSchema),
  submitAnswer
);

router.get(
  "/consultation/:consultationId",
  validate(consultationIdParamsSchema, "params"),
  getByConsultation
);

/**
 * Retrieve the chronological answer history for an intake.
 */
router.get(
  "/:intakeId/answers",
  validate(intakeIdParamsSchema, "params"),
  getAnswers
);

/**
 * Retrieve an intake and its current state. This also supports safely
 * resuming an interrupted intake.
 */
router.get(
  "/:intakeId",
  validate(intakeIdParamsSchema, "params"),
  getById
);

export default router;
