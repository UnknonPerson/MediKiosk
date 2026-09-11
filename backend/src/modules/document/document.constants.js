export const DOCUMENT_TYPES = Object.freeze([
  "PRESCRIPTION",
  "LAB_REPORT",
  "MEDICAL_REPORT",
  "SCAN",
  "OTHER",
]);

export const UPLOAD_STATUSES = Object.freeze([
  "UPLOADED",
  "FAILED",
]);

export const PROCESSING_STATUSES = Object.freeze([
  "PENDING",
  "QUEUED",
  "PROCESSING",
  "PROCESSED",
  "FAILED",
]);

export const SUPPORTED_DOCUMENT_FORMATS = Object.freeze([
  {
    mimeType: "application/pdf",
    extension: "pdf",
    label: "PDF",
  },
  {
    mimeType: "image/jpeg",
    extension: "jpg",
    label: "JPEG",
  },
  {
    mimeType: "image/png",
    extension: "png",
    label: "PNG",
  },
]);

export const SUPPORTED_MIME_TYPES = Object.freeze(
  SUPPORTED_DOCUMENT_FORMATS.map((format) => format.mimeType)
);
