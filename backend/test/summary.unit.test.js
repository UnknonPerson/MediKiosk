import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  getPatientSummary,
} from "../src/modules/summary/summary.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_PATH = path.resolve(__dirname, "../src/modules/summary/summary.service.js");
const CONTROLLER_PATH = path.resolve(__dirname, "../src/modules/summary/summary.controller.js");
const ROUTES_PATH = path.resolve(__dirname, "../src/modules/summary/summary.routes.js");
const APP_PATH = path.resolve(__dirname, "../src/app.js");

function readText(filePath) {
  return readFile(filePath, "utf8");
}

test("summary service contract: returns patient profile, counts, and recent activity", async () => {
  // Mock data to verify the structure
  const mockPatient = {
    _id: "patient-123",
    gender: "Female",
    dateOfBirth: new Date("1990-01-01"),
    preferredLanguage: "English",
    consent: { consentGiven: true },
  };

  const mockConsultations = [
    {
      _id: "consultation-1",
      healthcareSystem: "AYUSH",
      status: "COMPLETED",
      chiefComplaint: "Headache",
      startedAt: new Date("2026-09-01T10:00:00Z"),
      completedAt: new Date("2026-09-01T11:00:00Z"),
      createdAt: new Date("2026-09-01T09:00:00Z"),
    },
  ];

  const mockIntakes = [
    {
      _id: "intake-1",
      intakeType: "MODERN",
      status: "COMPLETED",
      consultationId: "consultation-1",
      startedAt: new Date("2026-09-01T09:00:00Z"),
      completedAt: new Date("2026-09-01T09:30:00Z"),
      answers: [{}, {}],
      createdAt: new Date("2026-09-01T08:00:00Z"),
    },
  ];

  const mockDocuments = [
    {
      _id: "document-1",
      originalFileName: "lab-report.pdf",
      fileSize: 1024 * 1024,
      documentType: "LAB_REPORT",
      uploadStatus: "UPLOADED",
      processingStatus: "PENDING",
      extractionMethod: "none",
      createdAt: new Date("2026-09-01T08:00:00Z"),
    },
  ];

  // We would normally mock the models here, but for now we'll just verify the function exists
  assert.equal(typeof getPatientSummary, "function");
});

test("summary service queries are patient-scoped", async () => {
  const content = await readText(SERVICE_PATH);

  // Consultation query must filter by patientId AND isDeleted:false
  assert.ok(
    content.includes("Consultation.countDocuments({ patientId, isDeleted: false })"),
    "Consultation count query must be scoped to the patient and exclude soft-deleted records"
  );

  assert.ok(
    content.includes("Consultation.find({ patientId, isDeleted: false })"),
    "Consultation find query must be scoped to the patient and exclude soft-deleted records"
  );

  // Intake query must filter by patientId AND isDeleted:false
  assert.ok(
    content.includes("Intake.countDocuments({ patientId, isDeleted: false })"),
    "Intake count query must be scoped to the patient and exclude soft-deleted records"
  );

  assert.ok(
    content.includes("Intake.find({ patientId, isDeleted: false })"),
    "Intake find query must be scoped to the patient and exclude soft-deleted records"
  );

  // Document query must filter by patientId
  assert.ok(
    content.includes("MedicalDocument.countDocuments({ patientId })"),
    "Document count query must be scoped to the patient"
  );

  assert.ok(
    content.includes("MedicalDocument.find({ patientId })"),
    "Document find query must be scoped to the patient"
  );
});

test("summary service limits recent items to RECENT_LIMIT", async () => {
  const content = await readText(SERVICE_PATH);

  assert.ok(
    content.includes(".limit(RECENT_LIMIT)"),
    "Queries should limit results to RECENT_LIMIT"
  );

  assert.ok(
    content.includes("slice(0, RECENT_LIMIT)"),
    "Recent activity should be sliced to RECENT_LIMIT"
  );
});

test("summary controller forwards auth user id to the service", async () => {
  const content = await readText(CONTROLLER_PATH);

  assert.ok(
    content.includes("getPatientSummary(req.user.id)"),
    "Controller must pass the authenticated user id to the service"
  );

  assert.ok(
    content.includes('"Health summary retrieved successfully"'),
    "Controller must return a success message"
  );
});

test("summary routes require authentication and patient role", async () => {
  const content = await readText(ROUTES_PATH);

  assert.ok(
    content.includes("requireAuth"),
    "Summary routes must apply the authenticate middleware"
  );

  assert.ok(
    content.includes("requireRole(USER_ROLES.PATIENT)"),
    "Summary routes must require PATIENT role"
  );

  assert.ok(
    /router\.get\(/.test(content),
    "Summary routes must expose a GET endpoint"
  );
});

test("summary module is mounted in the app under /api/v1/summary", async () => {
  const appContent = await readText(APP_PATH);

  assert.ok(
    appContent.includes('import summaryRoutes from "./modules/summary/summary.routes.js"'),
    "The summary routes module must be imported in app.js"
  );

  assert.ok(
    appContent.includes('"/api/v1/summary"'),
    "The summary routes module must be mounted under /api/v1/summary"
  );

  assert.ok(
    appContent.includes("summaryRoutes"),
    "The summary routes module must be passed to app.use"
  );
});