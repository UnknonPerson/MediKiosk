import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarClock, FileUp, LayoutDashboard, LogOut, Menu, MessageCircleHeart, UserRound, X } from "lucide-react";
import BrandMark from "../brand/BrandMark";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const navigation = [
  { to: "/patient/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/patient/healthcare", label: "Start intake", icon: MessageCircleHeart },
  { to: "/patient/timeline", label: "My timeline", icon: CalendarClock },
  { to: "/patient/documents", label: "Documents", icon: FileUp },
];

export default function PatientShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const leave = async () => {
    await dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-5 lg:px-8">
          <NavLink to="/patient/dashboard" className="focus-ring rounded-xl"><BrandMark /></NavLink>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Patient navigation">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
                <Icon size={17} aria-hidden="true" />{label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <NavLink to="/patient/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-ring">
              <UserRound size={17} aria-hidden="true" />{user?.fullName?.split(" ")[0] || "Account"}
            </NavLink>
            <button onClick={leave} className="icon-button" aria-label="Log out"><LogOut size={18} /></button>
          </div>
          <button onClick={() => setIsMenuOpen((value) => !value)} className="icon-button lg:hidden" aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {isMenuOpen && <nav className="border-t border-slate-100 bg-white px-5 py-3 lg:hidden" aria-label="Patient navigation">
          {navigation.map(({ to, label, icon: Icon }) => <NavLink onClick={() => setIsMenuOpen(false)} key={to} to={to} className={({ isActive }) => `mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`}><Icon size={18} />{label}</NavLink>)}
          <button onClick={leave} className="mobile-nav-link w-full"><LogOut size={18} />Log out</button>
        </nav>}
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-xs leading-5 text-slate-500">Vaidyam helps organize health information. It does not diagnose, prescribe, or replace professional care.</footer>
    </div>
  );
}
