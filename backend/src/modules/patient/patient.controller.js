import {
  createPatientProfile,
  getPatientProfile,
  updatePatientConsent,
  updatePatientProfile,
} from "./patient.service.js";

function sendSuccess(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Create patient profile for authenticated user.
 */
export async function createProfile(req, res, next) {
  try {
    const patient = await createPatientProfile(
      req.user.id,
      req.body
    );

    return sendSuccess(
      res,
      201,
      "Patient profile created successfully",
      {
        patient,
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get authenticated patient's profile.
 */
export async function getProfile(req, res, next) {
  try {
    const patient = await getPatientProfile(req.user.id);

    return sendSuccess(
      res,
      200,
      "Patient profile retrieved successfully",
      {
        patient,
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Update authenticated patient's profile.
 */
export async function updateProfile(req, res, next) {
  try {
    const patient = await updatePatientProfile(
      req.user.id,
      req.body
    );

    return sendSuccess(
      res,
      200,
      "Patient profile updated successfully",
      {
        patient,
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Update authenticated patient's consent.
 */
export async function updateConsent(req, res, next) {
  try {
    const patient = await updatePatientConsent(
      req.user.id,
      req.body
    );

    return sendSuccess(
      res,
      200,
      "Patient consent updated successfully",
      {
        patient,
      }
    );
  } catch (error) {
    next(error);
  }
}