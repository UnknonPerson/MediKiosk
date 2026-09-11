import {
  deleteDocument,
  getDocumentMetadata,
  getProcessingStatus as getDocumentProcessingStatus,
  listDocuments,
  uploadDocument,
} from "./document.service.js";

function sendSuccess(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export async function upload(req, res, next) {
  try {
    const document = await uploadDocument(req.user.id, req.body, req.file);

    return sendSuccess(res, 201, "Document uploaded successfully", { document });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const documents = await listDocuments(req.user.id);

    return sendSuccess(res, 200, "Documents retrieved successfully", { documents });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const document = await getDocumentMetadata(req.user.id, req.params.documentId);

    return sendSuccess(res, 200, "Document retrieved successfully", { document });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const { documentId } = await deleteDocument(req.user.id, req.params.documentId);

    return sendSuccess(res, 200, "Document deleted successfully", { documentId });
  } catch (error) {
    next(error);
  }
}

export async function getProcessingStatus(req, res, next) {
  try {
    const status = await getDocumentProcessingStatus(
      req.user.id,
      req.params.documentId
    );

    return sendSuccess(res, 200, "Processing status retrieved", { status });
  } catch (error) {
    next(error);
  }
}
