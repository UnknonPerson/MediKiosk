const DashboardSection = ({ eyebrow, title, description, children }) => {
  return (
    <section>
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
};

export default DashboardSection;
