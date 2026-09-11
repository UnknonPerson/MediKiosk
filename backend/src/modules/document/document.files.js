import path from "node:path";

import ApiError from "../../utils/ApiError.js";

import { SUPPORTED_DOCUMENT_FORMATS } from "./document.constants.js";

const PNG_SIGNATURE = Buffer.from([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a,
]);

function startsWith(buffer, signature) {
  return buffer.length >= signature.length && buffer.subarray(0, signature.length).equals(signature);
}

export function detectDocumentFormat(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    return null;
  }

  if (startsWith(buffer, Buffer.from("%PDF-"))) {
    return SUPPORTED_DOCUMENT_FORMATS.find(
      (format) => format.mimeType === "application/pdf"
    );
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return SUPPORTED_DOCUMENT_FORMATS.find(
      (format) => format.mimeType === "image/jpeg"
    );
  }

  if (startsWith(buffer, PNG_SIGNATURE)) {
    return SUPPORTED_DOCUMENT_FORMATS.find(
      (format) => format.mimeType === "image/png"
    );
  }

  return null;
}

export function sanitizeOriginalFileName(fileName, extension) {
  const baseName = path.basename(String(fileName || ""))
    .replace(/[\u0000-\u001f<>:"|?*]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);

  return baseName || `medical-document.${extension}`;
}

export function validateDocumentFile(file, maxUploadBytes) {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
    throw new ApiError(400, "Please choose a non-empty document to upload.");
  }

  if (file.buffer.length > maxUploadBytes) {
    throw new ApiError(413, "The document is larger than the allowed upload size.");
  }

  const format = detectDocumentFormat(file.buffer);

  if (!format || file.mimetype !== format.mimeType) {
    throw new ApiError(
      400,
      "Only valid PDF, JPEG, and PNG medical documents can be uploaded."
    );
  }

  return {
    fileSize: file.buffer.length,
    mimeType: format.mimeType,
    originalFileName: sanitizeOriginalFileName(file.originalname, format.extension),
    extension: format.extension,
  };
}
