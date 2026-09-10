import { apiClient } from "../../../services/apiClient";

export const patientApi = {
  getProfile: () => apiClient.get("/patients/profile").then((data) => data.patient),
  createProfile: (payload) => apiClient.post("/patients/profile", payload).then((data) => data.patient),
  updateProfile: (payload) => apiClient.patch("/patients/profile", payload).then((data) => data.patient),
  updateConsent: (payload) => apiClient.patch("/patients/consent", payload).then((data) => data.patient),
  getConsultations: () => apiClient.get("/consultations").then((data) => data.consultations),
  getConsultation: (consultationId) => apiClient.get(`/consultations/${consultationId}`).then((data) => data.consultation),
  createConsultation: (payload) => apiClient.post("/consultations", payload).then((data) => data.consultation),
  createIntake: (consultationId) => apiClient.post("/intakes", { consultationId }).then((data) => data.intake),
  getIntake: (intakeId) => apiClient.get(`/intakes/${intakeId}`).then((data) => data.intake),
  getIntakeForConsultation: (consultationId) => apiClient.get(`/intakes/consultation/${consultationId}`).then((data) => data.intake),
  getIntakeQuestion: (intakeId) => apiClient.get(`/intakes/${intakeId}/question`).then((data) => data.question),
  answerIntakeQuestion: (intakeId, answer) => apiClient.post(`/intakes/${intakeId}/answer`, { answer }).then((data) => data.intake),
  getIntakeAnswers: (intakeId) => apiClient.get(`/intakes/${intakeId}/answers`).then((data) => data.answers),
};
