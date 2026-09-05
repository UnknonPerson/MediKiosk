import React from "react";
import { CheckCircle2 } from "lucide-react";

const AnswerOptions = ({
  options = [],
  selectedAnswer,
  onSelect,
  columns = 2,
}) => {
  return (
    <div
      className={`grid gap-3 ${
        columns === 1
          ? "grid-cols-1"
          : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {options.map((option) => {
        const isSelected = selectedAnswer === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200 ${
              isSelected
                ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40"
            }`}
          >
            <span>{option}</span>

            {isSelected && (
              <CheckCircle2
                size={20}
                className="shrink-0 text-emerald-700"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AnswerOptions;