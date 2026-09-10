import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { patientApi } from "../patient/api/patient.api";

const messageFrom = (error) => error?.fields?.[0]?.message || error?.message || "We could not load health conversations.";
export const fetchConsultations = createAsyncThunk("consultations/fetchAll", async (_, { rejectWithValue }) => { try { return await patientApi.getConsultations(); } catch (error) { return rejectWithValue(messageFrom(error)); } });
export const createConsultation = createAsyncThunk("consultations/create", async (payload, { rejectWithValue }) => { try { return await patientApi.createConsultation(payload); } catch (error) { return rejectWithValue(messageFrom(error)); } });
export const fetchConsultation = createAsyncThunk("consultations/fetchOne", async (consultationId, { rejectWithValue }) => { try { return await patientApi.getConsultation(consultationId); } catch (error) { return rejectWithValue(messageFrom(error)); } });
const initialState = { items: [], active: null, status: "idle", error: null };
const consultationsSlice = createSlice({ name: "consultations", initialState, reducers: { setActiveConsultation: (state, action) => { state.active = action.payload; } }, extraReducers: (builder) => { builder
  .addCase(fetchConsultations.pending, (state) => { state.status = "loading"; state.error = null; })
  .addCase(fetchConsultations.fulfilled, (state, action) => { state.status = "succeeded"; state.items = action.payload; })
  .addCase(createConsultation.fulfilled, (state, action) => { state.active = action.payload; state.items.unshift(action.payload); })
  .addCase(fetchConsultation.fulfilled, (state, action) => { state.active = action.payload; })
  .addMatcher((action) => action.type.startsWith("consultations/") && action.type.endsWith("/rejected"), (state, action) => { state.status = "failed"; state.error = action.payload; });
} });
export const { setActiveConsultation } = consultationsSlice.actions;
export default consultationsSlice.reducer;
