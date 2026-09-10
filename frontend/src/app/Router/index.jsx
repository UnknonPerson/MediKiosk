import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../../features/home/Home";
import { PatientRoutes } from "./PatientRoutes";
import AuthPage from "../../features/auth/pages/AuthPage";
import AccessDeniedPage from "../../features/auth/pages/AccessDeniedPage";
import ProtectedRoute from "../../features/auth/components/ProtectedRoute";
import DoctorDashboardPage from "../../features/doctor/pages/DoctorDashboardPage";

export default function AppRouter() { return <Routes><Route path="/" element={<Home/>}/><Route path="/auth" element={<AuthPage/>}/><Route path="/access-denied" element={<AccessDeniedPage/>}/><Route path="/patient/*" element={<ProtectedRoute role="PATIENT"><PatientRoutes/></ProtectedRoute>}/><Route path="/doctor" element={<ProtectedRoute role="DOCTOR"><DoctorDashboardPage/></ProtectedRoute>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>; }
