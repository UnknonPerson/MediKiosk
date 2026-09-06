import Card from "../../../components/ui/Cards/Card";

const HealthOverviewCard = ({ icon: Icon, label, value, detail, iconClassName }) => {
  return (
    <Card padding="md" className="h-full border-slate-200 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>
        <Icon size={21} />
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <h3 className="mt-1.5 font-semibold text-slate-800">{label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{detail}</p>
    </Card>
  );
};

export default HealthOverviewCard;
