import React from "react";
import { Routes, Route } from "react-router-dom";

import WelcomePage from "../../features/patient/pages/WelcomePage";
import LanguagePage from "../../features/patient/pages/LanguagePage";
import IdentifyPage from "../../features/patient/pages/IdentifyPage";
import RegistrationPage from '../../features/patient/pages/RegestrationPage';
import ConsentPage from "../../features/patient/pages/ConsentPage";
import CompletionPage from "../../features/patient/pages/CompletionPage";

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
