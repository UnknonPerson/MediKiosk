import { CheckCircle2, FileText } from "lucide-react";

import Card from "../../../components/ui/Cards/Card";

const formatRecordDate = (createdAt) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const HealthRecordsCard = ({ activities }) => {
  return (
    <Card padding="lg" className="h-full border-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">
            Recent records
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">Recent Health Records</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <FileText size={20} />
        </div>
      </div>

      {!activities.length ? (
        <p className="mt-6 text-sm leading-relaxed text-slate-600">
          Completed AYUSH assessments and Modern Health Conversations will appear here.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {activities.slice(0, 3).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-800">{activity.title}</p>
                <p className="mt-1 text-xs text-slate-500">{formatRecordDate(activity.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        Documents, prescriptions, and test reports will appear here when connected.
      </p>
    </Card>
  );
};

export default HealthRecordsCard;
