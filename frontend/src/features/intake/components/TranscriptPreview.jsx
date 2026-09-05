import React from "react";
import { FileText, Edit3, CheckCircle2 } from "lucide-react";

const TranscriptPreview = ({
  transcript = "",
  onChange,
  isProcessing = false,
}) => {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <FileText
            size={20}
            className="text-emerald-700"
          />
        </div>

        <div>
          <h3 className="font-semibold text-slate-800">
            Your Response
          </h3>

          <p className="text-xs text-slate-500">
            Review and edit your response if needed.
          </p>
        </div>
      </div>

      {/* Processing */}
      {isProcessing && (
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />

          <p className="text-sm font-medium text-emerald-700">
            Converting your speech to text...
          </p>
        </div>
      )}

      {/* Transcript Input */}
      {!isProcessing && (
        <div className="relative mt-5">
          <Edit3
            size={18}
            className="absolute left-4 top-4 text-slate-400"
          />

          <textarea
            value={transcript}
            onChange={(event) => onChange(event.target.value)}
            rows="5"
            placeholder="Your spoken response will appear here..."
            className="w-full resize-none rounded-xl border border-slate-200 py-4 pl-12 pr-4 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      )}

      {/* Confirmation */}
      {!isProcessing && transcript.trim() && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 size={17} />

          <span>Your response is ready.</span>
        </div>
      )}
    </div>
  );
};

export default TranscriptPreview;