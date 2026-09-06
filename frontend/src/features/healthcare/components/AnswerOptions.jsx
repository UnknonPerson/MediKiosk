import { CheckCircle2 } from "lucide-react";

const AnswerOptions = ({ options, selectedAnswer, onSelect }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = option === selectedAnswer;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={isSelected}
            className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 sm:px-5 ${
              isSelected
                ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40"
            }`}
          >
            <span>{option}</span>

            {isSelected && (
              <CheckCircle2 size={20} className="ml-4 shrink-0 text-emerald-700" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AnswerOptions;
