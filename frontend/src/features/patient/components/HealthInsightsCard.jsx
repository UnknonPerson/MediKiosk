import { Lightbulb } from "lucide-react";

import Card from "../../../components/ui/Cards/Card";

const HealthInsightsCard = ({ hasHealthHistory }) => {
  return (
    <Card padding="lg" className="h-full border-amber-100 bg-amber-50/40 shadow-none">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <Lightbulb size={21} />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-amber-700">
        Health insights
      </p>
      <h3 className="mt-2 text-lg font-bold text-slate-900">Informational health history</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {hasHealthHistory
          ? "Your completed health records are available above. Clinically verified insights are not available yet."
          : "Complete an AYUSH assessment or Modern Health Conversation to begin building your health history."}
      </p>
    </Card>
  );
};

export default HealthInsightsCard;
