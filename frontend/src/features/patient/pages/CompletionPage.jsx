import React from "react";
import {
  CheckCircle2,
  ArrowRight,
  Home,
  FileText,
  ShieldCheck,
  Clock,
} from "lucide-react";

import Button from "../../../components/ui/Button/Button";

const CompletionPage = () => {
  const handleViewSummary = () => {
    console.log("Navigate to patient summary");

    // Later:
    // navigate("/patient/summary");
  };

  const handleFinish = () => {
    console.log("Finish patient session");

    // Later:
    // navigate("/");
  };

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700">
              <ShieldCheck size={21} className="text-white" />
            </div>

            <div>
              <h1 className="font-bold text-slate-800">
                MediKiosk
              </h1>

              <p className="text-xs text-slate-500">
                Smart Healthcare Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={18} />
            Completed
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-3xl items-center justify-center px-5 py-10">
        <div className="w-full text-center">
          {/* Success Icon */}
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />

            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2
                size={52}
                className="text-emerald-700"
              />
            </div>
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-3xl font-bold text-slate-900 sm:text-4xl">
            You're All Set!
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Your health information has been successfully collected
            and organized. Your healthcare team can now review your
            medical history more efficiently.
          </p>

          {/* Completion Card */}
          <div className="mt-8 rounded-3xl border border-emerald-100 bg-white p-6 text-left shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800">
              Your Health Journey Summary
            </h2>

            <div className="mt-6 space-y-5">
              {/* Medical History */}
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircle2
                    size={21}
                    className="text-emerald-700"
                  />
                </div>

                <div>
                  <p className="font-medium text-slate-700">
                    Medical history recorded
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your health information has been captured.
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <FileText
                    size={21}
                    className="text-emerald-700"
                  />
                </div>

                <div>
                  <p className="font-medium text-slate-700">
                    Medical documents processed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your uploaded records are ready for review.
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <Clock
                    size={21}
                    className="text-emerald-700"
                  />
                </div>

                <div>
                  <p className="font-medium text-slate-700">
                    Clinical summary generated
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your information is organized for your healthcare
                    professional.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left">
            <p className="text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-700">
                What's next?
              </span>{" "}
              Your doctor can review your health information and
              discuss the next steps with you.
            </p>
          </div>

          {/* Actions */}
          <div className="mx-auto mt-8 flex max-w-xl flex-col gap-4 sm:flex-row">
            <Button
              onClick={handleViewSummary}
              className="flex flex-1 items-center justify-center gap-2 py-4"
            >
              View Health Summary
              <ArrowRight size={19} />
            </Button>

            <button
              type="button"
              onClick={handleFinish}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <Home size={19} />
              Finish
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={15} />
            Your health information is securely protected.
          </div>
        </div>
      </main>
    </section>
  );
};

export default CompletionPage;