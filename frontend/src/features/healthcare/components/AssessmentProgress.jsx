const AssessmentProgress = ({
  currentQuestionNumber,
  totalQuestions,
  progressPercentage,
}) => {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Question {currentQuestionNumber} of {totalQuestions}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Your responses are saved as you continue.
          </p>
        </div>

        <span className="text-sm font-bold text-emerald-700">
          {progressPercentage}%
        </span>
      </div>

      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progressPercentage}
        aria-label="Assessment progress"
      >
        <div
          className="h-full rounded-full bg-emerald-700 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default AssessmentProgress;
