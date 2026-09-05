import React, { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  UserCheck,
  FileText,
  Check,
  Volume2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";

const ConsentPage = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const navigate = useNavigate();
  const privacyPoints = [
    {
      icon: Lock,
      title: "Your data is protected",
      description:
        "Your health information is securely stored and protected.",
    },
    {
      icon: UserCheck,
      title: "Only authorized access",
      description:
        "Only authorized healthcare professionals can access your information.",
    },
    {
      icon: FileText,
      title: "Used for your healthcare",
      description:
        "Your information is used to help doctors understand your health history.",
    },
  ];

  const handleContinue = () => {
    if (!hasConsent) {
      alert("Please accept the consent to continue.");
      return;
    }

    console.log("Consent accepted");
    navigate("/patient/intake");
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
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

            <span className="font-bold text-slate-800">
              MediKiosk
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl items-center px-5 py-10">
        <div className="w-full">
          {/* Page Title */}
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100">
              <ShieldCheck
                size={40}
                className="text-emerald-700"
              />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Your Privacy Matters
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              Before we begin, we need your permission to collect and
              process your health information.
            </p>
          </div>

          {/* Privacy Information */}
          <div className="mt-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              How your information is used
            </h2>

            <div className="mt-6 space-y-5">
              {privacyPoints.map((point) => {
                const Icon = point.icon;

                return (
                  <div
                    key={point.title}
                    className="flex gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <Icon
                        size={21}
                        className="text-emerald-700"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700">
                        {point.title}
                      </h3>

                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {point.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consent Box */}
          <button
            type="button"
            onClick={() => setHasConsent(!hasConsent)}
            className={`mt-6 flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
              hasConsent
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-white hover:border-emerald-300"
            }`}
          >
            {/* Checkbox */}
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                hasConsent
                  ? "border-emerald-700 bg-emerald-700"
                  : "border-slate-300 bg-white"
              }`}
            >
              {hasConsent && (
                <Check
                  size={16}
                  strokeWidth={3}
                  className="text-white"
                />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                I give my consent
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                I agree to share my health information with MediKiosk
                and authorized healthcare professionals for medical
                assessment, treatment, and healthcare services.
              </p>
            </div>
          </button>

          {/* Audio Option */}
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <Volume2 size={18} className="text-emerald-700" />
            Listen to this information
          </button>

          {/* Continue Button */}
          <div className="mt-6">
            <Button
              onClick={handleContinue}
              className="flex w-full items-center justify-center gap-2 py-4"
            >
              I Agree & Continue
              <ArrowRight size={19} />
            </Button>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
            You may withdraw your consent according to the applicable
            healthcare and data privacy policies.
          </p>
        </div>
      </main>
    </section>
  );
};

export default ConsentPage;