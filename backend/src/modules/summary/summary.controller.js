import {
  getPatientSummary,
} from "./summary.service.js";

function sendSuccess(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Get health summary for the authenticated patient.
 */
export async function getSummary(req, res, next) {
  try {
    const summary = await getPatientSummary(req.user.id);

    return sendSuccess(
      res,
      200,
      "Health summary retrieved successfully",
      {
        summary,
      }
    );
  } catch (error) {
    next(error);
  }
}