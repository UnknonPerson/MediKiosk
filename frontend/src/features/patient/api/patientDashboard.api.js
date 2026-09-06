import { getAyushAssessmentResult } from "../../healthcare/api/ayush.api";
import { getModernConversationSummary } from "../../healthcare/api/modernHealth.api";

const createAyushActivity = (assessment) => {
  if (!assessment?.completedAt) {
    return null;
  }

  const responseCount = Array.isArray(assessment.answers) ? assessment.answers.length : 0;

  return {
    id: `ayush-assessment-${assessment.completedAt}`,
    type: "ayush_assessment",
    title: "AYUSH Assessment completed",
    description: responseCount
      ? `${responseCount} wellness responses recorded.`
      : "Your AYUSH wellness assessment is ready to review.",
    createdAt: assessment.completedAt,
    status: assessment.status === "completed" ? "Completed" : "Saved",
  };
};

const createModernConversationActivity = (conversation) => {
  if (!conversation?.completedAt) {
    return null;
  }

  const topicCount = Array.isArray(conversation.responses)
    ? conversation.responses.length
    : 0;

  return {
    id: `modern-conversation-${conversation.completedAt}`,
    type: "modern_conversation",
    title: "Modern Health Conversation completed",
    description: topicCount
      ? `${topicCount} health topics discussed.`
      : "Your health conversation is ready to review.",
    createdAt: conversation.completedAt,
    status: conversation.status === "completed" ? "Completed" : "Saved",
  };
};

const sortActivitiesByDate = (firstActivity, secondActivity) =>
  new Date(secondActivity.createdAt).getTime() - new Date(firstActivity.createdAt).getTime();

export const getPatientDashboard = async () => {
  // Replace these feature API calls with a patient dashboard endpoint when available.
  const [ayushAssessment, modernConversation] = await Promise.all([
    getAyushAssessmentResult(),
    getModernConversationSummary(),
  ]);

  const recentActivity = [
    createAyushActivity(ayushAssessment),
    createModernConversationActivity(modernConversation),
  ]
    .filter(Boolean)
    .sort(sortActivitiesByDate);

  const ayushAssessments = ayushAssessment ? 1 : 0;
  const modernConversations = modernConversation ? 1 : 0;
  const documents = 0;

  return {
    patient: {
      id: null,
      name: "",
    },
    overview: {
      ayushAssessments,
      modernConversations,
      documents,
      totalRecords: ayushAssessments + modernConversations + documents,
    },
    recentActivity,
    documents: {
      count: documents,
      hasDocumentCenter: false,
    },
    abha: {
      connected: false,
      abhaNumber: null,
    },
  };
};
