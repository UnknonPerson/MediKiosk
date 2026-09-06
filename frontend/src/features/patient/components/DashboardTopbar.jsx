import { Bell, ChevronDown, Search, UserRound } from "lucide-react";

import { MobileMenuButton } from "./DashboardSidebar";

const DashboardTopbar = ({ patientName, onMenuOpen }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <MobileMenuButton onClick={onMenuOpen} />
          <div className="relative hidden w-[min(30vw,420px)] md:block">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              aria-label="Search doctors, records, or services"
              placeholder="Search doctors, records, or services..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            disabled
            aria-label="Notifications coming soon"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:cursor-not-allowed"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <button
            type="button"
            disabled
            className="hidden h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 disabled:cursor-not-allowed sm:flex"
          >
            English
            <ChevronDown size={16} />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <UserRound size={16} />
            </div>
            <div className="hidden text-left sm:block">
              <p className="max-w-28 truncate text-xs font-bold text-slate-800">{patientName}</p>
              <p className="text-[11px] text-slate-500">Patient</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
