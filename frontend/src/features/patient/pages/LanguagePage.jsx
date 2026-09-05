import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Languages,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";

const LanguagePage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const navigate = useNavigate();

  const languages = [
    {
      id: "en",
      name: "English",
      nativeName: "English",
      greeting: "Hello, how can I help you today?",
      icon: "🇬🇧",
    },
    {
      id: "hi",
      name: "Hindi",
      nativeName: "हिंदी",
      greeting: "नमस्ते, मैं आपकी कैसे मदद कर सकता हूँ?",
      icon: "🇮🇳",
    },
    {
      id: "mr",
      name: "Marathi",
      nativeName: "मराठी",
      greeting: "नमस्कार, मी तुम्हाला कशी मदत करू शकतो?",
      icon: "🇮🇳",
    },
    {
      id: "gu",
      name: "Gujarati",
      nativeName: "ગુજરાતી",
      greeting: "નમસ્તે, હું તમારી કેવી રીતે મદદ કરી શકું?",
      icon: "🇮🇳",
    },
    {
      id: "ta",
      name: "Tamil",
      nativeName: "தமிழ்",
      greeting: "வணக்கம், நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      icon: "🇮🇳",
    },
    {
      id: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
      greeting: "నమస్కారం, నేను మీకు ఎలా సహాయం చేయగలను?",
      icon: "🇮🇳",
    },
  ];

  const selectedLanguageData = languages.find(
    (language) => language.id === selectedLanguage
  );

  const handleContinue = () => {
    console.log("Selected language:", selectedLanguage);
    navigate("/patient/identify");
    // Navigation will be connected later
    // Example:
    // navigate("/patient/identify");
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700">
              <Languages size={19} className="text-white" />
            </div>

            <span className="font-bold text-slate-800">
              MediKiosk
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-4xl items-center px-5 py-10">
        <div className="w-full">
          {/* Title */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <Languages
                size={30}
                className="text-emerald-700"
              />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Choose Your Language
            </h1>

            <p className="mt-3 text-base text-slate-600">
              Select the language you are most comfortable speaking.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              You can change your language later.
            </p>
          </div>

          {/* Language Grid */}
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {languages.map((language) => {
              const isSelected =
                selectedLanguage === language.id;

              return (
                <button
                  key={language.id}
                  type="button"
                  onClick={() =>
                    setSelectedLanguage(language.id)
                  }
                  className={`relative rounded-2xl border p-5 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700">
                      <Check
                        size={15}
                        strokeWidth={3}
                        className="text-white"
                      />
                    </div>
                  )}

                  {/* Flag */}
                  <div className="text-3xl">
                    {language.icon}
                  </div>

                  {/* Language Name */}
                  <h2 className="mt-4 text-lg font-semibold text-slate-800">
                    {language.nativeName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {language.name}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Voice Preview */}
          {selectedLanguageData && (
            <div className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Volume2
                    size={22}
                    className="text-emerald-700"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    Language Preview
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedLanguageData.greeting}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                Listen
              </button>
            </div>
          )}

          {/* Continue */}
          <div className="mx-auto mt-8 flex max-w-md">
            <Button
              onClick={handleContinue}
              className="flex w-full items-center justify-center gap-2 py-4"
            >
              Continue in {selectedLanguageData?.name}
              <ArrowRight size={19} />
            </Button>
          </div>
        </div>
      </main>
    </section>
  );
};

export default LanguagePage;