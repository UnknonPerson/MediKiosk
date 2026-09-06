import Card from "../../../components/ui/Cards/Card";

const QuestionCard = ({ category, question, children }) => {
  return (
    <Card padding="lg" className="border-emerald-100 shadow-sm">
      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        {category}
      </span>

      <h2 className="mt-5 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
        {question}
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        Select the answer that best describes your current experience.
      </p>

      <div className="mt-7">{children}</div>
    </Card>
  );
};

export default QuestionCard;
