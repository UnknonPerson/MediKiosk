import React, { useState } from "react";
import {
  ArrowLeft,
  QrCode,
  Fingerprint,
  Info,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from '../../../components/ui/button/Button';

const PatientIdentification = () => {
  const [activeTab, setActiveTab] = useState("abha");
  const [abhaId, setAbhaId] = useState("");

  const navigate = useNavigate();

  const handleContinue = () => {
    if (activeTab === "abha" && !abhaId.trim()) {
      alert("Please enter your ABHA ID");
      return;
    }

    console.log("Continue with:", activeTab, abhaId);
    navigate("/patient/consent");
  };

  return (
    <section className="min-h-screen bg-[#eef7f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <button
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2
                size={17}
                className="text-emerald-700"
              />
            </div>

            <span className="font-semibold text-slate-700">
              MediKiosk
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              Patient Identification
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Login with your ABHA ID or register as a new patient.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab("abha")}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === "abha"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Using ABHA ID
            </button>

            <button
              onClick={() => setActiveTab("aadhaar")}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === "aadhaar"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Aadhaar
            </button>

            <button
              onClick={() => setActiveTab("new")}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === "new"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              New Registration
            </button>
          </div>

          {/* ABHA ID Form */}
          {activeTab === "abha" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Enter your ABHA ID
              </label>

              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="e.g. 12-3456-7890-1234"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Alternative Methods */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-400 hover:bg-emerald-50">
                  <QrCode
                    size={32}
                    className="text-emerald-700"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Scan QR Code
                  </span>
                </button>

                <button className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-400 hover:bg-emerald-50">
                  <Fingerprint
                    size={32}
                    className="text-emerald-700"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Use Aadhaar
                  </span>
                </button>
              </div>

              {/* Help */}
              <button className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-700 hover:underline">
                <Info size={15} />
                What is ABHA ID?
              </button>
            </div>
          )}

          {/* Aadhaar */}
          {activeTab === "aadhaar" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Enter Aadhaar Number
              </label>

              <input
                type="text"
                placeholder="XXXX XXXX XXXX"
                maxLength={12}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <p className="mt-3 text-xs text-slate-500">
                Your Aadhaar information is securely processed for
                identification.
              </p>
            </div>
          )}

          {/* New Registration */}
          {activeTab === "new" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="mt-8 flex w-full items-center justify-center gap-2"
          >
            Continue
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PatientIdentification;