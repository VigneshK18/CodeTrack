import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Alert } from '../ui';

export default function NotesTab({ problemId }) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get(`/notes/${problemId}`).then((n) => setNote(n.note || '')).catch(() => setNote(''));
  }, [problemId]);

  const flash = (type, text) => {
    setStatus({ type, text });
    setTimeout(() => setStatus({ type: '', text: '' }), 2500);
  };

  async function save() {
    try {
      await api.post(`/notes/${problemId}`, { note });
      flash('success', 'Note saved');
    } catch (err) {
      flash('error', err.message);
    }
  }

  async function remove() {
    try {
      await api.delete(`/notes/${problemId}`);
      setNote('');
      flash('success', 'Note deleted');
    } catch (err) {
      flash('error', err.message);
    }
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-white">My notes</h2>
      <p className="mt-1 text-sm text-slate-400">Only you can see these. Write down the key idea so revision is quick.</p>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Key insight, edge cases, pseudocode..." className="input mt-4 h-64 resize-none" />
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} className="btn-primary"><Save size={16} /> Save note</button>
        {note && <button onClick={remove} className="btn-ghost text-rose-300"><Trash2 size={16} /> Delete</button>}
      </div>
      {status.text && <Alert type={status.type} className="mt-4">{status.text}</Alert>}
    </div>
  );
}
