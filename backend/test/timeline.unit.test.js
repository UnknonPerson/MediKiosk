import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  consultationToEvent,
  intakeToEvent,
  documentToEvent,
  formatFileSize,
} from "../src/modules/timeline/timeline.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_PATH = path.resolve(__dirname, "../src/modules/timeline/timeline.routes.js");
const SERVICE_PATH = path.resolve(__dirname, "../src/modules/timeline/timeline.service.js");
const CONTROLLER_PATH = path.resolve(__dirname, "../src/modules/timeline/timeline.controller.js");
const APP_PATH = path.resolve(__dirname, "../src/app.js");

function readText(filePath) {
  return readFile(filePath, "utf8");
}

test("timeline event contract: every mapped event has id, type, category, title, description, occurredAt, status, metadata", () => {
  const consultation = {
    _id: "consultation-123",
    healthcareSystem: "AYUSH",
    status: "COMPLETED",
    chiefComplaint: "Headache and fatigue",
    startedAt: new Date("2026-09-01T10:00:00Z"),
    completedAt: new Date("2026-09-01T11:00:00Z"),
  };

  const event = consultationToEvent(consultation)[0];

  assert.equal(typeof event.id, "string");
  assert.ok(event.id.length > 0);
  assert.equal(event.type, "CONSULTATION");
  assert.equal(event.category, "CONSULTATION");
  assert.equal(typeof event.title, "string");
  assert.equal(typeof event.description, "string");
  assert.ok(event.occurredAt instanceof Date);
  assert.equal(typeof event.status, "string");
  assert.equal(typeof event.metadata, "object");
});

test("consultationToEvent maps started + completed into two ordered events", () => {
  const consultation = {
    _id: "consultation-123",
    healthcareSystem: "AYUSH",
    status: "COMPLETED",
    chiefComplaint: "Headache and fatigue",
    startedAt: new Date("2026-09-01T10:00:00Z"),
    completedAt: new Date("2026-09-01T11:00:00Z"),
  };

  const events = consultationToEvent(consultation);

  assert.equal(events.length, 2);
  assert.equal(events[0].id, "consultation-started-consultation-123");
  assert.equal(events[0].title, "AYUSH health consultation");
  assert.equal(events[0].description, "Headache and fatigue");
  assert.equal(events[0].occurredAt.getTime(), consultation.startedAt.getTime());
  assert.equal(events[1].id, "consultation-completed-consultation-123");
  assert.equal(events[1].title, "Consultation completed");
  assert.equal(events[1].occurredAt.getTime(), consultation.completedAt.getTime());
  assert.equal(events[1].status, "COMPLETED");
  assert.equal(events[1].metadata.consultationId, "consultation-123");
  assert.equal(events[1].metadata.healthcareSystem, "AYUSH");
  assert.equal(events[1].metadata.chiefComplaint, "Headache and fatigue");
});

test("consultationToEvent omits completed event when consultation is not COMPLETED", () => {
  const consultation = {
    _id: "consultation-456",
    healthcareSystem: "MODERN",
    status: "IN_PROGRESS",
    chiefComplaint: "Lower back pain",
    startedAt: new Date("2026-09-02T10:00:00Z"),
    completedAt: null,
  };

  const events = consultationToEvent(consultation);

  assert.equal(events.length, 1);
  assert.equal(events[0].id, "consultation-started-consultation-456");
  assert.equal(events[0].title, "Modern health consultation");
});

test("intakeToEvent maps started + completed into two events with answer counts", () => {
  const intake = {
    _id: "intake-123",
    intakeType: "MODERN",
    status: "COMPLETED",
    consultationId: "consultation-789",
    answers: [{}, {}, {}],
    startedAt: new Date("2026-09-01T09:00:00Z"),
    completedAt: new Date("2026-09-01T09:30:00Z"),
  };

  const events = intakeToEvent(intake);

  assert.equal(events.length, 2);
  assert.equal(events[0].id, "intake-started-intake-123");
  assert.equal(events[0].title, "Health intake started");
  assert.equal(events[0].metadata.answersCount, 3);
  assert.equal(events[1].id, "intake-completed-intake-123");
  assert.equal(events[1].title, "Health intake completed");
  assert.equal(
    events[1].description,
    "Health intake successfully completed with 3 questions answered"
  );
  assert.equal(events[1].status, "COMPLETED");
  assert.equal(events[1].metadata.consultationId, "consultation-789");
});

test("documentToEvent maps upload always and processed/failed when processedAt exists", () => {
  // Processed document => upload + processed events
  const processedDoc = {
    _id: "document-1",
    originalFileName: "lab-report.pdf",
    fileSize: 1024 * 1024,
    documentType: "LAB_REPORT",
    uploadStatus: "UPLOADED",
    processingStatus: "PROCESSED",
    extractionMethod: "ocr",
    processedAt: new Date("2026-09-01T12:00:00Z"),
    createdAt: new Date("2026-09-01T10:00:00Z"),
  };

  const processedEvents = documentToEvent(processedDoc);
  assert.equal(processedEvents.length, 2);
  assert.equal(processedEvents[0].id, "document-uploaded-document-1");
  assert.equal(processedEvents[0].title, "Document uploaded");
  assert.equal(processedEvents[0].description, "lab-report.pdf (1 MB)");
  assert.equal(processedEvents[0].occurredAt.getTime(), processedDoc.createdAt.getTime());
  assert.equal(processedEvents[1].id, "document-processed-document-1");
  assert.equal(processedEvents[1].title, "Document processed");
  assert.equal(processedEvents[1].status, "PROCESSED");
  assert.equal(processedEvents[1].metadata.extractionMethod, "ocr");

  // Failed document => upload + failed events with safe message
  const failedDoc = {
    _id: "document-2",
    originalFileName: "scan.pdf",
    fileSize: 200,
    documentType: "SCAN",
    uploadStatus: "UPLOADED",
    processingStatus: "FAILED",
    extractionMethod: "none",
    processedAt: new Date("2026-09-01T13:00:00Z"),
    processingError: "Document processing failed - please try again or contact support.",
    createdAt: new Date("2026-09-01T10:30:00Z"),
  };

  const failedEvents = documentToEvent(failedDoc);
  assert.equal(failedEvents.length, 2);
  assert.equal(failedEvents[1].id, "document-failed-document-2");
  assert.equal(failedEvents[1].title, "Document processing failed");
  assert.equal(failedEvents[1].status, "FAILED");

  // Pending document (no processedAt) => only upload event
  const pendingDoc = {
    _id: "document-3",
    originalFileName: "pending.png",
    fileSize: 500,
    documentType: "OTHER",
    uploadStatus: "UPLOADED",
    processingStatus: "PENDING",
    extractionMethod: "none",
    processedAt: null,
    createdAt: new Date("2026-09-01T11:00:00Z"),
  };

  const pendingEvents = documentToEvent(pendingDoc);
  assert.equal(pendingEvents.length, 1);
  assert.equal(pendingEvents[0].id, "document-uploaded-document-3");
});

test("formatFileSize produces readable sizes", () => {
  assert.equal(formatFileSize(0), "0 B");
  assert.equal(formatFileSize(1024), "1 KB");
  assert.equal(formatFileSize(1500), "1.5 KB");
  assert.equal(formatFileSize(1024 * 1024), "1 MB");
  assert.equal(formatFileSize(1024 * 1024 * 100), "100 MB");
});

test("timeline service queries are patient-scoped and exclude soft-deleted records", async () => {
  const content = await readText(SERVICE_PATH);

  // Consultation query must filter by patientId AND isDeleted:false
  assert.ok(
    /Consultation\.find\(\{\s*patientId: patient\._id,\s*isDeleted: false,\s*\}\)/.test(content),
    "Consultation query must be scoped to the owner patient and exclude soft-deleted records"
  );

  // Intake query must filter by patientId AND isDeleted:false
  assert.ok(
    /Intake\.find\(\{\s*patientId: patient\._id,\s*isDeleted: false,\s*\}\)/.test(content),
    "Intake query must be scoped to the owner patient and exclude soft-deleted records"
  );

  // Document query must filter by patientId
  assert.ok(
    content.includes("MedicalDocument.find({\n      patientId: patient._id,\n    })"),
    "Document query must be scoped to the owner patient"
  );
});

test("timeline service sorts events newest-first and applies pagination", async () => {
  const content = await readText(SERVICE_PATH);

  assert.ok(
    content.includes("allEvents.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))"),
    "Events must be sorted by occurredAt descending (newest first)"
  );
  assert.ok(
    content.includes("allEvents.slice(skip, skip + limit)"),
    "Events must be paginated with skip/limit"
  );
  assert.ok(
    content.includes("hasMore: page < totalPages"),
    "Pagination must expose a hasMore flag"
  );
});

test("timeline service applies type filtering", async () => {
  const content = await readText(SERVICE_PATH);

  for (const filterValue of ["CONSULTATION", "INTAKE", "DOCUMENT"]) {
    assert.ok(
      content.includes(`filter === "ALL" || filter === "${filterValue}"`),
      `Service must query the ${filterValue} collection when filter is ALL or ${filterValue}`
    );
  }
});

test("timeline routes require authentication", async () => {
  const content = await readText(ROUTES_PATH);

  assert.ok(
    content.includes("router.use(authenticate)"),
    "Timeline routes must apply the authenticate middleware"
  );
  assert.ok(
    /router\.get\(/.test(content),
    "Timeline routes must expose a GET endpoint"
  );
});

test("timeline module is mounted in the app under /api/v1/timeline", async () => {
  const appContent = await readText(APP_PATH);

  assert.ok(
    appContent.includes('import timelineRoutes from "./modules/timeline/timeline.routes.js"'),
    "The timeline routes module must be imported in app.js"
  );
  assert.ok(
    appContent.includes('"/api/v1/timeline"'),
    "The timeline routes module must be mounted under /api/v1/timeline"
  );
  assert.ok(
    appContent.includes("timelineRoutes"),
    "The timeline routes module must be passed to app.use"
  );
});

test("timeline controller forwards auth user id and query options to the service", async () => {
  const content = await readText(CONTROLLER_PATH);

  assert.ok(
    content.includes("const userId = req.user.id;"),
    "Controller must extract the authenticated user id from req.user.id"
  );
  assert.ok(
    content.includes("options.page"),
    "Controller must forward page from query params"
  );
  assert.ok(
    content.includes("options.filter"),
    "Controller must forward filter from query params"
  );
  assert.ok(
    content.includes('"Patient timeline retrieved successfully"'),
    "Controller must return a success message"
  );
});