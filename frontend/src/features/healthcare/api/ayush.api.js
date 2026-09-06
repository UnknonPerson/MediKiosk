const ayushAssessment = {
  id: "ayush-wellness-check-in",
  title: "AYUSH Assessment",
  description:
    "Answer a few questions to help us understand your health and wellness better.",
  questions: [
    {
      id: "overall-wellness",
      category: "General Wellness",
      question: "How would you describe your overall health?",
      options: ["Excellent", "Good", "Fair", "Poor"],
    },
    {
      id: "daily-energy",
      category: "Daily Routine",
      question: "How is your energy level during most days?",
      options: ["High and steady", "Usually good", "Often low", "Very low"],
    },
    {
      id: "sleep-quality",
      category: "Rest & Sleep",
      question: "How would you rate your sleep quality recently?",
      options: ["Very restful", "Mostly restful", "Sometimes disrupted", "Frequently disrupted"],
    },
    {
      id: "digestion-comfort",
      category: "Digestive Comfort",
      question: "How comfortable do you generally feel after meals?",
      options: ["Very comfortable", "Mostly comfortable", "Sometimes uncomfortable", "Often uncomfortable"],
    },
    {
      id: "daily-stress",
      category: "Mind & Balance",
      question: "How would you describe your daily stress level?",
      options: ["Low", "Manageable", "Often high", "Very high"],
    },
  ],
};

const AYUSH_RESULT_STORAGE_KEY = "medikiosk.ayush-assessment-result";

const mockWellnessInsights = [
  {
    id: "lifestyle",
    area: "Lifestyle",
    detail:
      "Your daily routine and energy level were included in the information you shared.",
  },
  {
    id: "sleep",
    area: "Sleep",
    detail:
      "Your recent sleep experience was included in this wellness summary.",
  },
  {
    id: "nutrition",
    area: "Nutrition",
    detail:
      "Your comfort after meals was included as part of your wellness check-in.",
  },
  {
    id: "general-wellbeing",
    area: "General Wellbeing",
    detail:
      "Your overall wellness and daily stress responses were organized in this record.",
  },
];

let temporaryAyushResult = null;

const getTemporaryStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
};

const saveAyushResult = (resultRecord) => {
  temporaryAyushResult = resultRecord;

  const storage = getTemporaryStorage();

  if (!storage) {
    return;
  }

  storage.setItem(AYUSH_RESULT_STORAGE_KEY, JSON.stringify(resultRecord));
};

export const getAyushAssessment = async () => {
  // Replace this mock with an apiClient request when the backend is available.
  return ayushAssessment;
};

export const submitAyushAssessment = async ({
  assessmentId,
  questions,
  answers,
}) => {
  // Replace this mock with a POST request when assessment persistence is available.
  const resultRecord = {
    assessmentId,
    assessmentType: "AYUSH Wellness Assessment",
    completedAt: new Date().toISOString(),
    status: "completed",
    totalQuestions: questions.length,
    answers: questions.map(({ id, category, question }) => ({
      questionId: id,
      category,
      question,
      selectedAnswer: answers[id] || "Not answered",
    })),
    wellnessInsights: mockWellnessInsights,
  };

  saveAyushResult(resultRecord);

  return resultRecord;
};

export const getAyushAssessmentResult = async () => {
  // Replace this mock with an apiClient request when result records are available.
  const storage = getTemporaryStorage();

  if (!storage) {
    return temporaryAyushResult;
  }

  const storedResult = storage.getItem(AYUSH_RESULT_STORAGE_KEY);

  if (!storedResult) {
    return temporaryAyushResult;
  }

  try {
    return JSON.parse(storedResult);
  } catch {
    return temporaryAyushResult;
  }
};
