import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { requireAuth } from "../src/middleware/auth.middleware.js";
import {
  detectDocumentFormat,
  sanitizeOriginalFileName,
  validateDocumentFile,
} from "../src/modules/document/document.files.js";
import { createDocumentService } from "../src/modules/document/document.service.js";
import { createLocalDocumentStorage } from "../src/modules/document/document.storage.js";
import { uploadDocumentSchema } from "../src/modules/document/document.validation.js";

const pdfFile = {
  originalname: "../blood report.pdf",
  mimetype: "application/pdf",
  buffer: Buffer.from("%PDF-1.7\nsynthetic document"),
};

function createFixture() {
  const patients = new Map([
    ["user-a", { _id: "patient-a" }],
    ["user-b", { _id: "patient-b" }],
  ]);
  const documents = new Map();
  const storageFiles = new Map();
  let nextDocumentId = 1;

  const PatientModel = {
    findOne: async ({ userId }) => patients.get(userId) || null,
  };
  const ConsultationModel = {
    findOne: async ({ _id, patientId }) => (
      _id === "consultation-a" && patientId === "patient-a"
        ? { _id: "consultation-a" }
        : null
    ),
  };
  const DocumentModel = {
    create: async (record) => {
      const document = {
        _id: `document-${nextDocumentId++}`,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        ...record,
        toObject() {
          return { ...this };
        },
      };
      documents.set(document._id, document);
      return document;
    },
    find: (criteria) => {
      const matches = [...documents.values()].filter(
        (document) => document.patientId === criteria.patientId
      );
      return {
        sort() { return this; },
        select: async () => matches,
      };
    },
    findOne: (criteria) => {
      const match = [...documents.values()].find(
        (document) => document._id === criteria._id && document.patientId === criteria.patientId
      ) || null;
      return { select: async () => match };
    },
    deleteOne: async (criteria) => {
      const document = documents.get(criteria._id);
      if (!document || document.patientId !== criteria.patientId) {
        return { deletedCount: 0 };
      }
      documents.delete(criteria._id);
      return { deletedCount: 1 };
    },
  };
  const storage = {
    save: async (storageKey, buffer) => storageFiles.set(storageKey, Buffer.from(buffer)),
    remove: async (storageKey) => storageFiles.delete(storageKey),
  };

  return {
    documents,
    storageFiles,
    service: createDocumentService({
      PatientModel,
      ConsultationModel,
      DocumentModel,
      storage,
      maxUploadBytes: 1024,
    }),
  };
}

test("unauthenticated document upload is rejected by the existing auth middleware", async () => {
  let receivedError;

  await requireAuth(
    { get: () => undefined },
    {},
    (error) => { receivedError = error; }
  );

  assert.equal(receivedError.statusCode, 401);
  assert.equal(receivedError.message, "Authentication required");
});

test("document validation rejects unsupported content, oversized buffers, and unsafe associations", () => {
  assert.equal(detectDocumentFormat(pdfFile.buffer).mimeType, "application/pdf");
  assert.throws(
    () => validateDocumentFile({ ...pdfFile, buffer: Buffer.from("not a document") }, 1024),
    /Only valid PDF/
  );
  assert.throws(
    () => validateDocumentFile({ ...pdfFile, buffer: Buffer.from("%PDF-1") }, 5),
    /larger than/
  );
  assert.equal(
    uploadDocumentSchema.safeParse({
      documentType: "UNKNOWN",
      consultationId: "not-an-id",
    }).success,
    false
  );
  assert.equal(
    sanitizeOriginalFileName("../../report\u0000.pdf", "pdf"),
    "report_.pdf"
  );
});

test("authenticated patients can upload only their own metadata and documents stay patient-scoped", async () => {
  const { documents, service, storageFiles } = createFixture();
  const uploaded = await service.uploadDocument(
    "user-a",
    { documentType: "LAB_REPORT", consultationId: "consultation-a" },
    pdfFile
  );

  assert.equal(uploaded.documentType, "LAB_REPORT");
  assert.equal(uploaded.consultationId, "consultation-a");
  assert.equal(uploaded.mimeType, "application/pdf");
  assert.equal(uploaded.uploadStatus, "UPLOADED");
  assert.equal(uploaded.processingStatus, "PENDING");
  assert.equal("patientId" in uploaded, false);
  assert.equal("storageKey" in uploaded, false);
  assert.equal(storageFiles.size, 1);
  assert.equal(documents.size, 1);

  const listedByOwner = await service.listDocuments("user-a");
  const listedByOtherPatient = await service.listDocuments("user-b");
  assert.equal(listedByOwner.length, 1);
  assert.equal(listedByOtherPatient.length, 0);
  await assert.rejects(
    () => service.getDocumentMetadata("user-b", uploaded._id),
    /Document not found/
  );
  await assert.rejects(
    () => service.uploadDocument(
      "user-b",
      { documentType: "OTHER", consultationId: "consultation-a" },
      pdfFile
    ),
    /Consultation not found/
  );
});

test("document deletion is owner-scoped and removes storage before metadata", async () => {
  const { documents, service, storageFiles } = createFixture();
  const uploaded = await service.uploadDocument(
    "user-a",
    { documentType: "PRESCRIPTION" },
    pdfFile
  );
  const storageKey = [...storageFiles.keys()][0];

  await assert.rejects(
    () => service.deleteDocument("user-b", uploaded._id),
    /Document not found/
  );
  assert.equal(storageFiles.has(storageKey), true);
  assert.equal(documents.has(uploaded._id), true);

  const result = await service.deleteDocument("user-a", uploaded._id);
  assert.equal(result.documentId, uploaded._id);
  assert.equal(storageFiles.has(storageKey), false);
  assert.equal(documents.has(uploaded._id), false);
});

test("local document storage creates isolated files and blocks path traversal", async () => {
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "vaidyam-document-test-"));
  const storage = createLocalDocumentStorage({ uploadDirectory: tempDirectory });

  try {
    await storage.save("patient-a/synthetic.pdf", pdfFile.buffer);
    const saved = await readFile(path.join(tempDirectory, "patient-a", "synthetic.pdf"));
    assert.deepEqual(saved, pdfFile.buffer);
    await storage.remove("patient-a/synthetic.pdf");
    await assert.rejects(
      () => storage.save("../outside.pdf", pdfFile.buffer),
      /storage could not be prepared/
    );
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
});
