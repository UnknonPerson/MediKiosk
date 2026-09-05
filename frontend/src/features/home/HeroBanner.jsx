import React from "react";

import {
  ArrowRight,
  Play,
  Mic,
  FileText,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/button/Button";

const HeroBanner = () => {
  const features = [
    {
      icon: Mic,
      title: "Speak",
      subtitle: "Your History",
    },
    {
      icon: FileText,
      title: "Scan",
      subtitle: "Your Documents",
    },
    {
      icon: Brain,
      title: "AI Creates",
      subtitle: "Health Summary",
    },
    {
      icon: ShieldCheck,
      title: "Connected to",
      subtitle: "ABHA & Hospital",
    },
  ];

  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigation will be connected after PatientRoutes is created
    console.log("Get Started clicked");
    navigate("/patient/");
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-[#edf7f5] via-white to-[#e6f1ef]"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid min-h-[620px] items-center gap-10 py-12 lg:grid-cols-2 lg:py-0">

          {/* LEFT CONTENT */}
          <div className="relative z-10 max-w-2xl">

            {/* Small Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#dff1ec] px-4 py-2 text-xs font-medium text-[#176b5b] no-underline">
              <span>✦</span>
              An Initiative for a Healthier India
            </div>

            {/* Heading */}
            <h1 className="max-w-xl text-4xl font-bold leading-[1.12] tracking-tight text-[#17313d] no-underline sm:text-5xl lg:text-6xl">
              Your Story Today
              <span className="block text-[#176b5b] no-underline">
                Better Care Tomorrow
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 no-underline sm:text-lg">
              MediKiosk is an AI-powered clinical history platform that helps
              you record your medical history, scan your documents, and create
              a complete health summary — before you meet the doctor.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row" onClick={handleGetStarted}>

              <Button
                className="group flex items-center justify-center gap-3 bg-[#116b5a] px-7 py-3.5 text-white no-underline transition hover:bg-[#0b5749]"
              >
                Get Started

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center gap-3 border border-slate-300 bg-white px-7 py-3.5 text-[#17313d] no-underline"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dff1ec] text-[#116b5a]">
                  <Play size={13} fill="currentColor" />
                </span>

                Watch Video
              </Button>

            </div>

            {/* Feature Icons */}
            <div className="mt-12 grid grid-cols-4 gap-3 sm:gap-6">

              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="flex flex-col items-center text-center no-underline"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2f2ee] text-[#176b5b] shadow-sm sm:h-14 sm:w-14">
                      <Icon size={22} strokeWidth={1.8} />
                    </div>

                    <p className="mt-3 text-xs font-medium text-[#17313d] no-underline sm:text-sm">
                      {feature.title}
                    </p>

                    <p className="mt-1 hidden text-[10px] leading-4 text-slate-500 no-underline sm:block">
                      {feature.subtitle}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>

          {/* RIGHT IMAGE - HIDDEN ON MOBILE AND TABLET */}
          <div className="relative hidden items-end justify-center lg:flex lg:h-full">

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d7ebe7]/40 to-transparent blur-3xl" />

            {/* Main Banner Image */}
            <div className="relative h-[620px] w-full overflow-hidden lg:rounded-none">
              <img
                src="/public/images/medikiosk-banner.png"
                alt="Patient using MediKiosk"
                className="h-full w-full object-cover"
              />

              {/* Optional Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroBanner;