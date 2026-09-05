import React, { useState } from "react";
import { ArrowLeft, ArrowRight, MessageSquareHeart } from "lucide-react";
import Button from "../../../components/ui/Button/Button";
import { useNavigate } from "react-router-dom";
import QuestionCard from '../components/QuestionCard';
import AnswerOptions from "../components/AnswerOptions";
import VoiceRecorder from "../components/VoiceRecorder";
import TranscriptPreview from "../components/TranscriptPreview";
import IntakeProgress from "../components/IntakeProgress";
import RepeatQuestionButton from "../components/RepeatQuestionButton";

const IntakePage = () => {

  const questions = [
    {
      id: 1,
      title: "What brings you here today?",
      subtitle:
        "Please describe the main health problem or concern you are experiencing.",
      type: "voice",
      options: [],
    },

    {
      id: 2,
      title: "How long have you been experiencing this problem?",
      subtitle:
        "Choose the option that best describes your situation.",
      type: "options",
      options: [
        "Today",
        "A few days",
        "More than a week",
        "More than a month",
      ],
    },

    {
      id: 3,
      title: "How severe is your discomfort?",
      subtitle:
        "Select the option that best matches how you feel.",
      type: "options",
      options: [
        "Mild",
        "Moderate",
        "Severe",
        "Very Severe",
      ],
    },

    {
      id: 4,
      title: "Have you experienced this problem before?",
      subtitle:
        "Choose the answer that best describes your medical history.",
      type: "options",
      options: [
        "Yes",
        "No",
        "I am not sure",
      ],
    },

    {
      id: 5,
      title: "Is there anything else you would like to tell us?",
      subtitle:
        "You can describe any additional symptoms or concerns.",
      type: "voice",
      options: [],
    },
  ];

  // --------------------------------
  // STATE
  // --------------------------------

  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [transcript, setTranscript] =
    useState("");

  const [recordedAudio, setRecordedAudio] =
    useState(null);

  const [isQuestionPlaying, setIsQuestionPlaying] =
    useState(false);

  const [isTranscriptProcessing, setIsTranscriptProcessing] =
    useState(false);

  // --------------------------------
  // CURRENT QUESTION
  // --------------------------------

  const currentQuestion =
    questions[currentQuestionIndex];

  const totalQuestions =
    questions.length;

  const currentQuestionNumber =
    currentQuestionIndex + 1;

  // --------------------------------
  // SELECT ANSWER
  // --------------------------------

  const handleOptionSelect = (option) => {
    setSelectedAnswer(option);
  };

  // --------------------------------
  // REPEAT QUESTION
  // --------------------------------

  const handleRepeatQuestion = () => {
    if (isQuestionPlaying) return;

    setIsQuestionPlaying(true);

    console.log(
      "Repeating question:",
      currentQuestion.title
    );

    /*
      Later:
      Connect Text-to-Speech API here.

      Example flow:

      1. Send currentQuestion.title
      2. Generate audio
      3. Play generated audio
      4. Set isQuestionPlaying(false)
    */

    // Temporary browser text-to-speech
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(
        `${currentQuestion.title}. ${currentQuestion.subtitle}`
      );

      speech.onend = () => {
        setIsQuestionPlaying(false);
      };

      speech.onerror = () => {
        setIsQuestionPlaying(false);
      };

      window.speechSynthesis.speak(speech);
    } else {
      setIsQuestionPlaying(false);
    }
  };

  // --------------------------------
  // RECORDING COMPLETE
  // --------------------------------

  const handleRecordingComplete = (
    audioBlob
  ) => {
    setRecordedAudio(audioBlob);

    /*
      Later:
      Send audioBlob to backend.

      Backend flow:

      audioBlob
          ↓
      Speech-to-Text API
          ↓
      Transcript
          ↓
      setTranscript(transcript)
    */

    if (audioBlob) {
      console.log(
        "Audio recording completed:",
        audioBlob
      );
    }
  };

  // --------------------------------
  // GET CURRENT ANSWER
  // --------------------------------

  const getCurrentAnswer = () => {
    if (currentQuestion.type === "voice") {
      return transcript.trim();
    }

    return selectedAnswer.trim();
  };

  // --------------------------------
  // SAVE ANSWER
  // --------------------------------

  const saveCurrentAnswer = () => {
    const answer = getCurrentAnswer();

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: {
        question: currentQuestion.title,
        answer,
        type: currentQuestion.type,
        audio:
          currentQuestion.type === "voice"
            ? recordedAudio
            : null,
      },
    }));
  };

  // --------------------------------
  // NEXT QUESTION
  // --------------------------------

  const handleNext = () => {
    const answer = getCurrentAnswer();

    if (!answer) {
      alert(
        "Please provide an answer before continuing."
      );

      return;
    }

    // Save answer
    saveCurrentAnswer();

    // Go to next question
    if (
      currentQuestionIndex <
      totalQuestions - 1
    ) {
      const nextIndex =
        currentQuestionIndex + 1;

      const nextQuestion =
        questions[nextIndex];

      setCurrentQuestionIndex(nextIndex);

      // Restore existing answer if available
      const existingAnswer =
        answers[nextQuestion.id];

      if (nextQuestion.type === "voice") {
        setTranscript(
          existingAnswer?.answer || ""
        );

        setSelectedAnswer("");

        setRecordedAudio(
          existingAnswer?.audio || null
        );
      } else {
        setSelectedAnswer(
          existingAnswer?.answer || ""
        );

        setTranscript("");

        setRecordedAudio(null);
      }

      return;
    }

    // --------------------------------
    // COMPLETE INTAKE
    // --------------------------------

    console.log(
      "Intake completed"
    );

    console.log(
      "All answers:",
      answers
    );

    /*
      IMPORTANT:

      The current answer is saved asynchronously,
      so do not rely only on `answers` here.

      Later we will send the complete
      intake object to the backend.

      Then:
      navigate("/patient/documents")
    */

    alert(
      "Health interview completed successfully!"
    );

    navigate("/patient/completion");
  };

  // --------------------------------
  // PREVIOUS QUESTION
  // --------------------------------

  const handlePrevious = () => {
    // First question
    if (currentQuestionIndex === 0) {
      window.history.back();

      return;
    }

    const previousIndex =
      currentQuestionIndex - 1;

    const previousQuestion =
      questions[previousIndex];

    const existingAnswer =
      answers[previousQuestion.id];

    setCurrentQuestionIndex(
      previousIndex
    );

    if (previousQuestion.type === "voice") {
      setTranscript(
        existingAnswer?.answer || ""
      );

      setSelectedAnswer("");

      setRecordedAudio(
        existingAnswer?.audio || null
      );
    } else {
      setSelectedAnswer(
        existingAnswer?.answer || ""
      );

      setTranscript("");

      setRecordedAudio(null);
    }
  };

  // --------------------------------
  // BUTTON TEXT
  // --------------------------------

  const isLastQuestion =
    currentQuestionIndex ===
    totalQuestions - 1;

  // --------------------------------
  // RENDER
  // --------------------------------

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      {/* =========================
          HEADER
      ========================= */}

      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          {/* Back */}

          <button
            type="button"
            onClick={handlePrevious}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            <ArrowLeft size={18} />

            Back
          </button>

          {/* Logo */}

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700">
              <MessageSquareHeart
                size={21}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="font-bold text-slate-800">
                MediKiosk
              </h1>

              <p className="text-xs text-slate-500">
                Health Interview
              </p>
            </div>
          </div>

          {/* Question Number */}

          <span className="text-sm font-semibold text-emerald-700">
            {currentQuestionNumber} /{" "}
            {totalQuestions}
          </span>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="mx-auto max-w-3xl px-5 py-10">
        {/* =====================
            PROGRESS
        ===================== */}

        <div className="mb-10">
          <IntakeProgress
            currentQuestion={
              currentQuestionNumber
            }
            totalQuestions={
              totalQuestions
            }
          />
        </div>

        {/* =====================
            QUESTION CARD
        ===================== */}

        <QuestionCard
          questionNumber={
            currentQuestionNumber
          }
          totalQuestions={
            totalQuestions
          }
          title={
            currentQuestion.title
          }
          subtitle={
            currentQuestion.subtitle
          }
          onRepeat={
            handleRepeatQuestion
          }
        >
          {/* =================
              VOICE QUESTION
          ================= */}

          {currentQuestion.type ===
            "voice" && (
            <div>
              <VoiceRecorder
                onRecordingComplete={
                  handleRecordingComplete
                }
                onTranscriptChange={
                  setTranscript
                }
              />

              <TranscriptPreview
                transcript={transcript}
                onChange={setTranscript}
                isProcessing={
                  isTranscriptProcessing
                }
              />
            </div>
          )}

          {/* =================
              OPTION QUESTION
          ================= */}

          {currentQuestion.type ===
            "options" && (
            <AnswerOptions
              options={
                currentQuestion.options
              }
              selectedAnswer={
                selectedAnswer
              }
              onSelect={
                handleOptionSelect
              }
            />
          )}

          {/* =================
              REPEAT BUTTON
          ================= */}

          <div className="mt-6">
            <RepeatQuestionButton
              onRepeat={
                handleRepeatQuestion
              }
              isPlaying={
                isQuestionPlaying
              }
            />
          </div>

          {/* =================
              NAVIGATION
          ================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Previous */}

            <button
              type="button"
              onClick={
                handlePrevious
              }
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Previous
            </button>

            {/* Next */}

            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center justify-center gap-2 px-7 py-3"
            >
              {isLastQuestion
                ? "Complete Interview"
                : "Next Question"}

              <ArrowRight size={18} />
            </Button>
          </div>
        </QuestionCard>

        {/* =====================
            HELP TEXT
        ===================== */}

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
          Speak naturally and answer honestly.
          Your responses help healthcare
          professionals understand your health
          concerns.
        </p>
      </main>
    </section>
  );
};

export default IntakePage;