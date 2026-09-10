import { HeartPulse } from "lucide-react";

export default function BrandMark({ dark = false }) {
  return (
    <div className="flex items-center gap-3" aria-label="Vaidyam">
      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${dark ? "bg-white/15 text-white" : "bg-teal-700 text-white"}`}>
        <HeartPulse size={21} strokeWidth={2.4} aria-hidden="true" />
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${dark ? "text-white" : "text-slate-950"}`}>Vaidyam</span>
    </div>
  );
}
