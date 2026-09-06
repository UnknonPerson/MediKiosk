import {
  ArrowLeft,
  HeartPulse,
  Leaf,
  MessageCircleHeart,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import HealthcareOptionCard from "../components/HealthcareOptionCard";

const HealthcareSelectionPage = () => {
  const navigate = useNavigate();

  const handleAyushAssessmentStart = () => {
    navigate("/patient/healthcare/ayush-assessment");
  };

  const handleModernConversationStart = () => {
    navigate("/patient/healthcare/modern-conversation");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <button
            type="button"
            onClick={handleBack}
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

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-5 py-10 md:px-8">
        <div className="w-full">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <HeartPulse size={31} className="text-emerald-700" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              How would you like to continue?
            </h1>

            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Choose the type of health support that feels right for you.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
            <HealthcareOptionCard
              icon={Leaf}
              title="AYUSH Assessment"
              description="Personalized traditional healthcare assessment tailored to your wellness needs."
              actionLabel="Start Assessment"
              iconClassName="bg-emerald-100 text-emerald-700"
              onStart={handleAyushAssessmentStart}
            />

            <HealthcareOptionCard
              icon={MessageCircleHeart}
              title="Modern Health Conversation"
              description="Discuss your health concerns through an intelligent health conversation."
              actionLabel="Start Conversation"
              iconClassName="bg-sky-100 text-sky-700"
              onStart={handleModernConversationStart}
            />
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-slate-400">
            <ShieldCheck size={15} className="shrink-0" />
            Your information is private and protected throughout your journey.
          </p>
        </div>
      </main>
    </section>
  );
};

export default HealthcareSelectionPage;
