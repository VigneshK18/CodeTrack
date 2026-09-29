import { useState } from 'react';
import { Eye, Lightbulb } from 'lucide-react';
import RichText from '../RichText';

export default function EditorialTab({ problem, solved }) {
  const [revealed, setRevealed] = useState(solved);

  return (
    <div className="animate-fade-in">
      <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Lightbulb size={20} className="text-amber-300" /> Editorial</h2>

      <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-400">Approach</h3>
      <RichText text={problem.explanation} className="mt-2" />

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg bg-white/5 px-3 py-1 font-mono text-slate-300">Time: {problem.timeComplexity || 'n/a'}</span>
        <span className="rounded-lg bg-white/5 px-3 py-1 font-mono text-slate-300">Space: {problem.spaceComplexity || 'n/a'}</span>
      </div>

      <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-slate-400">Java solution</h3>
      {revealed ? (
        <pre className="code-block mt-3">{problem.javaSolution || 'No solution added yet.'}</pre>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-white/10 p-6 text-center">
          <p className="text-sm text-slate-400">Try solving it yourself first. The full solution is one click away.</p>
          <button onClick={() => setRevealed(true)} className="btn-outline mt-4 text-xs">
            <Eye size={14} /> Show solution
          </button>
        </div>
      )}
    </div>
  );
}
