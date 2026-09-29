export default function StatCard({ label, value, helper, icon }) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-400 sm:text-sm">{label}</p>
        {icon && <span className="hidden rounded-lg bg-brand-600/15 p-2 text-brand-400 sm:inline-flex">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:mt-3 sm:text-4xl">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-500 sm:text-sm">{helper}</p>}
    </div>
  );
}
