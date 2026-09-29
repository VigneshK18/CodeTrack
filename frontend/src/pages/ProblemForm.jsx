import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Alert, PageContainer, PageHeader, Spinner } from '../components/ui';

const emptyForm = {
  title: '',
  description: '',
  category: 'Arrays',
  difficulty: 'Easy',
  tags: '',
  inputFormat: '',
  outputFormat: '',
  constraintsText: '',
  sampleInput: '',
  sampleOutput: '',
  explanation: '',
  javaSolution: '',
  defaultCodeTemplate: '',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)'
};

function Field({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function parseTests(json) {
  try {
    const t = JSON.parse(json || '[]');
    return Array.isArray(t) ? t.map((x) => ({ input: String(x.input ?? ''), output: String(x.output ?? '') })) : [];
  } catch {
    return [];
  }
}

export default function ProblemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get(`/problems/${id}`)
      .then((data) => {
        const next = { ...emptyForm };
        Object.keys(emptyForm).forEach((k) => (next[k] = data[k] ?? ''));
        setForm(next);
        setTests(parseTests(data.testCasesJson));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const bind = (name) => ({ name, value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }) });

  const updateTest = (i, key, value) => setTests((list) => list.map((t, idx) => (idx === i ? { ...t, [key]: value } : t)));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = { ...form, testCasesJson: JSON.stringify(tests.filter((t) => t.input !== '' || t.output !== '')) };
    try {
      if (id) await api.put(`/problems/${id}`, payload);
      else await api.post('/problems', payload);
      navigate('/admin/problems');
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading problem..." className="min-h-[60vh]" />;

  return (
    <PageContainer className="max-w-4xl">
      <Link to="/admin/problems" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white">
        <ArrowLeft size={14} /> Back to library
      </Link>
      <PageHeader eyebrow="Admin" title={id ? 'Edit problem' : 'Add problem'} />
      <Alert type="error" className="mb-6">{error}</Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card space-y-5 p-6">
          <h2 className="font-bold text-white">Basics</h2>
          <Field label="Title">
            <input {...bind('title')} required maxLength={200} className="input" placeholder="e.g. Two Sum" />
          </Field>
          <Field label="Description">
            <textarea {...bind('description')} rows={4} className="input" placeholder="Explain the task..." />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Topic">
              <input {...bind('category')} className="input" placeholder="Arrays" />
            </Field>
            <Field label="Difficulty">
              <select {...bind('difficulty')} className="input">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input {...bind('tags')} className="input" placeholder="array,hashmap" />
            </Field>
          </div>
        </section>

        <section className="card space-y-5 p-6">
          <h2 className="font-bold text-white">Input and output</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Input format"><textarea {...bind('inputFormat')} rows={3} className="input" /></Field>
            <Field label="Output format"><textarea {...bind('outputFormat')} rows={3} className="input" /></Field>
          </div>
          <Field label="Constraints"><textarea {...bind('constraintsText')} rows={2} className="input font-mono" /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Sample input"><textarea {...bind('sampleInput')} rows={3} className="input font-mono" /></Field>
            <Field label="Sample output"><textarea {...bind('sampleOutput')} rows={3} className="input font-mono" /></Field>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white">Test cases</h2>
              <p className="text-sm text-slate-400">The code runner feeds each input to stdin and compares the printed output.</p>
            </div>
            <button type="button" onClick={() => setTests([...tests, { input: '', output: '' }])} className="btn-outline py-2 text-xs">
              <Plus size={14} /> Add case
            </button>
          </div>
          {tests.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">No test cases yet. Without them, students can run code but it won't be auto-graded.</p>}
          {tests.map((t, i) => (
            <div key={i} className="grid items-start gap-3 rounded-xl border border-white/5 p-4 sm:grid-cols-[1fr_1fr_auto]">
              <Field label={`Case ${i + 1} input`}>
                <textarea value={t.input} onChange={(e) => updateTest(i, 'input', e.target.value)} rows={2} className="input font-mono" />
              </Field>
              <Field label="Expected output">
                <textarea value={t.output} onChange={(e) => updateTest(i, 'output', e.target.value)} rows={2} className="input font-mono" />
              </Field>
              <button type="button" onClick={() => setTests(tests.filter((_, idx) => idx !== i))} className="btn-ghost mt-6 p-2 text-rose-400" aria-label={`Remove case ${i + 1}`}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </section>

        <section className="card space-y-5 p-6">
          <h2 className="font-bold text-white">Solution</h2>
          <Field label="Approach / explanation"><textarea {...bind('explanation')} rows={3} className="input" /></Field>
          <Field label="Reference Java solution">
            <textarea {...bind('javaSolution')} rows={10} spellCheck={false} className="input font-mono text-emerald-300" />
          </Field>
          <Field label="Starter code (optional)" hint="Shown in the editor when a student opens the problem.">
            <textarea {...bind('defaultCodeTemplate')} rows={6} spellCheck={false} className="input font-mono" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Time complexity"><input {...bind('timeComplexity')} className="input font-mono" /></Field>
            <Field label="Space complexity"><input {...bind('spaceComplexity')} className="input font-mono" /></Field>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link to="/admin/problems" className="btn-outline">Cancel</Link>
          <button className="btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save problem'}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
