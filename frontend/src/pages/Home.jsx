import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, Bookmark, Cpu, Layers, Rocket, ShieldCheck, StickyNote, Terminal, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground';

const FEATURES = [
  { icon: BookOpen, title: 'Curated library', desc: 'Around 50 Java DSA problems across 17 topics, filterable by topic and difficulty.', tone: 'text-brand-300 bg-brand-500/10 ring-brand-500/20' },
  { icon: Terminal, title: 'Run real Java', desc: 'Write code in a VS Code-style editor. The server compiles it and checks it against test cases.', tone: 'text-sky-300 bg-sky-500/10 ring-sky-500/20' },
  { icon: BarChart3, title: 'Progress analytics', desc: 'Topic and difficulty breakdowns, streaks and a year-long activity heatmap.', tone: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20' },
  { icon: ShieldCheck, title: 'Secure accounts', desc: 'JWT authentication, hashed passwords and separate admin and user roles.', tone: 'text-pink-300 bg-pink-500/10 ring-pink-500/20' }
];

const EXTRAS = [
  { icon: Cpu, text: 'Automatic judge' },
  { icon: StickyNote, text: 'Notes per problem' },
  { icon: Bookmark, text: 'Revision bookmarks' },
  { icon: Layers, text: 'Admin problem editor' }
];

function CodePreview() {
  const k = 'text-purple-400';
  const t = 'text-yellow-300';
  const f = 'text-sky-400';
  const n = 'text-pink-400';
  return (
    <div className="relative">
      <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand-600/30 blur-[90px]" aria-hidden="true" />
      <div className="card relative overflow-hidden shadow-2xl shadow-black/50 lg:[transform:perspective(1000px)_rotateY(-6deg)_rotateX(4deg)]">
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c841]" />
          <span className="ml-auto font-mono text-xs text-slate-500">TwoSum.java</span>
        </div>
        <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed text-slate-300 sm:text-sm">
          <span className={k}>public class</span> <span className={t}>TwoSum</span> {'{\n'}
          {'  '}<span className={k}>public int</span>[] <span className={f}>solve</span>(<span className={k}>int</span>[] nums, <span className={k}>int</span> target) {'{\n'}
          {'    '}Map&lt;Integer, Integer&gt; seen = <span className={k}>new</span> <span className={t}>HashMap</span>&lt;&gt;();{'\n'}
          {'    '}<span className={k}>for</span> (<span className={k}>int</span> i = <span className={n}>0</span>; i &lt; nums.length; i++) {'{\n'}
          {'      '}<span className={k}>int</span> need = target - nums[i];{'\n'}
          {'      '}<span className={k}>if</span> (seen.containsKey(need)){'\n'}
          {'        '}<span className={k}>return new int</span>[] {'{ seen.get(need), i };\n'}
          {'      '}seen.put(nums[i], i);{'\n'}
          {'    }\n'}
          {'    '}<span className={k}>return new int</span>[0];{'\n'}
          {'  }\n'}
          {'}'}
        </pre>
        <div className="flex items-center gap-2 border-t border-white/5 bg-emerald-500/5 px-4 py-2.5 font-mono text-xs text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Accepted · 3/3 test cases passed
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      <ParticleBackground />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.18),transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-brand-300">
              <Zap size={14} /> Java DSA practice, tracked
            </span>
            <h1 className="mt-6 bg-linear-to-br from-white from-30% to-brand-400 bg-clip-text text-5xl font-black leading-[1.02] tracking-tight text-transparent sm:text-6xl xl:text-7xl">
              Master Java DSA
              <br />
              with precision.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Solve curated problems in a real Java editor, get instant test-case feedback, and see your progress grow topic by topic.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/problems" className="btn-primary px-7 py-3.5 text-base">
                <Rocket size={18} /> {user ? 'Continue solving' : 'Browse problems'}
              </Link>
              <Link to={user ? '/dashboard' : '/register'} className="btn-outline px-7 py-3.5 text-base">
                {user ? 'My dashboard' : 'Create free account'}
              </Link>
            </div>
            {!user && (
              <p className="mt-5 text-sm text-slate-500">
                Just looking? Log in with the demo account: <span className="font-mono text-slate-300">user@example.com / user123</span>
              </p>
            )}
          </div>
          <CodePreview />
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="eyebrow">Features</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Everything you need to practise DSA.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, tone }) => (
              <div key={title} className="card p-7 transition hover:-translate-y-1 hover:border-brand-500/40">
                <span className={`inline-flex rounded-2xl p-3.5 ring-1 ${tone}`}>
                  <Icon size={26} />
                </span>
                <h3 className="mt-6 text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 rounded-[2.5rem] border border-white/5 bg-linear-to-b from-white/[0.03] to-brand-600/10 px-6 py-14 sm:px-12 lg:grid-cols-2 lg:py-20">
            <div>
              <p className="eyebrow">Why CodeTrack</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                More than a
                <br />
                list of questions.
              </h2>
              <p className="mt-5 max-w-md text-lg text-slate-400">
                Notes, bookmarks and streaks help you keep what you learn, so interview prep keeps working.
              </p>
              <Link to="/problems" className="btn-primary mt-8">Explore problems →</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {EXTRAS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5 font-semibold text-white transition hover:border-brand-500/50">
                  <Icon size={20} className="text-brand-400" /> {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className="px-4 py-24 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Ready to start?</h2>
            <p className="mt-4 text-lg text-slate-400">Create a free account and solve your first problem in minutes.</p>
            <Link to="/register" className="btn-primary mt-10 px-10 py-4 text-lg">Create free account</Link>
          </section>
        )}
        {user && <div className="h-24" />}
      </div>
    </div>
  );
}
