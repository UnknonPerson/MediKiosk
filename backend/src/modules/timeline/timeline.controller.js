import { getPatientTimeline } from "./timeline.service.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Get the patient health timeline.
 * Requires authentication - userId from req.user.id
 */
export async function getTimeline(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit, filter } = req.query;

    const options = {};
    if (page !== undefined) options.page = parseInt(page, 10);
    if (limit !== undefined) options.limit = parseInt(limit, 10);
    if (filter !== undefined) options.filter = filter;

    const result = await getPatientTimeline(userId, options);

    return res.status(200).json({
      success: true,
      message: "Patient timeline retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}