import React from "react";
import {
  UserRoundCheck,
  Mic,
  FileText,
  Brain,
  Users,
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      icon: UserRoundCheck,
      title: "Identify",
      description:
        "Login with ABHA ID or register as a new patient. Select your language and give consent.",
    },
    {
      number: "2",
      icon: Mic,
      title: "Converse",
      description:
        "Share your medical history through natural voice or touchscreen interaction.",
    },
    {
      number: "3",
      icon: FileText,
      title: "Scan",
      description:
        "Upload prescriptions, lab reports and other medical documents.",
    },
    {
      number: "4",
      icon: Brain,
      title: "Get Summary",
      description:
        "AI creates a structured health summary and links it to your ABHA record.",
    },
    {
      number: "5",
      icon: Users,
      title: "Consult",
      description:
        "Doctor reviews the summary and focuses on providing better care.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-[#f8fbfa] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[#17313d] sm:text-4xl">
            How MediKiosk Works
          </h2>

          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            A simple, guided journey from check-in to consultation.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-4">

          {/* Desktop Connecting Line */}
          <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-[#cbded9] lg:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Number + Icon */}
                <div className="relative mb-6">

                  {/* Number */}
                  <div className="absolute -left-2 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#176b5b] text-xs font-semibold text-white shadow-md">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e1f1ed] text-[#176b5b] shadow-sm">
                    <Icon size={27} strokeWidth={1.8} />
                  </div>

                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-[#17313d]">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-3 max-w-[220px] text-sm leading-6 text-slate-500">
                  {step.description}
                </p>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;