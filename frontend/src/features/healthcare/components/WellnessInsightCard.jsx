import Card from "../../../components/ui/Cards/Card";

const WellnessInsightCard = ({ icon: Icon, area, detail }) => {
  return (
    <Card padding="md" className="h-full border-sky-100">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
        <Icon size={21} />
      </div>
      <h3 className="mt-4 font-semibold text-slate-800">{area}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
    </Card>
  );
};

export default WellnessInsightCard;
