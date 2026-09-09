import Consultation from "./consultation.model.js";

import Patient from "../patient/patient.model.js";

import ApiError from "../../utils/ApiError.js";

function getPatientConsultation(consultation) {
  const response = consultation.toObject();

  delete response.patientId;
  delete response.isDeleted;
  delete response.intake;

  return response;
}

/**
 * Create a new consultation for the authenticated patient.
 */
export async function createConsultation(userId, data) {
  const patient = await Patient.findOne({
    userId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(
      404,
      "Patient profile not found. Please create your patient profile first."
    );
  }

  const consultation = await Consultation.create({
    patientId: patient._id,

    healthcareSystem: data.healthcareSystem,

    chiefComplaint: data.chiefComplaint,

    status: "CREATED",
  });

  return getPatientConsultation(consultation);
}

/**
 * Get all consultations belonging to the authenticated patient.
 */
export async function getPatientConsultations(userId) {
  const patient = await Patient.findOne({
    userId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(
      404,
      "Patient profile not found."
    );
  }

  const consultations = await Consultation.find({
    patientId: patient._id,
    isDeleted: false,
  })
    .sort({
      createdAt: -1,
    })
    .select(
      "healthcareSystem status chiefComplaint safetyFlags startedAt completedAt createdAt updatedAt"
    );

  return consultations.map(getPatientConsultation);
}

/**
 * Get one consultation belonging to the authenticated patient.
 */
export async function getConsultationById(
  userId,
  consultationId
) {
  const patient = await Patient.findOne({
    userId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(
      404,
      "Patient profile not found."
    );
  }

  const consultation = await Consultation.findOne({
    _id: consultationId,
    patientId: patient._id,
    isDeleted: false,
  });

  if (!consultation) {
    throw new ApiError(
      404,
      "Consultation not found."
    );
  }

  return getPatientConsultation(consultation);
}
