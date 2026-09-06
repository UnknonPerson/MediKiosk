import { Routes, Route } from "react-router-dom";

import WelcomePage from "../../features/patient/pages/WelcomePage";
import LanguagePage from "../../features/patient/pages/LanguagePage";
import IdentifyPage from "../../features/patient/pages/IdentifyPage";
import RegistrationPage from '../../features/patient/pages/RegestrationPage';
import ConsentPage from "../../features/patient/pages/ConsentPage";
import CompletionPage from "../../features/patient/pages/CompletionPage";
import PatientDashboard from "../../features/patient/pages/PatientDashboard";
import HealthcareSelectionPage from "../../features/healthcare/pages/HealthcareSelectionPage";
import AyushAssessmentPage from "../../features/healthcare/pages/AyushAssessmentPage";
import AyushResultPage from "../../features/healthcare/pages/AyushResultPage";
import ModernConversationPage from "../../features/healthcare/pages/ModernConversationPage";
import ModernSummaryPage from "../../features/healthcare/pages/ModernSummaryPage";

import IntakePage from "../../features/intake/pages/IntakePage";

export const PatientRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<WelcomePage />}
      />

      <Route
        path="language"
        element={<LanguagePage />}
      />

      <Route
        path="identify"
        element={<IdentifyPage />}
      />

      <Route
        path="registration"
        element={<RegistrationPage />}
      />

      <Route
        path="consent"
        element={<ConsentPage />}
      />

      <Route
        path="healthcare"
        element={<HealthcareSelectionPage />}
      />

      <Route
        path="healthcare/ayush-assessment"
        element={<AyushAssessmentPage />}
      />

      <Route
        path="healthcare/ayush-result"
        element={<AyushResultPage />}
      />

      <Route
        path="healthcare/modern-conversation"
        element={<ModernConversationPage />}
      />

      <Route
        path="healthcare/modern-summary"
        element={<ModernSummaryPage />}
      />

      <Route
        path="dashboard"
        element={<PatientDashboard />}
      />

      {/* Intake */}
      <Route
        path="intake"
        element={<IntakePage />}
      />

      <Route
        path="completion"
        element={<CompletionPage />}
      />
    </Routes>
  );
};
