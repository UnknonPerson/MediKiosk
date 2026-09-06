import { useEffect, useMemo, useState } from "react";

import {
  completeModernConversation,
  createPatientMessage,
  getModernConversationFollowUp,
  startModernConversation,
} from "../api/modernHealth.api";

const useModernConversation = () => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const initializeConversation = async () => {
      try {
        const conversationData = await startModernConversation();

        if (isCurrent) {
          setConversation(conversationData);
          setMessages(conversationData.messages);
        }
      } catch {
        if (isCurrent) {
          setError("We could not start the conversation. Please try again.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    initializeConversation();

    return () => {
      isCurrent = false;
    };
  }, []);

  const steps = conversation?.steps || [];
  const currentStep = steps[currentStepIndex] || null;
  const totalSteps = steps.length;
  const currentStepNumber = currentStepIndex + 1;
  const progressPercentage = useMemo(() => {
    if (!totalSteps) {
      return 0;
    }

    return Math.round((currentStepNumber / totalSteps) * 100);
  }, [currentStepNumber, totalSteps]);

  const sendResponse = async (message) => {
    const responseText = message.trim();

    if (!responseText || !conversation || !currentStep || isSending) {
      return false;
    }

    const patientMessage = createPatientMessage({
      message: responseText,
      stepId: currentStep.id,
    });
    const responseRecord = {
      stepId: currentStep.id,
      question: currentStep.question,
      response: responseText,
    };
    const messagesWithPatientResponse = [...messages, patientMessage];
    const responsesWithCurrentResponse = [...responses, responseRecord];
    const nextStep = steps[currentStepIndex + 1] || null;

    setMessages(messagesWithPatientResponse);
    setResponses(responsesWithCurrentResponse);
    setIsSending(true);
    setError("");

    try {
      const assistantMessage = await getModernConversationFollowUp({ nextStep });
      const updatedMessages = [...messagesWithPatientResponse, assistantMessage];

      setMessages(updatedMessages);

      if (nextStep) {
        setCurrentStepIndex((previousIndex) => previousIndex + 1);
        return false;
      }

      await completeModernConversation({
        conversation,
        messages: updatedMessages,
        responses: responsesWithCurrentResponse,
      });

      return true;
    } catch {
      setError("We could not save that response. Please try again.");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    currentStep,
    currentStepNumber,
    totalSteps,
    messages,
    progressPercentage,
    isLoading,
    isSending,
    error,
    sendResponse,
  };
};

export default useModernConversation;
