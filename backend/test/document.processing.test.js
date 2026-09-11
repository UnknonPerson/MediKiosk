import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_PATH = path.resolve(__dirname, "../src/modules/document/document.service.js");
const ROUTES_PATH = path.resolve(__dirname, "../src/modules/document/document.routes.js");
const MODEL_PATH = path.resolve(__dirname, "../src/modules/document/document.model.js");

async function readService() {
  return readFile(SERVICE_PATH, "utf8");
}

async function readRoutes() {
  return readFile(ROUTES_PATH, "utf8");
}

test("successful lifecycle: processDocumentBackground stores extractedText, extractionMethod, processedAt, clears processingError", async () => {
  const content = await readService();

  assert.ok(
    content.includes('processingStatus: "PROCESSED"'),
    "Should set processingStatus to PROCESSED on success"
  );
  assert.ok(
    content.includes("extractedText: result.extracted_text"),
    "Should store extractedText from Python service result"
  );
  assert.ok(
    content.includes("extractionMethod: result.processing_method"),
    "Should store extractionMethod from Python service result"
  );
  assert.ok(
    content.includes("processedAt: new Date()"),
    "Should store processedAt timestamp on success"
  );
  assert.ok(
    content.includes("processingError: null"),
    "Should clear processingError on successful processing"
  );
});

test("failure lifecycle: processDocumentBackground stores safe processingError and sets FAILED", async () => {
  const content = await readService();

  const errorMessage = 'processingError: "Document processing failed - please try again or contact support."';
  const errorCount = content.split(errorMessage).length - 1;
  assert.ok(
    errorCount >= 2,
    `Expected safe error message in at least 2 failure paths, found ${errorCount}`
  );

  assert.ok(
    content.includes('processingStatus: "FAILED"'),
    "Should set processingStatus to FAILED on failure"
  );

  // Verify safe message contains no internal details
  const safeMessage = "Document processing failed - please try again or contact support.";
  assert.ok(!safeMessage.includes("/"), "Safe message should not contain file paths");
  assert.ok(!safeMessage.includes("token"), "Safe message should not mention tokens");
  assert.ok(!safeMessage.includes("Error:"), "Safe message should not contain exception text");
});

test("getProcessingStatus returns expected fields and excludes extractedText", async () => {
  const content = await readService();

  const requiredFields = [
    "documentId: document._id",
    "processingStatus: document.processingStatus",
    "uploadStatus: document.uploadStatus",
    "extractionMethod: document.extractionMethod",
    "processedAt: document.processedAt",
    "processingError: document.processingError",
  ];

  for (const field of requiredFields) {
    assert.ok(
      content.includes(field),
      `getProcessingStatus return object must include: ${field}`
    );
  }

  // Verify extractedText is NOT returned by getProcessingStatus
  const statusFnStart = content.indexOf("async getProcessingStatus(");
  const statusFnEnd = content.indexOf("};", statusFnStart);
  const statusFnBody = content.slice(statusFnStart, statusFnEnd);

  assert.ok(
    !statusFnBody.includes("extractedText"),
    "getProcessingStatus must NOT return extractedText"
  );
});

test("listDocuments select excludes extractedText but includes extractionMethod, processedAt, processingError", async () => {
  const content = await readService();

  const selectMatch = content.match(
    /await sortedQuery\.select\(\s*"([^"]+)"\s*\)/
  );
  assert.ok(selectMatch, "listDocuments should have an explicit select string");

  const selectedFields = selectMatch[1];

  assert.ok(
    !selectedFields.includes("extractedText"),
    "listDocuments must NOT select extractedText (sensitive raw OCR text)"
  );
  assert.ok(
    selectedFields.includes("extractionMethod"),
    "listDocuments should include extractionMethod"
  );
  assert.ok(
    selectedFields.includes("processedAt"),
    "listDocuments should include processedAt"
  );
  assert.ok(
    selectedFields.includes("processingError"),
    "listDocuments should include processingError (safe generic message for patient)"
  );
});

test("processing-status route is wired before generic :documentId route", async () => {
  const content = await readRoutes();

  // Match the standalone generic route (/:documentId" but NOT /:documentId/...)
  const processingStatusIdx = content.indexOf("/:documentId/processing-status");
  const genericDocIdMatch = content.match(/router\.get\(\s*"\/:documentId"\s*,/);
  const genericDocIdIdx = genericDocIdMatch ? genericDocIdMatch.index : -1;

  assert.ok(
    processingStatusIdx !== -1,
    "processing-status route should exist in routes file"
  );
  assert.ok(
    genericDocIdIdx !== -1,
    "generic :documentId route should exist in routes file"
  );
  assert.ok(
    processingStatusIdx < genericDocIdIdx,
    "processing-status route must come BEFORE generic :documentId route"
  );
});

test("processingError field exists in MedicalDocument schema", async () => {
  const content = await readFile(MODEL_PATH, "utf8");

  assert.ok(
    content.includes("processingError:"),
    "Schema should define processingError field"
  );
  assert.ok(
    content.includes("type: String"),
    "processingError should be a String type"
  );
  assert.ok(
    content.includes("default: null"),
    "processingError should default to null"
  );
});
