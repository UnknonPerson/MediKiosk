import mongoose from "mongoose";

import {
  DOCUMENT_TYPES,
  PROCESSING_STATUSES,
  SUPPORTED_MIME_TYPES,
  UPLOAD_STATUSES,
} from "./document.constants.js";

const documentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      default: null,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    mimeType: {
      type: String,
      enum: SUPPORTED_MIME_TYPES,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
    documentType: {
      type: String,
      enum: DOCUMENT_TYPES,
      required: true,
      index: true,
    },
    uploadStatus: {
      type: String,
      enum: UPLOAD_STATUSES,
      default: "UPLOADED",
      required: true,
    },
    processingStatus: {
      type: String,
      enum: PROCESSING_STATUSES,
      default: "PENDING",
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
      select: false, // Sensitive: raw OCR text - only select when explicitly needed
    },
    extractionMethod: {
      type: String,
      enum: ["native", "ocr", "none"],
      default: "none",
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processingError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

documentSchema.index({ patientId: 1, createdAt: -1 });

documentSchema.set("toJSON", {
  transform(document, returnedObject) {
    delete returnedObject.patientId;
    delete returnedObject.storageKey;

    return returnedObject;
  },
});

const MedicalDocument = mongoose.model("MedicalDocument", documentSchema);

export default MedicalDocument;
