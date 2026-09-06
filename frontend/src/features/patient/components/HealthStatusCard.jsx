import { ShieldCheck } from "lucide-react";

import Card from "../../../components/ui/Cards/Card";

const HealthStatusCard = () => {
  return (
    <Card padding="lg" className="h-full border-slate-200 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <ShieldCheck size={21} />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">
        Health status
      </p>
      <h3 className="mt-2 text-lg font-bold text-slate-900">No verified health conditions available</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Doctor-verified conditions, ABHA records, and clinical summaries will appear here
        when they are available.
      </p>
    </Card>
  );
};

export default HealthStatusCard;
