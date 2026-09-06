import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MessageCircleHeart,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLoader from "../../../components/common/PageLoader";
import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/Cards/Card";
import ChatMessage from "../components/ChatMessage";
import useModernConversationSummary from "../hooks/useModernConversationSummary";

const formatCompletionDate = (completedAt) =>
  new Date(completedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const ModernSummaryPage = () => {
  const navigate = useNavigate();
  const { conversationRecord, isLoading, error } = useModernConversationSummary();

  if (isLoading) {
    return <PageLoader fullScreen text="Loading your conversation summary…" />;
  }

  if (error || !conversationRecord) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#f4faf8] px-5 py-10">
        <Card padding="lg" className="w-full max-w-lg border-sky-100 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
            <MessageCircleHeart size={28} className="text-sky-700" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            No conversation summary yet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {error || "Complete a Modern Health Conversation to view your summary here."}
          </p>
          <Button
            className="mt-7"
            onClick={() => navigate("/patient/healthcare/modern-conversation")}
          >
            Start a conversation
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 md:px-8">
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

      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        <div className="max-w-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100">
            <CheckCircle2 size={32} className="text-sky-700" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
            Conversation complete
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Your conversation summary
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            This is an organized record of the information you shared in the
            conversation.
          </p>
        </div>

        <Card padding="lg" className="mt-8 border-sky-100 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
                Conversation record
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Modern Health Conversation
              </h2>
            </div>
            <span className="inline-flex self-start items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700">
              <CheckCircle2 size={17} />
              Completed
            </span>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <ClipboardList size={19} className="text-sky-700" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Topics discussed
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {conversationRecord.responses.length}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <MessageCircleHeart size={19} className="text-sky-700" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Messages saved
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {conversationRecord.messages.length}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <CalendarDays size={19} className="text-sky-700" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Completed
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatCompletionDate(conversationRecord.completedAt)}
              </p>
            </div>
          </div>
        </Card>

        <section className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
            Conversation record
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Conversation transcript</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This is the complete record of the messages exchanged during your conversation.
          </p>

          <Card padding="md" className="mt-6 border-slate-100 bg-slate-50/70">
            <div
              className="space-y-5"
              role="log"
              aria-label="Saved modern health conversation messages"
            >
              {conversationRecord.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
            Information shared
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Your responses</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            These entries reflect your own words and have not been interpreted as a
            diagnosis or treatment recommendation.
          </p>

          <div className="mt-6 space-y-3">
            {conversationRecord.responses.map((response, index) => (
              <Card key={response.stepId} padding="md" className="border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
                  Topic {index + 1}
                </p>
                <h3 className="mt-2 text-base font-semibold leading-relaxed text-slate-800">
                  {response.question}
                </h3>
                <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                  {response.response}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <Card padding="lg" className="border-emerald-100">
            <h2 className="text-2xl font-bold text-slate-900">What would you like to do next?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              You can begin another conversation or review your health information in
              the patient dashboard.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button
                onClick={() => navigate("/patient/healthcare/modern-conversation")}
                className="w-full"
              >
                Start another conversation
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/patient/dashboard")}
                className="w-full"
              >
                View patient dashboard
              </Button>
            </div>
          </Card>
        </section>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-relaxed text-slate-600">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-sky-700" />
          <p>
            This conversation is an information summary only. It does not provide a
            medical diagnosis, prescribe treatment, or replace professional advice.
          </p>
        </div>
      </main>
    </section>
  );
};

export default ModernSummaryPage;
