import React from "react";
import { Volume2 } from "lucide-react";

const QuestionCard = ({
  questionNumber,
  totalQuestions,
  title,
  subtitle,
  onRepeat,
  children,
}) => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Question Number */}
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Question {questionNumber} of {totalQuestions}
          </span>

          {/* Question Title */}
          <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>

          {/* Question Description */}
          {subtitle && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {/* Listen / Play Question */}
        <button
          type="button"
          onClick={onRepeat}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-700 transition hover:bg-emerald-50 active:scale-95"
          title="Listen to question"
          aria-label="Listen to question"
        >
          <Volume2 size={20} />
        </button>
      </div>

      {/* Dynamic Answer Content */}
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
};

export default QuestionCard;