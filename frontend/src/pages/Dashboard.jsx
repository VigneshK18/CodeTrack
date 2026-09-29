import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarDays, CheckCircle2, Flame, Layers, List, PlusCircle, Target, Trophy } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { Alert, DifficultyBadge, EmptyState, PageContainer, PageHeader, Spinner } from '../components/ui';

const BAR_COLOR = '#8b5cf6'; // validated against the dark card surface
const AXIS = { fill: '#94a3b8', fontSize: 12 };

function ChartTooltip({ active, payload, render }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-xs text-slate-200 shadow-xl">{render(payload[0].payload)}</div>
  );
}

function DifficultyMeter({ level, solved, total }) {
  const pct = total ? Math.round((solved / total) * 100) : 0;
  const bar = { Easy: 'bg-emerald-400', Medium: 'bg-amber-400', Hard: 'bg-rose-400' }[level];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <DifficultyBadge level={level} />
        <span className="text-slate-300">
          <span className="font-bold text-white">{solved}</span> / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AdminDashboard({ stats }) {
  const data = Object.entries(stats.categoryTotals || {})
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
  const d = stats.difficultyTotals || {};

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Admin console"
        title="Library dashboard"
        subtitle="Manage problems and keep an eye on how the library is balanced."
        actions={<Link to="/admin/problems/new" className="btn-primary"><PlusCircle size={16} /> Add problem</Link>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <StatCard label="Problems in library" value={stats.totalProblems} icon={<Layers size={18} />} />
        <StatCard label="Topics" value={data.length} icon={<List size={18} />} />
        <StatCard label="Easy / Medium / Hard" value={`${d.Easy ?? 0} / ${d.Medium ?? 0} / ${d.Hard ?? 0}`} icon={<Target size={18} />} />
        <StatCard label="API status" value="Online" helper="Connected to MySQL" icon={<CheckCircle2 size={18} />} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Link to="/admin/problems/new" className="card group flex items-center gap-5 p-6 transition hover:border-brand-500/50">
          <span className="rounded-2xl bg-brand-600/15 p-4 text-brand-400"><PlusCircle size={28} /></span>
          <span>
            <span className="block text-lg font-bold text-white">Add a new problem</span>
            <span className="text-sm text-slate-400">Write the statement, reference solution and test cases.</span>
          </span>
        </Link>
        <Link to="/admin/problems" className="card group flex items-center gap-5 p-6 transition hover:border-brand-500/50">
          <span className="rounded-2xl bg-sky-500/15 p-4 text-sky-400"><List size={28} /></span>
          <span>
            <span className="block text-lg font-bold text-white">Manage library</span>
            <span className="text-sm text-slate-400">Edit or delete existing problems.</span>
          </span>
        </Link>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="text-lg font-bold text-white">Problems per topic</h2>
        <p className="text-sm text-slate-400">Topics with few problems are good candidates for new content.</p>
        <div className="mt-6" style={{ height: Math.max(260, data.length * 28) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={140} tick={{ ...AXIS, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip render={(p) => <><b>{p.name}</b>: {p.total} problems</>} />} />
              <Bar dataKey="total" fill={BAR_COLOR} radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false}
                label={{ position: 'right', fill: '#94a3b8', fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageContainer>
  );
}

function UserDashboard({ stats, name }) {
  const pct = stats.totalProblems ? Math.round((stats.solvedProblems / stats.totalProblems) * 100) : 0;
  const totals = stats.difficultyTotals || {};
  const topicData = Object.entries(stats.categoryTotals || {})
    .map(([topic, total]) => {
      const solved = stats.categorySolved?.[topic] || 0;
      return { topic, total, solved, pct: Math.round((solved / total) * 100) };
    })
    .sort((a, b) => b.pct - a.pct || b.total - a.total);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="My progress"
        title={`Welcome back, ${name?.split(' ')[0] || 'coder'}`}
        subtitle="Your solved problems, streaks and topic coverage at a glance."
        actions={<Link to="/problems" className="btn-primary">Solve a problem</Link>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <StatCard label="Solved" value={`${stats.solvedProblems}/${stats.totalProblems}`} helper={`${pct}% of the library`} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Current streak" value={stats.currentStreak} helper={stats.currentStreak === 1 ? 'day' : 'days'} icon={<Flame size={18} />} />
        <StatCard label="Longest streak" value={stats.longestStreak ?? stats.currentStreak} helper="days in a row" icon={<Trophy size={18} />} />
        <StatCard label="Submissions" value={stats.totalSubmissions} helper={`${stats.acceptedSubmissions} accepted`} icon={<CalendarDays size={18} />} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3 lg:items-start">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white">By difficulty</h2>
          <p className="mb-6 text-sm text-slate-400">Solved out of total in each level</p>
          <div className="space-y-5">
            {['Easy', 'Medium', 'Hard'].map((level) => (
              <DifficultyMeter key={level} level={level} solved={stats[`${level.toLowerCase()}Solved`] || 0} total={totals[level] || 0} />
            ))}
          </div>
          <div className="mt-8 border-t border-white/5 pt-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">Overall</span>
              <span className="font-bold text-white">{pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-linear-to-r from-brand-600 to-purple-400" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-white">Topic coverage</h2>
          <p className="text-sm text-slate-400">Percentage of each topic you have solved</p>
          <div className="mt-4" style={{ height: Math.max(260, topicData.length * 26) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis dataKey="topic" type="category" width={130} tick={{ ...AXIS, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltip render={(p) => <><b>{p.topic}</b>: {p.solved} of {p.total} solved ({p.pct}%)</>} />}
                />
                <Bar dataKey="pct" fill={BAR_COLOR} radius={[0, 4, 4, 0]} maxBarSize={14} background={{ fill: 'rgba(255,255,255,0.04)', radius: 4 }} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-white">
            <span className="text-2xl font-black">{stats.totalSubmissions}</span> submissions in the past year
          </h2>
          <span className="text-sm text-slate-400">
            {stats.submissionDates?.length || 0} active days
            {stats.totalSubmissions > 0 && ` · ${Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)}% accepted`}
          </span>
        </div>
        <ActivityHeatmap counts={stats.activityCounts} />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Recent activity</h2>
        {stats.recentActivities?.length ? (
          <ul className="divide-y divide-white/5">
            {stats.recentActivities.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <Link to={`/problems/${a.id}`} className="truncate font-semibold text-white hover:text-brand-300">{a.title}</Link>
                  <DifficultyBadge level={a.difficulty} />
                </div>
                <span className="shrink-0 text-sm text-slate-500">
                  {new Date(a.solvedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nothing solved yet">
            Pick an easy problem to get started. <Link to="/problems" className="text-brand-400 underline">Browse problems</Link>
          </EmptyState>
        )}
      </div>
    </PageContainer>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/progress/stats').then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <PageContainer><Alert type="error">{error}</Alert></PageContainer>;
  if (!stats) return <Spinner label="Loading dashboard..." className="min-h-[60vh]" />;

  return isAdmin ? <AdminDashboard stats={stats} /> : <UserDashboard stats={stats} name={user?.name} />;
}
