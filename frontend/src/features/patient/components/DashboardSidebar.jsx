import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  LifeBuoy,
  LogOut,
  Menu,
  Pill,
  Settings,
  Video,
  X,
} from "lucide-react";

const navigationItems = [
  { label: "Dashboard", icon: HeartPulse, active: true },
  { label: "My Health Records", icon: FileText },
  { label: "Appointments", icon: CalendarDays },
  { label: "Prescriptions", icon: FileText },
  { label: "Test Reports", icon: ClipboardList },
  { label: "Medications", icon: Pill },
  { label: "Vitals & Health Data", icon: Activity },
  { label: "Health Insights", icon: BarChart3 },
  { label: "Teleconsultation", icon: Video },
  { label: "Profile & Settings", icon: Settings },
];

const DashboardSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F6B5B] text-white shadow-sm">
              <HeartPulse size={23} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">MediKiosk</p>
              <p className="text-xs font-medium text-slate-500">Patient Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-9 flex-1" aria-label="Patient dashboard navigation">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Main menu
          </p>
          <div className="mt-3 space-y-1">
            {navigationItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                disabled={!active}
                onClick={active ? onClose : undefined}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-50 text-emerald-800"
                    : "cursor-not-allowed text-slate-400"
                }`}
              >
                <Icon size={19} className={active ? "text-emerald-700" : "text-slate-400"} />
                <span className="flex-1">{label}</span>
                {!active && <span className="text-[10px] font-medium">Soon</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <div className="flex items-center gap-2 text-sky-800">
              <LifeBuoy size={18} />
              <p className="text-sm font-bold">Need Help?</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Our support team is here for you 24×7.
            </p>
            <button
              type="button"
              disabled
              className="mt-3 text-xs font-bold text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Contact Support · Soon
            </button>
          </div>

          <button
            type="button"
            disabled
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 disabled:cursor-not-allowed"
          >
            <LogOut size={19} />
            Logout · Soon
          </button>
        </div>
      </aside>
    </>
  );
};

export const MobileMenuButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
    aria-label="Open navigation menu"
  >
    <Menu size={20} />
  </button>
);

export default DashboardSidebar;
