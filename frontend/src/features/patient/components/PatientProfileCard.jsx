import { BadgeCheck, ShieldAlert, UserRound } from "lucide-react";

import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/Cards/Card";

const PatientProfileCard = ({ patient, abha }) => {
  const patientName = patient?.name || "Patient";
  const abhaStatus = abha?.connected ? "Connected" : "Not connected";

  return (
    <Card padding="lg" className="h-full border-slate-200 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <UserRound size={30} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">
              Patient profile
            </p>
            <h2 className="mt-1 truncate text-2xl font-bold text-slate-900">{patientName}</h2>
            <p className="mt-1 text-sm text-slate-500">Personal details are not available yet.</p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
          <ShieldAlert size={15} />
          Unverified
        </span>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ABHA Status</p>
          <p className="mt-1.5 text-sm font-bold text-slate-800">{abhaStatus}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ABHA ID</p>
          <p className="mt-1.5 text-sm font-bold text-slate-800">
            {abha?.abhaNumber || "Not available"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5 sm:col-span-2">
          <div className="flex items-center gap-2 text-slate-600">
            <BadgeCheck size={17} className="text-slate-400" />
            <p className="text-sm leading-relaxed">
              Contact, location, and medical profile details will appear after they are added.
            </p>
          </div>
        </div>
      </div>

      <Button variant="secondary" disabled className="mt-6 w-full sm:w-auto">
        Edit Profile · Soon
      </Button>
    </Card>
  );
};

export default PatientProfileCard;
