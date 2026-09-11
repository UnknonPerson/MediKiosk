import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../services/apiClient";

const messageFrom = (error) => error?.fields?.[0]?.message || error?.message || "We could not load your health timeline.";
const reject = (error) => ({ message: messageFrom(error), status: error?.status || 0 });

/**
 * Fetch the patient health timeline with pagination and filtering.
 */
export const fetchPatientTimeline = createAsyncThunk(
  "timeline/fetchPatientTimeline",
  async ({ page = 1, limit = 20, filter = "ALL" }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit, filter });
      const response = await apiClient.get(`/timeline?${params.toString()}`);
      return response; // { events, pagination, filter }
    } catch (error) {
      return rejectWithValue(reject(error));
    }
  }
);

const initialState = {
  events: [],
  pagination: {
    page: 1,
    limit: 20,
    totalEvents: 0,
    totalPages: 0,
    hasMore: false,
  },
  filter: "ALL",
  status: "idle",
  error: null,
};

const timelineSlice = createSlice({
  name: "timeline",
  initialState,
  reducers: {
    clearTimelineError: (state) => {
      state.error = null;
    },
    setTimelineFilter: (state, action) => {
      state.filter = action.payload;
      state.events = [];
      state.pagination = { ...initialState.pagination };
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientTimeline.pending, (state, action) => {
        // Keep the previous list visible while loading; only show the loader on the first page.
        state.status = "loading";
        state.error = null;
        if (!action.meta.arg.page || action.meta.arg.page === 1) {
          state.events = [];
        }
      })
      .addCase(fetchPatientTimeline.fulfilled, (state, action) => {
        state.status = "succeeded";
        const requestedPage = action.meta.arg.page || 1;
        if (requestedPage === 1) {
          state.events = action.payload.events;
        } else {
          const knownIds = new Set(state.events.map((event) => event.id));
          const fresh = action.payload.events.filter((event) => !knownIds.has(event.id));
          state.events = [...state.events, ...fresh];
        }
        state.pagination = action.payload.pagination;
        state.filter = action.payload.filter;
      })
      .addCase(fetchPatientTimeline.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearTimelineError, setTimelineFilter } = timelineSlice.actions;
export default timelineSlice.reducer;