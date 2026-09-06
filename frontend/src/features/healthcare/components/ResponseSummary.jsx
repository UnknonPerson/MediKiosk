import { CheckCircle2 } from "lucide-react";

import Card from "../../../components/ui/Cards/Card";

const ResponseSummary = ({ answers }) => {
  return (
    <div className="space-y-3">
      {answers.map((answer) => (
        <Card key={answer.questionId} padding="md" className="border-slate-100">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {answer.category}
          </span>
          <h3 className="mt-3 text-base font-semibold leading-relaxed text-slate-800">
            {answer.question}
          </h3>
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-700" />
            <span className="break-words">{answer.selectedAnswer}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ResponseSummary;
