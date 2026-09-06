import { CheckCircle2, Leaf, MessageCircleHeart } from "lucide-react";

import Card from "../../../components/ui/Cards/Card";

const activityIcons = {
  ayush_assessment: {
    icon: Leaf,
    className: "bg-emerald-100 text-emerald-700",
  },
  modern_conversation: {
    icon: MessageCircleHeart,
    className: "bg-sky-100 text-sky-700",
  },
};

const formatActivityDate = (createdAt) => {
  const activityDate = new Date(createdAt);

  if (Number.isNaN(activityDate.getTime())) {
    return "Date unavailable";
  }

  const today = new Date();
  const isToday = activityDate.toDateString() === today.toDateString();
  const dateLabel = isToday
    ? "Today"
    : activityDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  const timeLabel = activityDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateLabel} · ${timeLabel}`;
};

const RecentActivity = ({ activities }) => {
  if (!activities.length) {
    return (
      <Card padding="lg" className="border-dashed border-slate-200 text-center shadow-none">
        <h3 className="text-lg font-semibold text-slate-800">No health activity yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          Completed AYUSH assessments and Modern Health Conversations will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const activityStyle = activityIcons[activity.type] || activityIcons.modern_conversation;
        const Icon = activityStyle.icon;

        return (
          <Card key={activity.id} padding="md" className="border-slate-200 shadow-none">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activityStyle.className}`}
              >
                <Icon size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-slate-800">{activity.title}</h3>
                    <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">
                      {activity.description}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} />
                    {activity.status}
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-400">
                  {formatActivityDate(activity.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RecentActivity;
