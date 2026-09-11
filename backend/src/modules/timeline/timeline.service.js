import MedicalDocument from "../document/document.model.js";
import Consultation from "../consultation/consultation.model.js";
import Intake from "../intake/intake.model.js";
import Patient from "../patient/patient.model.js";
import ApiError from "../../utils/ApiError.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export {
  consultationToEvent,
  intakeToEvent,
  documentToEvent,
  formatFileSize,
};

/**
 * Resolve the patient record for the authenticated user.
 */
async function resolvePatient(userId) {
  const patient = await Patient.findOne({ userId, isDeleted: false });
  if (!patient) {
    throw new ApiError(404, "Patient profile not found.");
  }
  return patient;
}

/**
 * Map a consultation document into a timeline event.
 */
function consultationToEvent(consultation) {
  const obj = consultation; // lean() returns plain object
  const events = [];

  // Consultation started event
  if (obj.startedAt) {
    events.push({
      id: `consultation-started-${obj._id}`,
      type: "CONSULTATION",
      category: "CONSULTATION",
      title: `${obj.healthcareSystem === "AYUSH" ? "AYUSH" : "Modern"} health consultation`,
      description: obj.chiefComplaint || "Consultation started",
      occurredAt: obj.startedAt,
      status: obj.status,
      metadata: {
        consultationId: obj._id,
        healthcareSystem: obj.healthcareSystem,
        chiefComplaint: obj.chiefComplaint,
      },
    });
  }

  // Consultation completed event
  if (obj.completedAt && obj.status === "COMPLETED") {
    events.push({
      id: `consultation-completed-${obj._id}`,
      type: "CONSULTATION",
      category: "CONSULTATION",
      title: `Consultation completed`,
      description: obj.chiefComplaint || "Consultation successfully completed",
      occurredAt: obj.completedAt,
      status: "COMPLETED",
      metadata: {
        consultationId: obj._id,
        healthcareSystem: obj.healthcareSystem,
        chiefComplaint: obj.chiefComplaint,
      },
    });
  }

  return events;
}

/**
 * Map an intake document into a timeline event.
 */
function intakeToEvent(intake) {
  const obj = intake; // lean() returns plain object
  const events = [];

  // Intake started event
  if (obj.startedAt) {
    events.push({
      id: `intake-started-${obj._id}`,
      type: "INTAKE",
      category: "INTAKE",
      title: `Health intake started`,
      description: `${obj.intakeType === "AYUSH" ? "AYUSH" : "Modern"} health intake initiated`,
      occurredAt: obj.startedAt,
      status: obj.status,
      metadata: {
        intakeId: obj._id,
        consultationId: obj.consultationId,
        intakeType: obj.intakeType,
        answersCount: obj.answers ? obj.answers.length : 0,
      },
    });
  }

  // Intake completed event
  if (obj.completedAt && obj.status === "COMPLETED") {
    events.push({
      id: `intake-completed-${obj._id}`,
      type: "INTAKE",
      category: "INTAKE",
      title: `Health intake completed`,
      description: `Health intake successfully completed with ${obj.answers ? obj.answers.length : 0} questions answered`,
      occurredAt: obj.completedAt,
      status: "COMPLETED",
      metadata: {
        intakeId: obj._id,
        consultationId: obj.consultationId,
        intakeType: obj.intakeType,
        answersCount: obj.answers ? obj.answers.length : 0,
      },
    });
  }

  return events;
}

/**
 * Map a document into timeline events.
 */
function documentToEvent(document) {
  const obj = document; // lean() returns plain object
  const events = [];

  // Document uploaded event
  events.push({
    id: `document-uploaded-${obj._id}`,
    type: "DOCUMENT",
    category: "DOCUMENT",
    title: `Document uploaded`,
    description: `${obj.originalFileName} (${formatFileSize(obj.fileSize)})`,
    occurredAt: obj.createdAt,
    status: obj.uploadStatus,
    metadata: {
      documentId: obj._id,
      originalFileName: obj.originalFileName,
      documentType: obj.documentType,
      mimeType: obj.mimeType,
      fileSize: obj.fileSize,
    },
  });

  // Document processed successfully
  if (obj.processedAt && obj.processingStatus === "PROCESSED") {
    events.push({
      id: `document-processed-${obj._id}`,
      type: "DOCUMENT",
      category: "DOCUMENT",
      title: `Document processed`,
      description: `Text extraction completed via ${obj.extractionMethod === "native" ? "native extraction" : "OCR"}`,
      occurredAt: obj.processedAt,
      status: "PROCESSED",
      metadata: {
        documentId: obj._id,
        originalFileName: obj.originalFileName,
        extractionMethod: obj.extractionMethod,
      },
    });
  }

  // Document processing failed
  if (obj.processedAt && obj.processingStatus === "FAILED") {
    events.push({
      id: `document-failed-${obj._id}`,
      type: "DOCUMENT",
      category: "DOCUMENT",
      title: `Document processing failed`,
      description: obj.processingError || "Document processing could not be completed",
      occurredAt: obj.processedAt,
      status: "FAILED",
      metadata: {
        documentId: obj._id,
        originalFileName: obj.originalFileName,
      },
    });
  }

  return events;
}

/**
 * Format file size for display.
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Get the patient health timeline.
 *
 * Aggregates events from consultations, intakes, and documents
 * into a unified timeline, sorted newest first with pagination.
 */
export async function getPatientTimeline(userId, options = {}) {
  const patient = await resolvePatient(userId);

  const page = Math.max(1, parseInt(options.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(options.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  const filter = options.filter || "ALL";

  const allEvents = [];

  // Fetch and process consultations
  if (filter === "ALL" || filter === "CONSULTATION") {
    const consultations = await Consultation.find({
      patientId: patient._id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("healthcareSystem status chiefComplaint startedAt completedAt createdAt")
      .lean();

    for (const consultation of consultations) {
      allEvents.push(...consultationToEvent(consultation));
    }
  }

  // Fetch and process intakes
  if (filter === "ALL" || filter === "INTAKE") {
    const intakes = await Intake.find({
      patientId: patient._id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("intakeType status startedAt completedAt consultationId answers")
      .lean();

    for (const intake of intakes) {
      allEvents.push(...intakeToEvent(intake));
    }
  }

  // Fetch and process documents
  if (filter === "ALL" || filter === "DOCUMENT") {
    const documents = await MedicalDocument.find({
      patientId: patient._id,
    })
      .sort({ createdAt: -1 })
      .select("originalFileName mimeType fileSize documentType uploadStatus processingStatus extractionMethod processedAt processingError createdAt")
      .lean();

    for (const document of documents) {
      allEvents.push(...documentToEvent(document));
    }
  }

  // Sort all events by occurredAt descending (newest first)
  allEvents.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

  // Calculate pagination
  const totalEvents = allEvents.length;
  const totalPages = Math.ceil(totalEvents / limit);
  const paginatedEvents = allEvents.slice(skip, skip + limit);

  return {
    events: paginatedEvents,
    pagination: {
      page,
      limit,
      totalEvents,
      totalPages,
      hasMore: page < totalPages,
    },
    filter,
  };
}