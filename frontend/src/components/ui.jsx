import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  hard: 'bg-rose-500/10 text-rose-300 ring-rose-500/30'
};

export function DifficultyBadge({ level, className = '' }) {
  const style = DIFFICULTY_STYLES[level?.toLowerCase()] || 'bg-white/5 text-slate-300 ring-white/10';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style} ${className}`}>
      {level || 'N/A'}
    </span>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </div>
  );
}

const ALERT_STYLES = {
  error: { cls: 'border-rose-500/30 bg-rose-500/10 text-rose-200', Icon: AlertCircle },
  success: { cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200', Icon: CheckCircle2 },
  info: { cls: 'border-brand-500/30 bg-brand-500/10 text-brand-300', Icon: Info }
};

export function Alert({ type = 'info', children, className = '' }) {
  if (!children) return null;
  const { cls, Icon } = ALERT_STYLES[type];
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${cls} ${className}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="whitespace-pre-line">{children}</div>
    </div>
  );
}

export function Spinner({ label = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-slate-400 ${className}`}>
      <Loader2 size={28} className="animate-spin text-brand-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ icon, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon && <div className="rounded-2xl bg-white/5 p-4 text-slate-400">{icon}</div>}
      <p className="font-semibold text-white">{title}</p>
      {children && <div className="max-w-sm text-sm text-slate-400">{children}</div>}
    </div>
  );
}

export function PageContainer({ children, className = '' }) {
  return <section className={`mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 ${className}`}>{children}</section>;
}
