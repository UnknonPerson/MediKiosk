import { useEffect, useMemo, useState } from "react";

import {
  getAyushAssessment,
  submitAyushAssessment,
} from "../api/ayush.api";

const useAyushAssessment = () => {
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadAssessment = async () => {
      try {
        const assessmentData = await getAyushAssessment();

        if (isCurrent) {
          setAssessment(assessmentData);
        }
      } catch {
        if (isCurrent) {
          setError("We could not load the assessment. Please try again.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    loadAssessment();

    return () => {
      isCurrent = false;
    };
  }, []);

  const questions = assessment?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || null;
  const totalQuestions = questions.length;
  const currentQuestionNumber = currentQuestionIndex + 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const selectedAnswer = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : "";
  const hasSelectedAnswer = Boolean(selectedAnswer);

  const progressPercentage = useMemo(() => {
    if (!totalQuestions) {
      return 0;
    }

    return Math.round((currentQuestionNumber / totalQuestions) * 100);
  }, [currentQuestionNumber, totalQuestions]);

  const startAssessment = () => {
    setHasStarted(true);
  };

  const selectAnswer = (answer) => {
    if (!currentQuestion) {
      return;
    }

    setSelectedAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: answer,
    }));
  };

  const previousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
    }
  };

  const completeAssessment = async () => {
    setIsSubmitting(true);

    try {
      await submitAyushAssessment({
        assessmentId: assessment.id,
        questions: assessment.questions,
        answers: selectedAnswers,
      });

      return true;
    } catch {
      setError("We could not complete the assessment. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = async () => {
    if (!hasSelectedAnswer) {
      return false;
    }

    if (!isLastQuestion) {
      setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
      return false;
    }

    return completeAssessment();
  };

  return {
    assessment,
    currentQuestion,
    currentQuestionNumber,
    totalQuestions,
    selectedAnswer,
    selectedAnswers,
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
  };
};

export default useAyushAssessment;
