const SuggestedResponses = ({ suggestions, onSelect, disabled }) => {
  if (!suggestions.length) {
    return null;
  }

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Quick responses
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-left text-sm font-medium text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedResponses;
