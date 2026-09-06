import {
  Apple,
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Leaf,
  MoonStar,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLoader from "../../../components/common/PageLoader";
import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/Cards/Card";
import AssessmentSummaryCard from "../components/AssessmentSummaryCard";
import ResponseSummary from "../components/ResponseSummary";
import WellnessInsightCard from "../components/WellnessInsightCard";
import useAyushResult from "../hooks/useAyushResult";

const insightIcons = {
  lifestyle: Sun,
  sleep: MoonStar,
  nutrition: Apple,
  "general-wellbeing": HeartPulse,
};

const formatCompletionDate = (completedAt) => {
  const completionDate = new Date(completedAt);
  const today = new Date();

  if (completionDate.toDateString() === today.toDateString()) {
    return "Today";
  }

  return completionDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AyushResultPage = () => {
  const navigate = useNavigate();
  const { resultRecord, isLoading, error } = useAyushResult();

  const handleStartNewAssessment = () => {
    navigate("/patient/healthcare/ayush-assessment");
  };

  const handleModernConversationStart = () => {
    navigate("/patient/healthcare/modern-conversation");
  };

  const handleDashboardOpen = () => {
    navigate("/patient/dashboard");
  };

  if (isLoading) {
    return <PageLoader fullScreen text="Loading your assessment summary…" />;
  }

  if (error || !resultRecord) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#f4faf8] px-5 py-10">
        <Card padding="lg" className="w-full max-w-lg border-emerald-100 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <Leaf size={28} className="text-emerald-700" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            No assessment summary yet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {error || "Complete an AYUSH wellness assessment to view your summary here."}
          </p>
          <Button className="mt-7" onClick={handleStartNewAssessment}>
            Start AYUSH assessment
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <button
            type="button"
            onClick={() => navigate("/patient/healthcare")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            <ArrowLeft size={18} />
            Healthcare options
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">MediKiosk</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <div className="max-w-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <Leaf size={32} className="text-emerald-700" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            AYUSH Assessment Complete
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Your wellness summary
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Here is a summary of the information you shared during your assessment.
          </p>
        </div>

        <div className="mt-8">
          <AssessmentSummaryCard
            resultRecord={resultRecord}
            completedDate={formatCompletionDate(resultRecord.completedAt)}
          />
        </div>

        <section className="mt-12">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Assessment summary
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Your responses</h2>
            </div>
            <p className="text-sm text-slate-500">{resultRecord.answers.length} responses recorded</p>
          </div>

          <div className="mt-6">
            <ResponseSummary answers={resultRecord.answers} />
          </div>
        </section>

        <section className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
            Information summary
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            General Wellness Overview
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Based on the information you shared, your responses have been organized
            into a wellness summary. These frontend preview cards are not clinical
            conclusions or medical advice.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {resultRecord.wellnessInsights.map((insight) => (
              <WellnessInsightCard
                key={insight.id}
                icon={insightIcons[insight.id] || HeartPulse}
                area={insight.area}
                detail={insight.detail}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <Card padding="lg" className="border-emerald-100">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Continue your journey
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              What would you like to do next?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              You can start a new wellness check-in, begin a Modern Health Conversation,
              or review your health information in the patient dashboard.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Button
                onClick={handleStartNewAssessment}
                rightIcon={<ArrowRight size={18} />}
                className="w-full"
              >
                Start new assessment
              </Button>
              <Button
                variant="secondary"
                onClick={handleModernConversationStart}
                className="w-full"
              >
                Start conversation
              </Button>
              <Button variant="secondary" onClick={handleDashboardOpen} className="w-full">
                View patient dashboard
              </Button>
            </div>
          </Card>
        </section>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-relaxed text-slate-600">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-sky-700" />
          <p>
            This assessment summarizes the information you shared. It is not a
            medical diagnosis and does not replace advice from a qualified healthcare
            professional.
          </p>
        </div>
      </main>
    </section>
  );
};

export default AyushResultPage;
