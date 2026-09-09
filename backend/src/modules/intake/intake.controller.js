import {
  createIntake,
  getIntakeAnswers,
  getIntakeById,
  getCurrentQuestion,
  submitIntakeAnswer,
} from "./intake.service.js";

function sendSuccess(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Create an intake for an existing consultation.
 */
export async function create(req, res, next) {
  try {
    const intake = await createIntake(
      req.user.id,
      req.body.consultationId
    );

    return sendSuccess(
      res,
      201,
      "Intake created successfully",
      {
        intake,
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get the current intake question.
 *
 * If a question is already active, it is returned.
 * Otherwise, the backend generates and stores
 * the next dynamic question.
 */
export async function getQuestion(req, res, next) {
  try {
    const question = await getCurrentQuestion(
      req.user.id,
      req.params.intakeId
    );

    return sendSuccess(
      res,
      200,
      "Current intake question retrieved successfully",
      {
        question,
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Submit an answer to the currently active intake question.
 */
export async function submitAnswer(req, res, next) {
  try {
    const intake = await submitIntakeAnswer(
      req.user.id,
      req.params.intakeId,
      req.body.answer
    );

    return sendSuccess(
      res,
      200,
      "Answer submitted successfully",
      {
        intake,
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve an intake owned by the authenticated patient.
 */
export async function getById(req, res, next) {
  try {
    const intake = await getIntakeById(
      req.user.id,
      req.params.intakeId
    );

    return sendSuccess(
      res,
      200,
      "Intake retrieved successfully",
      { intake }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve the immutable answer history for an intake.
 */
export async function getAnswers(req, res, next) {
  try {
    const answers = await getIntakeAnswers(
      req.user.id,
      req.params.intakeId
    );

    return sendSuccess(
      res,
      200,
      "Intake answers retrieved successfully",
      { answers }
    );
  } catch (error) {
    next(error);
  }
}
