import { ArrowRight } from "lucide-react";

import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/Cards/Card";

const HealthcareOptionCard = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  iconClassName,
  onStart,
}) => {
  return (
    <Card
      variant="default"
      padding="lg"
      className="flex h-full flex-col border-slate-100 shadow-sm"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconClassName}`}
      >
        <Icon size={28} strokeWidth={1.8} />
      </div>

      <h2 className="mt-6 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-8">
        <Button
          onClick={onStart}
          variant="outline"
          rightIcon={<ArrowRight size={18} />}
          className="w-full sm:w-auto"
        >
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
};

export default HealthcareOptionCard;
