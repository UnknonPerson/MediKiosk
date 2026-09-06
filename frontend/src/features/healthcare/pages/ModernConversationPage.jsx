import { useEffect, useRef } from "react";
import { ArrowLeft, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLoader from "../../../components/common/PageLoader";
import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/Cards/Card";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import ConversationProgress from "../components/ConversationProgress";
import SuggestedResponses from "../components/SuggestedResponses";
import useModernConversation from "../hooks/useModernConversation";

const ModernConversationPage = () => {
  const navigate = useNavigate();
  const conversationEndRef = useRef(null);
  const {
    currentStep,
    currentStepNumber,
    totalSteps,
    messages,
    progressPercentage,
    isLoading,
    isSending,
    error,
    sendResponse,
  } = useModernConversation();

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isSending, messages]);

  const handleResponse = async (response) => {
    const isComplete = await sendResponse(response);

    if (isComplete) {
      navigate("/patient/healthcare/modern-summary");
    }
  };

  if (isLoading) {
    return <PageLoader fullScreen text="Starting your conversation…" />;
  }

  if (error && !currentStep) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#f4faf8] px-5 py-10">
        <Card padding="lg" className="w-full max-w-lg border-sky-100 text-center">
          <p className="font-medium text-slate-700">{error}</p>
          <Button className="mt-6" onClick={() => navigate("/patient/healthcare")}>
            Return to healthcare options
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
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">MediKiosk</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                <MessageCircleHeart size={24} className="text-sky-700" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-700">
                  Health information conversation
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Modern Health Conversation
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
              Share what you have noticed, in your own words. This conversation helps
              organize information for future healthcare review.
            </p>
          </div>

          <span className="inline-flex self-start rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
            In progress
          </span>
        </div>

        <div className="mt-8">
          <ConversationProgress
            currentStepNumber={currentStepNumber}
            totalSteps={totalSteps}
            progressPercentage={progressPercentage}
          />
        </div>

        <Card padding="none" className="mt-7 overflow-hidden border-slate-100 shadow-sm">
          <div
            className="max-h-[52vh] min-h-80 space-y-5 overflow-y-auto bg-slate-50/70 p-4 sm:p-6"
            role="log"
            aria-live="polite"
            aria-label="Modern health conversation messages"
          >
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isSending && <ChatMessage isTyping />}
            <div ref={conversationEndRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-4 sm:p-6">
            <SuggestedResponses
              suggestions={currentStep?.suggestions || []}
              onSelect={handleResponse}
              disabled={isSending}
            />

            {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

            <div className="mt-5">
              <ChatInput onSend={handleResponse} disabled={!currentStep} isSending={isSending} />
            </div>
          </div>
        </Card>

        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-700" />
          This conversation collects information you choose to share. It does not
          provide a medical diagnosis, treatment, or replacement for professional care.
        </p>
      </main>
    </section>
  );
};

export default ModernConversationPage;
