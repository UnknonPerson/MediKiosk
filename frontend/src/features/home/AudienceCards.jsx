import React from "react";
import {
  UserRound,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const AudienceCards = () => {
  const patientBenefits = [
    "Easy to use, in your language",
    "No smartphone required",
    "Secure and private",
    "Your records, always with you",
  ];

  const hospitalBenefits = [
    "Reduced OPD congestion",
    "Structured patient data",
    "Integrates with HIS & ABDM",
    "Suitable for Allopathic & AYUSH settings",
  ];

  return (
    <section className="bg-[#f8fbfa] pb-16 sm:pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* FOR PATIENTS */}
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#e3f2ee] via-[#f6fbf9] to-[#dceee9] p-7 sm:p-10">
            
            <div className="relative z-10 max-w-[55%] sm:max-w-[60%]">
              
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 text-[#176b5b]">
                  <UserRound size={22} />
                </div>

                <h2 className="text-xl font-semibold text-[#17313d] sm:text-2xl">
                  For Patients
                </h2>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Save time. Share your story. Get better care.
              </p>

              <ul className="mt-5 space-y-3">
                {patientBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-[#176b5b]"
                    />

                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <button className="group mt-7 inline-flex items-center gap-3 rounded-lg bg-[#176b5b] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#115346]">
                Learn More

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* Patient Image */}
            <div className="absolute bottom-0 right-0 h-[88%] w-[48%]">
              <img
                src="/public/images/patient-card.png"
                alt="MediKiosk patient"
                className="h-full w-full object-cover object-top"
              />
            </div>

            {/* Soft Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10" />

          </div>

          {/* FOR HOSPITALS */}
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#e6f2f7] via-[#f8fbfc] to-[#dcebf2] p-7 sm:p-10">
            
            <div className="relative z-10 max-w-[58%] sm:max-w-[60%]">
              
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 text-[#2f6f88]">
                  <Building2 size={22} />
                </div>

                <h2 className="text-xl font-semibold text-[#17313d] sm:text-2xl">
                  For Hospitals
                </h2>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Higher efficiency. Better outcomes.
              </p>

              <ul className="mt-5 space-y-3">
                {hospitalBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-[#176b5b]"
                    />

                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <button className="group mt-7 inline-flex items-center gap-3 rounded-lg bg-[#176b5b] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#115346]">
                Request Demo

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* Doctor Image */}
            <div className="absolute bottom-0 right-0 h-[90%] w-[48%]">
              <img
                src="/public/images/doctor-card.png"
                alt="Doctor using MediKiosk platform"
                className="h-full w-full object-cover object-top"
              />
            </div>

            {/* Soft Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10" />

          </div>
        </div>
      </div>
    </section>
  );
};

export default AudienceCards;