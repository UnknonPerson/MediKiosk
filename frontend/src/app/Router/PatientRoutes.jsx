import { Navigate, Route, Routes } from "react-router-dom";
import PatientShell from "../../components/layout/PatientShell";
import PatientDashboard from "../../features/patient/pages/PatientDashboardLive";
import ProfileSetupPage from "../../features/patient/pages/ProfileSetupLive";
import ProfilePage from "../../features/patient/pages/ProfileLive";
import ConsentManagerPage from "../../features/patient/pages/ConsentManagerLive";
import HealthcareSelectionPage from "../../features/healthcare/pages/HealthcareSelectionLive";
import IntakePage from "../../features/intake/pages/IntakeRedux";
import HealthSummaryPage from "../../features/patient/pages/HealthSummaryLive";
import HealthTimelinePage from "../../features/patient/pages/HealthTimelineLive";
import DocumentsPage from "../../features/patient/pages/DocumentsPage";
import SummaryPage from "../../features/patient/pages/SummaryPage";

export function PatientRoutes() { return <Routes><Route element={<PatientShell/>}><Route index element={<Navigate to="dashboard" replace/>}/><Route path="setup" element={<ProfileSetupPage/>}/><Route path="dashboard" element={<PatientDashboard/>}/><Route path="profile" element={<ProfilePage/>}/><Route path="consent" element={<ConsentManagerPage/>}/><Route path="healthcare" element={<HealthcareSelectionPage/>}/><Route path="intake" element={<IntakePage/>}/><Route path="summary" element={<HealthSummaryPage/>}/><Route path="timeline" element={<HealthTimelinePage/>}/><Route path="documents" element={<DocumentsPage/>}/><Route path="record-summary" element={<SummaryPage/>}/><Route path="registration" element={<ProfileSetupPage/>}/><Route path="healthcare/modern-conversation" element={<Navigate to="/patient/intake?system=MODERN" replace/>}/><Route path="healthcare/ayush-assessment" element={<Navigate to="/patient/intake?system=AYUSH" replace/>}/><Route path="healthcare/modern-summary" element={<Navigate to="/patient/summary" replace/>}/><Route path="healthcare/ayush-result" element={<Navigate to="/patient/summary" replace/>}/><Route path="*" element={<Navigate to="dashboard" replace/>}/></Route></Routes>; }
