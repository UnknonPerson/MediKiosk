import {
  createConsultation,
  getConsultationById,
  getPatientConsultations,
} from "./consultation.service.js";

function sendSuccess(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Create a consultation for the authenticated patient.
 */
export async function create(req, res, next) {
  try {
    const consultation = await createConsultation(
      req.user.id,
      req.body
    );

    return sendSuccess(
      res,
      201,
      "Consultation created successfully",
      {
        consultation,
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get all consultations of the authenticated patient.
 */
export async function getAll(req, res, next) {
  try {
    const consultations = await getPatientConsultations(
      req.user.id
    );

    return sendSuccess(
      res,
      200,
      "Consultations retrieved successfully",
      {
        consultations,
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get one consultation belonging to the authenticated patient.
 */
export async function getById(req, res, next) {
  try {
    const consultation = await getConsultationById(
      req.user.id,
      req.params.consultationId
    );

    return sendSuccess(
      res,
      200,
      "Consultation retrieved successfully",
      {
        consultation,
      }
    );
  } catch (error) {
    next(error);
  }
}