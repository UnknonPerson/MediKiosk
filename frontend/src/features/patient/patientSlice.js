import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { patientApi } from "./api/patient.api";

const messageFrom = (error) => error?.fields?.[0]?.message || error?.message || "We could not load your profile.";
const call = (type, operation) => createAsyncThunk(type, async (payload, { rejectWithValue }) => { try { return await operation(payload); } catch (error) { return rejectWithValue({ message: messageFrom(error), status: error?.status }); } });

export const fetchPatientProfile = call("patient/fetchProfile", () => patientApi.getProfile());
export const createPatientProfile = call("patient/createProfile", (payload) => patientApi.createProfile(payload));
export const updatePatientProfile = call("patient/updateProfile", (payload) => patientApi.updateProfile(payload));
export const updatePatientConsent = call("patient/updateConsent", (payload) => patientApi.updateConsent(payload));

const initialState = { profile: null, status: "idle", error: null };
const patientSlice = createSlice({ name: "patient", initialState, reducers: { clearPatientError: (state) => { state.error = null; } }, extraReducers: (builder) => {
  builder
    .addMatcher((action) => action.type.startsWith("patient/") && action.type.endsWith("/pending"), (state) => { state.status = "loading"; state.error = null; })
    .addMatcher((action) => action.type.startsWith("patient/") && action.type.endsWith("/fulfilled"), (state, action) => { state.status = "succeeded"; state.profile = action.payload; })
    .addMatcher((action) => action.type.startsWith("patient/") && action.type.endsWith("/rejected"), (state, action) => { state.status = "failed"; state.error = action.payload; });
} });
export const { clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;
