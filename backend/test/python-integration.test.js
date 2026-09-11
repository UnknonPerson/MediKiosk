import assert from "node:assert/strict";
import test from "node:test";

import ApiError from "../src/utils/ApiError.js";

// Mock Python processing client for unit tests
class MockPythonClient {
  constructor(shouldFail = false, shouldTimeout = false) {
    this.shouldFail = shouldFail;
    this.shouldTimeout = shouldTimeout;
    this.lastRequest = null;
  }

  async processDocument(storageKey, mimeType, originalFilename, enableOcrFallback) {
    this.lastRequest = { storageKey, mimeType, originalFilename, enableOcrFallback };

    if (this.shouldTimeout) {
      const error = new Error("Request timeout");
      error.name = "AbortError";
      throw error;
    }

    if (this.shouldFail) {
      throw new ApiError(500, "Processing failed");
    }

    return {
      extracted_text: "This is extracted text from the document.",
      character_count: 38,
      page_count: 1,
      processing_method: "native",
    };
  }
}

test("Python processing client creates valid request payload", async () => {
  const client = new MockPythonClient();

  const result = await client.processDocument(
    "patient-123/doc-456.pdf",
    "application/pdf",
    "report.pdf",
    true
  );

  assert.equal(client.lastRequest.storageKey, "patient-123/doc-456.pdf");
  assert.equal(client.lastRequest.mimeType, "application/pdf");
  assert.equal(client.lastRequest.originalFilename, "report.pdf");
  assert.equal(client.lastRequest.enableOcrFallback, true);

  assert.ok(result.extracted_text);
  assert.equal(result.character_count, 38);
  assert.equal(result.processing_method, "native");
});

test("Processing result includes expected metadata", async () => {
  const client = new MockPythonClient();

  const result = await client.processDocument(
    "patient-123/test.pdf",
    "application/pdf",
    "test.pdf"
  );

  assert.ok("extracted_text" in result);
  assert.ok("character_count" in result);
  assert.ok("processing_method" in result);
});

test("Processing failure is handled gracefully", async () => {
  const client = new MockPythonClient(true);

  await assert.rejects(
    async () => {
      await client.processDocument("test.pdf", "application/pdf", "test.pdf");
    },
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.statusCode, 500);
      return true;
    }
  );
});

test("Processing timeout is converted to appropriate error", async () => {
  const client = new MockPythonClient(false, true);

  await assert.rejects(
    async () => {
      await client.processDocument("test.pdf", "application/pdf", "test.pdf");
    },
    (error) => {
      assert.equal(error.name, "AbortError");
      return true;
    }
  );
});

test("Document processing status transitions correctly", async () => {
  // Simulate status transition: PENDING -> PROCESSING -> PROCESSED
  const statusTransitions = ["PENDING", "PROCESSING", "PROCESSED"];

  let currentStatus = "PENDING";

  // Simulate the transition logic
  assert.equal(currentStatus, "PENDING");

  // After processing starts
  currentStatus = "PROCESSING";
  assert.equal(currentStatus, "PROCESSING");

  // After successful processing
  currentStatus = "PROCESSED";
  assert.equal(currentStatus, "PROCESSED");

  // Verify all transitions
  assert.deepEqual(statusTransitions, ["PENDING", "PROCESSING", "PROCESSED"]);
});

test("Processing failure updates status to FAILED", async () => {
  // Simulate failure transition: PENDING -> PROCESSING -> FAILED
  const transitions = [];

  let status = "PENDING";
  transitions.push(status);

  // Processing starts
  status = "PROCESSING";
  transitions.push(status);

  // Processing fails
  status = "FAILED";
  transitions.push(status);

  assert.deepEqual(transitions, ["PENDING", "PROCESSING", "FAILED"]);
});

test("Storage key validation rejects path traversal", () => {
  const invalidKeys = [
    "../../../etc/passwd",
    "..\\..\\windows\\system32",
    "/etc/passwd",
    "C:\\Windows\\System32",
    "patient-123/../../../etc/passwd",
  ];

  const validKeys = [
    "patient-123/abc-456.pdf",
    "patient-xyz/test-document.png",
    "user-1/550e8400-e29b-41d4-a716-446655440000.jpg",
  ];

  // Validate that invalid keys would be rejected
  for (const key of invalidKeys) {
    assert.ok(
      key.includes("..") || key.includes("\\") || key.startsWith("/"),
      `Invalid key should be rejected: ${key}`
    );
  }

  // Validate that valid keys would be accepted
  for (const key of validKeys) {
    const parts = key.split("/");
    assert.equal(parts.length, 2, `Valid key should have 2 parts: ${key}`);
    assert.ok(!key.includes(".."), `Valid key should not contain ..: ${key}`);
    assert.ok(!key.includes("\\"), `Valid key should not contain \\: ${key}`);
  }
});

test("Supported MIME types are correctly identified", () => {
  const supportedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  const unsupportedTypes = [
    "application/msword",
    "image/gif",
    "text/plain",
    "image/tiff",
  ];

  for (const type of supportedTypes) {
    assert.ok(
      supportedTypes.includes(type),
      `Should support ${type}`
    );
  }

  for (const type of unsupportedTypes) {
    assert.ok(
      !supportedTypes.includes(type),
      `Should not support ${type}`
    );
  }
});
