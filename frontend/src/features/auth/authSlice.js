import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "./api/auth.api";
import { apiClient } from "../../services/apiClient";

const messageFrom = (error) => error?.fields?.[0]?.message || error?.message || "Something went wrong. Please try again.";

export const initializeSession = createAsyncThunk("auth/initializeSession", async (_, { rejectWithValue }) => {
  if (!apiClient.getSession()?.accessToken) return null;
  try { return await authApi.me(); } catch (error) { apiClient.clearSession(); return rejectWithValue(messageFrom(error)); }
});

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try { return await authApi.login(credentials); } catch (error) { return rejectWithValue(messageFrom(error)); }
});

export const registerAccount = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try { return await authApi.register(payload); } catch (error) { return rejectWithValue(messageFrom(error)); }
});

export const verifyEmail = createAsyncThunk("auth/verifyEmail", async (payload, { rejectWithValue }) => {
  try { return await authApi.verifyEmail(payload); } catch (error) { return rejectWithValue(messageFrom(error)); }
});

export const resendVerification = createAsyncThunk("auth/resendVerification", async (email, { rejectWithValue }) => {
  try { return await authApi.resendVerification(email); } catch (error) { return rejectWithValue(messageFrom(error)); }
});

export const requestPasswordReset = createAsyncThunk("auth/requestPasswordReset", async (email, { rejectWithValue }) => {
  try { return await authApi.forgotPassword(email); } catch (error) { return rejectWithValue(messageFrom(error)); }
});

export const verifyPasswordReset = createAsyncThunk("auth/verifyPasswordReset", async (payload, { rejectWithValue }) => {
  try { return await authApi.verifyPasswordResetOtp(payload); } catch (error) { return rejectWithValue(messageFrom(error)); }
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async (payload, { rejectWithValue }) => {
  try { return await authApi.resetPassword(payload); } catch (error) { return rejectWithValue(messageFrom(error)); }
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try { await authApi.logout(); return null; } catch (error) { return rejectWithValue(messageFrom(error)); }
});

const initialState = { user: null, status: "idle", error: null, initialized: false, actionStatus: "idle" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: { clearAuthError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(initializeSession.pending, (state) => { state.status = "checking"; state.error = null; })
      .addCase(initializeSession.fulfilled, (state, action) => { state.initialized = true; state.user = action.payload; state.status = action.payload ? "authenticated" : "unauthenticated"; })
      .addCase(initializeSession.rejected, (state, action) => { state.initialized = true; state.user = null; state.status = "unauthenticated"; state.error = action.payload; })
      .addCase(login.pending, (state) => { state.actionStatus = "pending"; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.user = action.payload; state.status = "authenticated"; state.initialized = true; state.actionStatus = "succeeded"; })
      .addCase(login.rejected, (state, action) => { state.actionStatus = "failed"; state.error = action.payload; })
      .addMatcher((action) => action.type.startsWith("auth/") && action.type.endsWith("/pending") && action.type !== initializeSession.pending.type && action.type !== login.pending.type, (state) => { state.actionStatus = "pending"; state.error = null; })
      .addMatcher((action) => action.type.startsWith("auth/") && action.type.endsWith("/fulfilled") && action.type !== initializeSession.fulfilled.type && action.type !== login.fulfilled.type && action.type !== logout.fulfilled.type, (state) => { state.actionStatus = "succeeded"; })
      .addMatcher((action) => action.type.startsWith("auth/") && action.type.endsWith("/rejected") && action.type !== initializeSession.rejected.type && action.type !== login.rejected.type && action.type !== logout.rejected.type, (state, action) => { state.actionStatus = "failed"; state.error = action.payload; });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
