import { useEffect, useState } from "react";

import { getPatientDashboard } from "../api/patientDashboard.api";

const usePatientDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadDashboard = async () => {
      try {
        const dashboardData = await getPatientDashboard();

        if (isCurrent) {
          setDashboard(dashboardData);
        }
      } catch {
        if (isCurrent) {
          setError("We could not load your health dashboard. Please try again.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isCurrent = false;
    };
  }, []);

  return {
    dashboard,
    isLoading,
    error,
  };
};

export default usePatientDashboard;
