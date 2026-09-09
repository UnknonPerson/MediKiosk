import Patient from "./patient.model.js";
import User from "../users/user.model.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Create a patient profile for the authenticated user.
 */
export async function createPatientProfile(userId, profileData) {
  const user = await User.findById(userId).select(
    "fullName email role +isDeleted"
  );

  if (!user || user.isDeleted) {
    throw new ApiError(401, "Authentication required");
  }

  const existingPatient = await Patient.findOne({ userId }).select(
    "+isDeleted"
  );

  if (existingPatient) {
    throw new ApiError(
      409,
      existingPatient.isDeleted
        ? "A patient profile already exists for this account."
        : "Patient profile already exists."
    );
  }

  const patient = await Patient.create({
    userId,
    ...profileData,
    consent: {
      medicalDataProcessing:
        profileData.consent?.medicalDataProcessing ?? false,

      documentProcessing:
        profileData.consent?.documentProcessing ?? false,

      aiProcessing:
        profileData.consent?.aiProcessing ?? false,

      consentUpdatedAt: profileData.consent
        ? new Date()
        : null,
    },
  });

  return patient;
}

/**
 * Get the authenticated user's patient profile.
 */
export async function getPatientProfile(userId) {
  const patient = await Patient.findOne({
    userId,
    isDeleted: false,
  }).populate("userId", "fullName email role");

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  return patient;
}

/**
 * Update the authenticated user's patient profile.
 */
export async function updatePatientProfile(userId, profileData) {
  const patient = await Patient.findOneAndUpdate(
    {
      userId,
      isDeleted: false,
    },
    {
      $set: profileData,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("userId", "fullName email role");

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  return patient;
}

/**
 * Update patient consent.
 */
export async function updatePatientConsent(userId, consentData) {
  const updateFields = {
    "consent.consentUpdatedAt": new Date(),
  };

  if (consentData.medicalDataProcessing !== undefined) {
    updateFields["consent.medicalDataProcessing"] =
      consentData.medicalDataProcessing;
  }

  if (consentData.documentProcessing !== undefined) {
    updateFields["consent.documentProcessing"] =
      consentData.documentProcessing;
  }

  if (consentData.aiProcessing !== undefined) {
    updateFields["consent.aiProcessing"] =
      consentData.aiProcessing;
  }

  const patient = await Patient.findOneAndUpdate(
    {
      userId,
      isDeleted: false,
    },
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("userId", "fullName email role");

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  return patient;
}
