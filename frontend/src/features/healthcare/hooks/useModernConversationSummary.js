import { useEffect, useState } from "react";

import { getModernConversationSummary } from "../api/modernHealth.api";

const useModernConversationSummary = () => {
  const [conversationRecord, setConversationRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadConversationSummary = async () => {
      try {
        const summaryRecord = await getModernConversationSummary();

        if (isCurrent) {
          setConversationRecord(summaryRecord);
        }
      } catch {
        if (isCurrent) {
          setError("We could not load your conversation summary. Please try again.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    loadConversationSummary();

    return () => {
      isCurrent = false;
    };
  }, []);

  return {
    conversationRecord,
    isLoading,
    error,
  };
};

export default useModernConversationSummary;
