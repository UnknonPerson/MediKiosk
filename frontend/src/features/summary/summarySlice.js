import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../services/apiClient";

const messageFrom = (error) => error?.fields?.[0]?.message || error?.message || "We could not load your health summary.";

export const fetchSummary = createAsyncThunk(
  "summary/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/summary");
      return data.summary;
    } catch (error) {
      return rejectWithValue(messageFrom(error));
    }
  }
);

const initialState = {
  data: null,
  status: "idle",
  error: null,
};

const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    clearSummary: (state) => {
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearSummary } = summarySlice.actions;
export default summarySlice.reducer;