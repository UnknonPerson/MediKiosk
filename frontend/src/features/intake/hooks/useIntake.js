import { useState } from "react";

const useIntake = (questions = []) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const currentQuestion =
    questions[currentQuestionIndex];

  const totalQuestions =
    questions.length;

  const isFirstQuestion =
    currentQuestionIndex === 0;

  const isLastQuestion =
    currentQuestionIndex === totalQuestions - 1;

  // --------------------------------
  // SAVE ANSWER
  // --------------------------------

  const saveAnswer = (
    questionId,
    answer,
    type,
    audio = null
  ) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,

      [questionId]: {
        answer,
        type,
        audio,
      },
    }));
  };

  // --------------------------------
  // GET ANSWER
  // --------------------------------

  const getAnswer = (questionId) => {
    return answers[questionId] || null;
  };

  // --------------------------------
  // NEXT QUESTION
  // --------------------------------

  const nextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(
        (previousIndex) =>
          previousIndex + 1
      );

      return true;
    }

    return false;
  };

  // --------------------------------
  // PREVIOUS QUESTION
  // --------------------------------

  const previousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(
        (previousIndex) =>
          previousIndex - 1
      );

      return true;
    }

    return false;
  };

  // --------------------------------
  // GO TO QUESTION
  // --------------------------------

  const goToQuestion = (index) => {
    if (
      index >= 0 &&
      index < totalQuestions
    ) {
      setCurrentQuestionIndex(index);
    }
  };

  // --------------------------------
  // UPDATE ANSWER
  // --------------------------------

  const updateAnswer = (
    questionId,
    data
  ) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,

      [questionId]: {
        ...previousAnswers[questionId],
        ...data,
      },
    }));
  };

  // --------------------------------
  // CLEAR ANSWER
  // --------------------------------

  const clearAnswer = (questionId) => {
    setAnswers((previousAnswers) => {
      const updatedAnswers = {
        ...previousAnswers,
      };

      delete updatedAnswers[questionId];

      return updatedAnswers;
    });
  };

  // --------------------------------
  // RESET INTAKE
  // --------------------------------

  const resetIntake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  // --------------------------------
  // RETURN
  // --------------------------------

  return {
    // Current question
    currentQuestion,
    currentQuestionIndex,
    currentQuestionNumber:
      currentQuestionIndex + 1,

    // Question information
    totalQuestions,
    isFirstQuestion,
    isLastQuestion,

    // Answers
    answers,
    getAnswer,
    saveAnswer,
    updateAnswer,
    clearAnswer,

    // Navigation
    nextQuestion,
    previousQuestion,
    goToQuestion,

    // Reset
    resetIntake,
  };
};

export default useIntake;