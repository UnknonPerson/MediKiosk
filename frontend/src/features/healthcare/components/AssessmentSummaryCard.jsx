import { CalendarDays, CheckCircle2, ClipboardList, ListChecks } from "lucide-react";

import Card from "../../../components/ui/Cards/Card";

const AssessmentSummaryCard = ({ resultRecord, completedDate }) => {
  const completedQuestions = resultRecord.answers.filter(
    ({ selectedAnswer }) => selectedAnswer !== "Not answered"
  ).length;

  const summaryItems = [
    {
      icon: ClipboardList,
      label: "Assessment type",
      value: resultRecord.assessmentType,
    },
    {
      icon: ListChecks,
      label: "Questions answered",
      value: `${completedQuestions} of ${resultRecord.totalQuestions}`,
    },
    {
      icon: CalendarDays,
      label: "Completed",
      value: completedDate,
    },
  ];

  return (
    <Card padding="lg" className="border-emerald-100 shadow-md">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Assessment record
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {resultRecord.assessmentType}
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={17} />
          Assessment completed
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-xl bg-slate-50 p-4">
              <Icon size={19} className="text-emerald-700" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AssessmentSummaryCard;
