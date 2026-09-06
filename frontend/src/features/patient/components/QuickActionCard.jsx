import { ArrowRight } from "lucide-react";

import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/Cards/Card";

const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  iconClassName,
  onClick,
  disabled = false,
}) => {
  return (
    <Card padding="md" className="flex h-full flex-col border-slate-200 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>
        <Icon size={21} />
      </div>
      <h3 className="mt-5 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <Button
        variant={disabled ? "secondary" : "outline"}
        fullWidth
        disabled={disabled}
        onClick={onClick}
        rightIcon={!disabled && <ArrowRight size={18} />}
        className="mt-5"
      >
        {actionLabel}
      </Button>
    </Card>
  );
};

export default QuickActionCard;
