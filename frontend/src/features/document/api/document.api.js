import { apiClient } from "../../../services/apiClient";

export const documentApi = {
  list: () => apiClient.get("/documents").then((data) => data.documents),
  get: (documentId) => apiClient.get(`/documents/${documentId}`).then((data) => data.document),
  upload: ({ file, documentType, consultationId }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    if (consultationId) formData.append("consultationId", consultationId);

    return apiClient.upload("/documents", formData).then((data) => data.document);
  },
  remove: (documentId) => apiClient.delete(`/documents/${documentId}`).then((data) => data.documentId),
  getProcessingStatus: (documentId) => apiClient.get(`/documents/${documentId}/processing-status`).then((data) => data.status),
};
