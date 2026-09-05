import React from "react";
import {
  Routes,
  Route,
} from "react-router-dom";

import Home from '../../features/home/Home';
import { PatientRoutes } from "./PatientRoutes";

const AppRouter = () => {
  return (
      <Routes>
        {/* Homepage */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Patient Flow */}
        <Route
          path="/patient/*"
          element={<PatientRoutes />}
        />
      </Routes>
  );
};

export default AppRouter;