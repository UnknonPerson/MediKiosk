import { randomUUID } from "node:crypto";

import env from "../../config/env.js";
import ApiError from "../../utils/ApiError.js";
import Consultation from "../consultation/consultation.model.js";
import Patient from "../patient/patient.model.js";

import MedicalDocument from "./document.model.js";
import { validateDocumentFile } from "./document.files.js";
import { createLocalDocumentStorage } from "./document.storage.js";

function toSafeDocument(document) {
  const response = typeof document.toObject === "function"
    ? document.toObject()
    : { ...document };

  delete response.patientId;
  delete response.storageKey;
  // Note: extractedText is NOT deleted here - it's intentionally included in the response
  // when the document is retrieved individually (via getDocumentMetadata), but excluded
  // from list operations via the select: false in the schema

  return response;
}

async function selectOne(Model, criteria, selection = "") {
  const query = Model.findOne(criteria);

  return typeof query?.select === "function"
    ? query.select(selection)
    : query;
}

function createStorageKey(patientId, extension) {
  return `${patientId.toString()}/${randomUUID()}.${extension}`;
}

import { pythonProcessingClient } from "../../services/pythonProcessingClient.js";

export function createDocumentService({
  PatientModel = Patient,
  ConsultationModel = Consultation,
  DocumentModel = MedicalDocument,
  storage = createLocalDocumentStorage({
    uploadDirectory: env.document.uploadDirectory,
  }),
  maxUploadBytes = env.document.maxUploadBytes,
  processingClient = pythonProcessingClient,
} = {}) {
  async function getPatient(userId) {
    const patient = await PatientModel.findOne({
      userId,
      isDeleted: false,
    });

    if (!patient) {
      throw new ApiError(404, "Patient profile not found.");
    }

    return patient;
  }

  async function ensureConsultationBelongsToPatient(patientId, consultationId) {
    if (!consultationId) {
      return null;
    }

    const consultation = await ConsultationModel.findOne({
      _id: consultationId,
      patientId,
      isDeleted: false,
    });

    if (!consultation) {
      throw new ApiError(404, "Consultation not found.");
    }

    return consultation._id;
  }

  /**
   * Asynchronously process a document after successful upload.
   * This runs in the background and does not block the upload response.
   */
  async function processDocumentBackground(documentId, patientId, storageKey, mimeType, originalFileName) {
    try {
      // Update status to PROCESSING
      await DocumentModel.updateOne(
        { _id: documentId, patientId },
        { $set: { processingStatus: "PROCESSING" } }
      );

      console.log("Starting document processing:", documentId);

      // Call Python service
      const result = await processingClient.processDocument(
        storageKey,
        mimeType,
        originalFileName,
        true // enable OCR fallback
      );

      if (result && result.extracted_text) {
        console.log("Document processed successfully:", {
          documentId,
          characters: result.character_count,
          method: result.processing_method,
        });

        await DocumentModel.updateOne(
          { _id: documentId, patientId },
          {
            $set: {
              processingStatus: "PROCESSED",
              extractedText: result.extracted_text,
              extractionMethod: result.processing_method,
              processedAt: new Date(),
              processingError: null, // Clear any previous error
            },
          }
        );
      } else {
        console.log("Document processing failed to extract text:", documentId);
        await DocumentModel.updateOne(
          { _id: documentId, patientId },
          {
            $set: {
              processingStatus: "FAILED",
              processingError: "Document processing failed - please try again or contact support.",
            },
          }
        );
      }
    } catch (error) {
      console.error("Document processing background error:", error);

      try {
        await DocumentModel.updateOne(
          { _id: documentId, patientId },
          {
            $set: {
              processingStatus: "FAILED",
              processingError: "Document processing failed - please try again or contact support.",
            },
          }
        );
      } catch (updateError) {
        console.error("Failed to update processing status:", updateError);
      }
    }
  }

  return {
    async uploadDocument(userId, data, file) {
      const patient = await getPatient(userId);
      const fileInfo = validateDocumentFile(file, maxUploadBytes);
      const consultationId = await ensureConsultationBelongsToPatient(
        patient._id,
        data.consultationId
      );
      const storageKey = createStorageKey(patient._id, fileInfo.extension);

      try {
        await storage.save(storageKey, file.buffer);
      } catch {
        throw new ApiError(500, "We could not securely store this document.");
      }

      try {
        const document = await DocumentModel.create({
          patientId: patient._id,
          consultationId,
          originalFileName: fileInfo.originalFileName,
          storageKey,
          mimeType: fileInfo.mimeType,
          fileSize: fileInfo.fileSize,
          documentType: data.documentType,
          uploadStatus: "UPLOADED",
          processingStatus: "PENDING",
        });

        // Trigger background processing (non-blocking)
        // This starts processing without blocking the upload response
        processDocumentBackground(
          document._id,
          patient._id,
          storageKey,
          fileInfo.mimeType,
          fileInfo.originalFileName
        );

        return toSafeDocument(document);
      } catch (error) {
        try {
          await storage.remove(storageKey);
        } catch {
          console.error(JSON.stringify({
            level: "error",
            event: "document.storage_cleanup_failed",
          }));
        }

        throw error;
      }
    },

    async listDocuments(userId) {
      const patient = await getPatient(userId);
      const query = DocumentModel.find({ patientId: patient._id });
      const sortedQuery = typeof query?.sort === "function"
        ? query.sort({ createdAt: -1 })
        : query;
      const documents = typeof sortedQuery?.select === "function"
        ? await sortedQuery.select(
          "consultationId originalFileName mimeType fileSize documentType uploadStatus processingStatus createdAt updatedAt extractionMethod processedAt processingError"
        )
        : await sortedQuery;

      return documents.map(toSafeDocument);
    },

    async getDocumentMetadata(userId, documentId) {
      const patient = await getPatient(userId);
      const document = await selectOne(
        DocumentModel,
        {
          _id: documentId,
          patientId: patient._id,
        },
        "+extractedText"
      );

      if (!document) {
        throw new ApiError(404, "Document not found.");
      }

      return toSafeDocument(document);
    },

    async deleteDocument(userId, documentId) {
      const patient = await getPatient(userId);
      const document = await selectOne(
        DocumentModel,
        {
          _id: documentId,
          patientId: patient._id,
        },
        "+storageKey"
      );

      if (!document) {
        throw new ApiError(404, "Document not found.");
      }

      try {
        await storage.remove(document.storageKey);
      } catch {
        throw new ApiError(500, "We could not delete this document. Please try again.");
      }

      try {
        const result = await DocumentModel.deleteOne({
          _id: document._id,
          patientId: patient._id,
        });

        if (result.deletedCount !== 1) {
          throw new Error("Document metadata was not deleted");
        }
      } catch {
        if (typeof DocumentModel.updateOne === "function") {
          try {
            await DocumentModel.updateOne(
              { _id: document._id, patientId: patient._id },
              {
                $set: {
                  uploadStatus: "FAILED",
                  processingStatus: "FAILED",
                },
              }
            );
          } catch {
            // The original metadata deletion failure remains the safe client error.
          }
        }

        throw new ApiError(500, "We could not complete document deletion. Please try again.");
      }

      return { documentId: document._id.toString() };
    },

    async getProcessingStatus(userId, documentId) {
      const patient = await getPatient(userId);
      const document = await selectOne(DocumentModel, {
        _id: documentId,
        patientId: patient._id,
      });

      if (!document) {
        throw new ApiError(404, "Document not found.");
      }

      return {
        documentId: document._id,
        processingStatus: document.processingStatus,
        uploadStatus: document.uploadStatus,
        extractionMethod: document.extractionMethod,
        processedAt: document.processedAt,
        processingError: document.processingError,
      };
    },
  };
}

const documentService = createDocumentService();

export const uploadDocument = documentService.uploadDocument;
export const listDocuments = documentService.listDocuments;
export const getDocumentMetadata = documentService.getDocumentMetadata;
export const deleteDocument = documentService.deleteDocument;
export const getProcessingStatus = documentService.getProcessingStatus;
