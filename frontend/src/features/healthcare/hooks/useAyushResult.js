import { useEffect, useState } from "react";

import { getAyushAssessmentResult } from "../api/ayush.api";

const useAyushResult = () => {
  const [resultRecord, setResultRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadResult = async () => {
      try {
        const assessmentResult = await getAyushAssessmentResult();

        if (isCurrent) {
          setResultRecord(assessmentResult);
        }
      } catch {
        if (isCurrent) {
          setError("We could not load your assessment summary. Please try again.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      isCurrent = false;
    };
  }, []);

  return {
    resultRecord,
    isLoading,
    error,
  };
};

export default useAyushResult;
