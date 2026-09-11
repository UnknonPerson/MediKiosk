import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "../features/auth/authSlice";
import patientReducer from "../features/patient/patientSlice";
import consultationsReducer from "../features/consultation/consultationsSlice";
import intakeReducer from "../features/intake/intakeSlice";
import documentReducer from "../features/document/documentSlice";
import timelineReducer from "../features/patient/timelineSlice";
import summaryReducer from "../features/summary/summarySlice";

const appReducer = combineReducers({
  auth: authReducer,
  patient: patientReducer,
  consultations: consultationsReducer,
  intake: intakeReducer,
  documents: documentReducer,
  timeline: timelineReducer,
  summary: summaryReducer,
});

const rootReducer = (state, action) => {
  if (action.type === logout.fulfilled.type || action.type === logout.rejected.type) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });
