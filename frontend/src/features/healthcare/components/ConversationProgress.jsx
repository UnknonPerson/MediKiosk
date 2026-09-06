const ConversationProgress = ({ currentStepNumber, totalSteps, progressPercentage }) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-700">
          Step {currentStepNumber} of {totalSteps}
        </p>
        <p className="text-sm font-bold text-emerald-700">{progressPercentage}%</p>
      </div>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-100"
        role="progressbar"
        aria-label="Conversation progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progressPercentage}
      >
        <div
          className="h-full rounded-full bg-emerald-700 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ConversationProgress;
