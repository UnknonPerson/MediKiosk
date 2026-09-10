import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLoader from "../../../components/common/PageLoader";

export default function ProtectedRoute({ children, role }) {
  const { user, status, initialized } = useSelector((state) => state.auth);
  const location = useLocation();
  if (!initialized || status === "checking") return <PageLoader />;
  if (!user) return <Navigate to={`/auth?mode=login&next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (role && user.role !== role) return <Navigate to="/access-denied" replace />;
  return children;
}
