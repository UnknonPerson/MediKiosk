import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/Cards/Card";
import AnswerOptions from "../components/AnswerOptions";
import AssessmentProgress from "../components/AssessmentProgress";
import QuestionCard from "../components/QuestionCard";
import useAyushAssessment from "../hooks/useAyushAssessment";

const AyushAssessmentPage = () => {
  const navigate = useNavigate();
  const {
    assessment,
    currentQuestion,
    currentQuestionNumber,
    totalQuestions,
    selectedAnswer,
    progressPercentage,
    isFirstQuestion,
    isLastQuestion,
    hasStarted,
    isLoading,
    isSubmitting,
    error,
    startAssessment,
    selectAnswer,
    previousQuestion,
    nextQuestion,
  } = useAyushAssessment();

  const handleBack = () => {
    if (hasStarted && !isFirstQuestion) {
      previousQuestion();
      return;
    }

    if (hasStarted) {
      navigate("/patient/healthcare");
      return;
    }

    navigate("/patient/healthcare");
  };

  const handleNext = async () => {
    const isComplete = await nextQuestion();

    if (isComplete) {
      navigate("/patient/healthcare/ayush-result");
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#f4faf8] px-5">
        <Card padding="lg" className="w-full max-w-md text-center">
          <Leaf className="mx-auto animate-pulse text-emerald-700" size={32} />
          <p className="mt-4 font-medium text-slate-700">Preparing your assessment…</p>
        </Card>
      </section>
    );
  }

  if (error && !assessment) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#f4faf8] px-5">
        <Card padding="lg" className="w-full max-w-md text-center">
          <p className="font-medium text-slate-700">{error}</p>
          <Button className="mt-6" onClick={() => navigate("/patient/healthcare")}>
            Return to healthcare options
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 md:px-8">
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

      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        {!hasStarted ? (
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100">
                <Leaf size={39} className="text-emerald-700" />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Wellness check-in
              </p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                {assessment.title}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                {assessment.description}
              </p>
            </div>

            <Card padding="lg" className="mt-8 border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircle2 size={22} className="text-emerald-700" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Before you begin</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    This is a general wellness questionnaire. It does not provide a
                    medical diagnosis or replace advice from a qualified healthcare
                    professional.
                  </p>
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              fullWidth
              className="mt-6"
              rightIcon={<ArrowRight size={19} />}
              onClick={startAssessment}
            >
              Start assessment
            </Button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                AYUSH Assessment
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Tell us about your wellness
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Answer based on how you have been feeling recently.
              </p>
            </div>

            <AssessmentProgress
              currentQuestionNumber={currentQuestionNumber}
              totalQuestions={totalQuestions}
              progressPercentage={progressPercentage}
            />

            <div className="mt-8">
              <QuestionCard
                category={currentQuestion.category}
                question={currentQuestion.question}
              >
                <AnswerOptions
                  options={currentQuestion.options}
                  selectedAnswer={selectedAnswer}
                  onSelect={selectAnswer}
                />
              </QuestionCard>
            </div>

            {error && (
              <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="secondary"
                onClick={previousQuestion}
                disabled={isFirstQuestion || isSubmitting}
                leftIcon={<ArrowLeft size={18} />}
                className="w-full sm:w-auto"
              >
                Previous
              </Button>

              <Button
                onClick={handleNext}
                loading={isSubmitting}
                disabled={!selectedAnswer || isSubmitting}
                rightIcon={!isSubmitting && <ArrowRight size={18} />}
                className="w-full sm:w-auto"
              >
                {isLastQuestion ? "Complete assessment" : "Next question"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default AyushAssessmentPage;
