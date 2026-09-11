import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, CircleAlert, FileUp, Trash2, CheckCircle2, Search } from "lucide-react";

import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  clearDocumentError,
  fetchProcessingStatus,
  fetchDocumentText
} from "../../document/documentSlice";
import { formatDate } from "../utils/health";

const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_DOCUMENT_MAX_UPLOAD_BYTES || "10485760", 10);
const DOCUMENT_TYPES = ["PRESCRIPTION", "LAB_REPORT", "MEDICAL_REPORT", "SCAN", "OTHER"];

function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getStatusLabel(status) {
  if (status === "PENDING" || status === "QUEUED") return "Processing in future step";
  if (status === "PROCESSING") return "Processing...";
  if (status === "PROCESSED") return "Processed";
  if (status === "FAILED") return "Failed";
  if (status === "UPLOADED") return "Uploaded successfully";
  return status;
}

export default function DocumentsPage() {
  const dispatch = useDispatch();

  const {
    items,
    listStatus,
    uploadStatus,
    deleteStatus,
    deletingId,
    listError,
    uploadError,
    deleteError
  } = useSelector((state) => state.documents);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState("MEDICAL_REPORT");
  const [validationError, setValidationError] = useState("");
  // Per-document tracking of which extracted-text panels are expanded and which are loading.
  const [expandedTextDocs, setExpandedTextDocs] = useState(new Set());
  const [fetchingTextDocs, setFetchingTextDocs] = useState(() => new Set());

  useEffect(() => {
    dispatch(fetchDocuments());
    return () => { dispatch(clearDocumentError()); };
  }, [dispatch]);

  // Poll processing status for documents that are PENDING or PROCESSING
  useEffect(() => {
    // Find documents that need polling (PENDING or PROCESSING)
    const needsPolling = items.filter(
      doc => doc.processingStatus === "PENDING" || doc.processingStatus === "PROCESSING"
    );

    if (needsPolling.length === 0) return;

    const intervalId = setInterval(() => {
      needsPolling.forEach(doc => {
        dispatch(fetchProcessingStatus(doc._id));
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [items, dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setValidationError("");
    dispatch(clearDocumentError("upload"));

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`This file exceeds the ${formatFileSize(MAX_FILE_SIZE)} maximum upload size.`);
      setSelectedFile(null);
      fileInputRef.current.value = "";
      return;
    }

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setValidationError("Only PDF, JPEG, and PNG files are supported.");
      setSelectedFile(null);
      fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      await dispatch(uploadDocument({
        file: selectedFile,
        documentType: selectedType
      })).unwrap();

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // The error is saved in Redux and displayed from state
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this document permanently?")) {
      dispatch(deleteDocument(id));
    }
  };

  const handleShowExtractedText = (docId) => {
    const isExpanded = expandedTextDocs.has(docId);

    if (isExpanded) {
      // Hide
      setExpandedTextDocs(prev => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
      setFetchingTextDocs(prev => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
      return;
    }

    // Show - expand immediately and fetch the text on demand (other docs stay closed)
    setExpandedTextDocs(prev => new Set(prev).add(docId));

    // Only refetch when this document's text has not been loaded yet
    const currentDoc = items.find(doc => doc._id === docId);
    if (currentDoc && currentDoc.extractedText) {
      return;
    }

    setFetchingTextDocs(prev => new Set(prev).add(docId));
    dispatch(fetchDocumentText(docId))
      .unwrap()
      .catch(() => {
        // Error handled in Redux state; panel shows "(No text extracted)"
      })
      .finally(() => {
        setFetchingTextDocs(prev => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
      });
  };

  if (listStatus === "loading" && items.length === 0) {
    return <div className="page-state"><span className="loading-dot"/>Loading your medical documents…</div>;
  }

  const isUploading = uploadStatus === "loading";

  return (
    <section className="content-page narrow documents-page">
      <span className="eyebrow">MEDICAL DOCUMENTS</span>
      <h1>Your records</h1>
      <p className="page-intro">
        Upload prescriptions, lab reports, or other medical records. Securely stored for your health context.
      </p>

      {listError && (
        <p className="notice-error mb-4" role="alert">
          <CircleAlert size={18} />
          {listError.message || "Failed to load documents."}
        </p>
      )}

      {deleteError && (
        <p className="notice-error mb-4" role="alert">
          <CircleAlert size={18} />
          {deleteError.message || "We could not delete the document."}
        </p>
      )}

      <div className="setup-card mt-6">
        <form onSubmit={handleUpload} className="upload-form">
          <div className="setup-section" style={{ borderTop: "none", marginTop: 0, paddingTop: 0 }}>
            <h2>New document</h2>
            <br />
            <div className="form-group plain-input mt-2">
              <label htmlFor="documentType" className="eyebrow block mb-2">DOCUMENT TYPE</label>
              <select
                id="documentType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={isUploading}
                className="form-input"
              >
                {DOCUMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="form-group plain-input mt-4">
              <label htmlFor="file-upload" className="eyebrow block mb-2">SELECT FILE (PDF, JPG, PNG)</label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                disabled={isUploading}
                className="form-input"
              />
              <p className="text-sm mt-2 text-slate-500 font-medium">Maximum file size: {formatFileSize(MAX_FILE_SIZE)}.</p>
            </div>
          </div>

          {validationError && (
            <p className="notice-error mt-4" role="alert">
              <CircleAlert size={16} /> {validationError}
            </p>
          )}

          {uploadError && (
            <p className="notice-error mt-4" role="alert">
              <CircleAlert size={16} /> {uploadError.message || "Failed to upload document."}
            </p>
          )}

          <div className="button-row mt-6">
            <button
              type="submit"
              className="button-primary"
              disabled={!selectedFile || isUploading}
            >
              <FileUp size={16} />
              {isUploading ? "Uploading…" : "Upload secure document"}
            </button>
          </div>
        </form>
      </div>

      <div className="section-heading mt-10">
        <div>
          <h2>Uploaded documents</h2>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-card mt-6">
          <span><Search size={26}/></span>
          <h3>No documents uploaded</h3>
          <p>You haven't uploaded any medical records yet.</p>
        </div>
      ) : (
        <div className="consultation-list mt-6">
          {items.map(doc => (
            <article key={doc._id} className="consultation-card" style={{ alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <span className="status-chip status-completed mb-2">{doc.documentType.replace('_', ' ')}</span>
                <h3 title={doc.originalFileName}>{doc.originalFileName}</h3>
                <p>
                  Uploaded {formatDate(doc.createdAt)} &middot; {formatFileSize(doc.fileSize)}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.8rem", fontSize: "0.8rem", fontWeight: 600, color: doc.processingStatus === "FAILED" ? "#9b2c23" : "#087568" }}>
                   {doc.processingStatus !== 'FAILED' ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
                   {getStatusLabel(doc.processingStatus)}
                </div>

                {/* Show processing error for failed documents */}
                {doc.processingStatus === "FAILED" && doc.processingError && (
                  <p className="mt-2 text-xs text-red-600">{doc.processingError}</p>
                )}

                {/* Show extracted text and metadata for processed documents */}
                {doc.processingStatus === "PROCESSED" && (
                  <>
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">Extracted Text:</span>
                        <button
                          onClick={() => handleShowExtractedText(doc._id)}
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          {fetchingTextDocs.has(doc._id) ? "Loading…" : expandedTextDocs.has(doc._id) ? "Hide" : "Show"} text
                        </button>
                      </div>
                      {expandedTextDocs.has(doc._id) && (
                        <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto border">
                          {fetchingTextDocs.has(doc._id)
                            ? "Loading text…"
                            : doc.extractedText || "(No text extracted)"}
                        </div>
                      )}
                    </div>

                    {/* Show extraction metadata */}
                    <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3">
                      <span>Method: {doc.extractionMethod}</span>
                      {doc.processedAt && (
                        <span>Processed: {formatDate(new Date(doc.processedAt))}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => handleDelete(doc._id)}
                disabled={deleteStatus === "loading" && deletingId === doc._id}
                className="button-secondary button-small"
                title="Delete document"
              >
                <Trash2 size={16} /> {deleteStatus === "loading" && deletingId === doc._id ? "Deleting..." : "Delete"}
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link className="button-secondary outline" to="/patient/dashboard">
          <ArrowLeft size={17} /> Return to overview
        </Link>
      </div>
    </section>
  );
}