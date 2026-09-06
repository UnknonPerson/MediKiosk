const MODERN_CONVERSATION_STORAGE_KEY = "medikiosk.modern-health-conversation";

const conversationSteps = [
  {
    id: "discussion-topic",
    question: "What would you like to discuss today?",
    suggestions: [
      "I have a new symptom",
      "I want to discuss my general health",
      "I have a question about a health concern",
      "I want to share how I have been feeling",
    ],
  },
  {
    id: "experience-details",
    question: "Can you describe what you have been experiencing?",
    suggestions: [
      "It comes and goes",
      "It has been affecting my routine",
      "I would like to describe it in my own words",
    ],
  },
  {
    id: "first-noticed",
    question: "When did you first notice this?",
    suggestions: ["Today", "A few days ago", "About a week ago", "More than a week ago"],
  },
  {
    id: "severity-description",
    question: "How would you describe the impact on your day-to-day activities?",
    suggestions: ["Mild", "Moderate", "Significant", "I'm not sure"],
  },
  {
    id: "additional-details",
    question: "Is there anything else you would like to mention?",
    suggestions: ["No, that's all", "I have more details to share"],
  },
];

let temporaryConversationRecord = null;

const waitForMockResponse = () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, 350);
  });

const createMessage = (sender, message, stepId = null) => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sender,
  message,
  stepId,
  createdAt: new Date().toISOString(),
});

const getTemporaryStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
};

const saveConversationRecord = (conversationRecord) => {
  temporaryConversationRecord = conversationRecord;

  const storage = getTemporaryStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(MODERN_CONVERSATION_STORAGE_KEY, JSON.stringify(conversationRecord));
  } catch {
    // The in-memory record remains available when browser storage is unavailable.
  }
};

export const startModernConversation = async () => {
  const firstStep = conversationSteps[0];
  const startedAt = new Date().toISOString();

  return {
    conversationId: `modern-health-${Date.now()}`,
    patientId: null,
    startedAt,
    status: "in-progress",
    steps: conversationSteps,
    messages: [
      createMessage(
        "assistant",
        `Hello! I can help you organize information about your health concern.\n\n${firstStep.question}`,
        firstStep.id
      ),
    ],
  };
};

export const createPatientMessage = ({ message, stepId }) =>
  createMessage("patient", message, stepId);

export const getModernConversationFollowUp = async ({ nextStep }) => {
  // Replace this mock response with a backend or AI conversation service later.
  await waitForMockResponse();

  if (!nextStep) {
    return createMessage(
      "assistant",
      "Thank you for sharing that information. Your conversation summary is ready for review.",
      "conversation-complete"
    );
  }

  return createMessage("assistant", nextStep.question, nextStep.id);
};

export const completeModernConversation = async ({
  conversation,
  messages,
  responses,
}) => {
  // Replace this mock persistence with an apiClient request when a backend is available.
  const completedRecord = {
    conversationId: conversation.conversationId,
    patientId: conversation.patientId,
    startedAt: conversation.startedAt,
    completedAt: new Date().toISOString(),
    status: "completed",
    messages,
    responses,
  };

  saveConversationRecord(completedRecord);

  return completedRecord;
};

export const getModernConversationSummary = async () => {
  // Replace this mock lookup with an apiClient request when records are persisted remotely.
  const storage = getTemporaryStorage();

  if (!storage) {
    return temporaryConversationRecord;
  }

  const storedRecord = storage.getItem(MODERN_CONVERSATION_STORAGE_KEY);

  if (!storedRecord) {
    return temporaryConversationRecord;
  }

  try {
    return JSON.parse(storedRecord);
  } catch {
    return temporaryConversationRecord;
  }
};
