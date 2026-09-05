import React from "react";
import { RotateCcw, Volume2 } from "lucide-react";

const RepeatQuestionButton = ({
  onRepeat,
  isPlaying = false,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onRepeat}
      disabled={disabled || isPlaying}
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
        disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-400"
          : isPlaying
          ? "cursor-wait bg-emerald-50 text-emerald-600"
          : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
      }`}
      aria-label="Repeat question"
    >
      {isPlaying ? (
        <>
          <Volume2 size={18} className="animate-pulse" />
          Playing question...
        </>
      ) : (
        <>
          <RotateCcw size={18} />
          Repeat this question
        </>
      )}
    </button>
  );
};

export default RepeatQuestionButton;