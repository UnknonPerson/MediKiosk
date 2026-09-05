import React from "react";
import { ArrowRight, Mic, FileText, Brain, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../../components/ui/Button/Button";

const WelcomePage = () => {
  const features = [
    {
      icon: Mic,
      title: "Speak",
      subtitle: "Your History",
    },
    {
      icon: FileText,
      title: "Upload",
      subtitle: "Your Records",
    },
    {
      icon: Brain,
      title: "AI Creates",
      subtitle: "Your Summary",
    },
  ];

  const navigate = useNavigate();

  const handleStart = () => {
    // Navigation will be connected after PatientRoutes is created
    console.log("Start patient journey");
    navigate("/patient/language");
  };

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      {/* Top Header */}
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700">
              <ShieldCheck size={24} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-800">
                MediKiosk
              </h1>

              <p className="text-xs text-slate-500">
                Smart Healthcare Assistant
              </p>
            </div>
          </div>

          {/* Language */}
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700"
          >
            English
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-5 py-10 md:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          
          {/* Left Content */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />

              <span className="text-sm font-medium text-emerald-700">
                AI-Powered Healthcare
              </span>
            </div>

            <h2 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your Health Story.
              <span className="block text-emerald-700">
                Clearly Understood.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              MediKiosk helps you share your medical history naturally.
              Speak in your own language, upload your medical documents,
              and let AI organize your health information for your doctor.
            </p>

            {/* CTA */}
            <div className="mt-8">
              <Button
                onClick={handleStart}
                className="flex items-center justify-center gap-2 px-7 py-4 text-base"
              >
                Start Your Health Journey
                <ArrowRight size={20} />
              </Button>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Takes only a few minutes • Secure • Private
            </p>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-50 p-5 shadow-xl">
              {/* Replace this image path with your generated banner */}
              <img
                src="/images/medikiosk-banner.png"
                alt="Patient interacting with MediKiosk healthcare system"
                className="h-[420px] w-full rounded-2xl object-cover md:h-[520px]"
              />

              {/* Floating AI Card */}
              <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                    <Brain size={22} className="text-emerald-700" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      AI Health Assistant
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Ready to understand your health history
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:grid-cols-3 md:px-8">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Icon size={22} className="text-emerald-700" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {feature.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default WelcomePage;