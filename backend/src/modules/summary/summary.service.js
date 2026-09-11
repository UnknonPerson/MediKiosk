import MedicalDocument from "../document/document.model.js";
import Consultation from "../consultation/consultation.model.js";
import Intake from "../intake/intake.model.js";
import Patient from "../patient/patient.model.js";
import ApiError from "../../utils/ApiError.js";

const RECENT_LIMIT = 5;

async function resolvePatient(userId) {
  const patient = await Patient.findOne({ userId, isDeleted: false }).lean();
  if (!patient) {
    throw new ApiError(404, "Patient profile not found.");
  }
  return patient;
}

/**
 * Get health summary for the authenticated patient.
 */
export async function getPatientSummary(userId) {
  const patient = await resolvePatient(userId);
  const patientId = patient._id;

  // Fetch counts and recent items in parallel
  const [consultationCount, intakeCount, documentCount, recentConsultations, recentIntakes, recentDocuments] =
    await Promise.all([
      Consultation.countDocuments({ patientId, isDeleted: false }),
      Intake.countDocuments({ patientId, isDeleted: false }),
      MedicalDocument.countDocuments({ patientId }),
      Consultation.find({ patientId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .select("healthcareSystem status chiefComplaint startedAt completedAt createdAt")
        .lean(),
      Intake.find({ patientId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .select("intakeType status startedAt completedAt consultationId answers")
        .lean(),
      MedicalDocument.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .select("originalFileName mimeType fileSize documentType uploadStatus processingStatus extractionMethod processedAt createdAt")
        .lean(),
    ]);

  // Build recent activity (merge and sort)
  const recentActivity = [
    ...recentConsultations.map((c) => ({
      type: "CONSULTATION",
      title: `${c.healthcareSystem} consultation`,
      description: c.chiefComplaint || "Consultation",
      occurredAt: c.startedAt || c.createdAt,
      status: c.status,
    })),
    ...recentIntakes.map((i) => ({
      type: "INTAKE",
      title: `${i.intakeType} intake`,
      description: `Intake ${i.status.toLowerCase()}`,
      occurredAt: i.startedAt || i.createdAt,
      status: i.status,
    })),
    ...recentDocuments.map((d) => ({
      type: "DOCUMENT",
      title: d.originalFileName,
      description: `${d.documentType.replace("_", " ")} (${d.uploadStatus})`,
      occurredAt: d.createdAt,
      status: d.uploadStatus,
    })),
  ]
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
    .slice(0, RECENT_LIMIT);

  return {
    patient: {
      id: patient._id,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      preferredLanguage: patient.preferredLanguage,
      consentGiven: !!(
        patient.consent?.medicalDataProcessing ||
        patient.consent?.documentProcessing ||
        patient.consent?.aiProcessing
      ),
    },
    consultations: {
      total: consultationCount,
      recent: recentConsultations,
    },
    intakes: {
      total: intakeCount,
      recent: recentIntakes,
    },
    documents: {
      total: documentCount,
      recent: recentDocuments,
    },
    recentActivity,
  };
}
