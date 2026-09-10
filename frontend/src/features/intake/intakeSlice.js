import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { patientApi } from "../patient/api/patient.api";

const messageFrom = (error) => error?.fields?.[0]?.message || error?.message || "We could not update this health intake.";
const call = (type, operation) => createAsyncThunk(type, async (payload, { rejectWithValue }) => { try { return await operation(payload); } catch (error) { return rejectWithValue({ message: messageFrom(error), status: error?.status }); } });
export const createIntake = call("intake/create", ({ consultationId }) => patientApi.createIntake(consultationId));
export const fetchIntake = call("intake/fetch", (intakeId) => patientApi.getIntake(intakeId));
export const fetchIntakeForConsultation = call("intake/fetchForConsultation", (consultationId) => patientApi.getIntakeForConsultation(consultationId));
export const fetchIntakeAnswers = call("intake/fetchAnswers", (intakeId) => patientApi.getIntakeAnswers(intakeId));
export const fetchIntakeQuestion = call("intake/fetchQuestion", (intakeId) => patientApi.getIntakeQuestion(intakeId));
export const submitIntakeAnswer = call("intake/submitAnswer", ({ intakeId, answer }) => patientApi.answerIntakeQuestion(intakeId, answer));
const initialState = { active: null, question: null, answers: [], status: "idle", error: null };
const intakeSlice = createSlice({ name: "intake", initialState, reducers: { clearActiveIntake: () => initialState, clearIntakeError: (state) => { state.error = null; } }, extraReducers: (builder) => { builder
  .addCase(fetchIntakeAnswers.fulfilled, (state, action) => { state.status = "succeeded"; state.answers = action.payload; })
  .addCase(fetchIntakeQuestion.fulfilled, (state, action) => { state.status = "succeeded"; state.question = action.payload; })
  .addMatcher((action) => action.type.startsWith("intake/") && action.type.endsWith("/pending"), (state) => { state.status = "loading"; state.error = null; })
  .addMatcher((action) => action.type === createIntake.fulfilled.type || action.type === fetchIntake.fulfilled.type || action.type === fetchIntakeForConsultation.fulfilled.type || action.type === submitIntakeAnswer.fulfilled.type, (state, action) => { state.status = "succeeded"; state.active = action.payload; })
  .addMatcher((action) => action.type.startsWith("intake/") && action.type.endsWith("/rejected"), (state, action) => { state.status = "failed"; state.error = action.payload; });
} });
export const { clearActiveIntake, clearIntakeError } = intakeSlice.actions;
export default intakeSlice.reducer;
