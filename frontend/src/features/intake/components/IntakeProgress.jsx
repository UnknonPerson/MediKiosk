import React from "react";
import { Check } from "lucide-react";

const IntakeProgress = ({
  currentQuestion = 1,
  totalQuestions = 1,
}) => {
  const progressPercentage = Math.round(
    (currentQuestion / totalQuestions) * 100
  );

  const steps = Array.from(
    { length: totalQuestions },
    (_, index) => index + 1
  );

  return (
    <div className="w-full">
      {/* Progress Information */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Your Health Interview
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Question {currentQuestion} of {totalQuestions}
          </p>
        </div>

        <p className="text-sm font-bold text-emerald-700">
          {progressPercentage}% Complete
        </p>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-700 transition-all duration-500 ease-out"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>

      {/* Step Indicators */}
      <div className="mt-4 flex items-center justify-between">
        {steps.map((step) => {
          const isCompleted = step < currentQuestion;
          const isCurrent = step === currentQuestion;

          return (
            <div
              key={step}
              className="flex flex-1 items-center last:flex-none"
            >
              {/* Step Circle */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  isCompleted
                    ? "bg-emerald-700 text-white"
                    : isCurrent
                    ? "border-2 border-emerald-700 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-white text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={15} strokeWidth={3} />
                ) : (
                  step
                )}
              </div>

              {/* Connector */}
              {step !== totalQuestions && (
                <div
                  className={`mx-2 h-1 flex-1 rounded-full ${
                    step < currentQuestion
                      ? "bg-emerald-700"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntakeProgress;