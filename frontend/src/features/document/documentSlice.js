import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { documentApi } from "./api/document.api";

const messageFrom = (error) => error?.fields?.[0]?.message || error?.message || "We could not update your medical documents.";
const reject = (error) => ({ message: messageFrom(error), status: error?.status || 0 });

export const fetchDocuments = createAsyncThunk("documents/fetchAll", async (_, { rejectWithValue }) => {
  try { return await documentApi.list(); } catch (error) { return rejectWithValue(reject(error)); }
});
export const uploadDocument = createAsyncThunk("documents/upload", async (payload, { rejectWithValue }) => {
  try { return await documentApi.upload(payload); } catch (error) { return rejectWithValue(reject(error)); }
});
export const deleteDocument = createAsyncThunk("documents/delete", async (documentId, { rejectWithValue }) => {
  try { return await documentApi.remove(documentId); } catch (error) { return rejectWithValue(reject(error)); }
});

export const fetchProcessingStatus = createAsyncThunk(
  "documents/fetchProcessingStatus",
  async (documentId, { rejectWithValue }) => {
    try {
      const status = await documentApi.getProcessingStatus(documentId);
      return { documentId, ...status };
    } catch (error) {
      return rejectWithValue(reject(error));
    }
  }
);

export const fetchDocumentText = createAsyncThunk(
  "documents/fetchDocumentText",
  async (documentId, { rejectWithValue }) => {
    try {
      const document = await documentApi.get(documentId);
      return { documentId, ...document };
    } catch (error) {
      return rejectWithValue(reject(error));
    }
  }
);

const initialState = {
  items: [],
  listStatus: "idle",
  uploadStatus: "idle",
  deleteStatus: "idle",
  deletingId: null,
  listError: null,
  uploadError: null,
  deleteError: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearDocumentError: (state, action) => {
      const scope = action.payload;
      if (!scope || scope === "list") state.listError = null;
      if (!scope || scope === "upload") state.uploadError = null;
      if (!scope || scope === "delete") state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => { state.listStatus = "loading"; state.listError = null; })
      .addCase(fetchDocuments.fulfilled, (state, action) => { state.listStatus = "succeeded"; state.items = action.payload; })
      .addCase(fetchDocuments.rejected, (state, action) => { state.listStatus = "failed"; state.listError = action.payload; })
      .addCase(uploadDocument.pending, (state) => { state.uploadStatus = "loading"; state.uploadError = null; })
      .addCase(uploadDocument.fulfilled, (state, action) => { state.uploadStatus = "succeeded"; state.items.unshift(action.payload); })
      .addCase(uploadDocument.rejected, (state, action) => { state.uploadStatus = "failed"; state.uploadError = action.payload; })
      .addCase(deleteDocument.pending, (state, action) => { state.deleteStatus = "loading"; state.deletingId = action.meta.arg; state.deleteError = null; })
      .addCase(deleteDocument.fulfilled, (state, action) => { state.deleteStatus = "succeeded"; state.deletingId = null; state.items = state.items.filter((document) => document._id !== action.payload); })
      .addCase(deleteDocument.rejected, (state, action) => { state.deleteStatus = "failed"; state.deletingId = null; state.deleteError = action.payload; })
      .addCase(fetchProcessingStatus.fulfilled, (state, action) => {
        // Update the specific document with processing status information
        const index = state.items.findIndex(doc => doc._id === action.payload.documentId);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            processingStatus: action.payload.processingStatus,
            extractionMethod: action.payload.extractionMethod,
            processedAt: action.payload.processedAt,
            processingError: action.payload.processingError
          };
        }
      })
      .addCase(fetchDocumentText.fulfilled, (state, action) => {
        // Update the specific document with full document data (including extractedText)
        const index = state.items.findIndex(doc => doc._id === action.payload.documentId);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload
          };
        }
      });
  },
});

export const { clearDocumentError } = documentSlice.actions;
export default documentSlice.reducer;
