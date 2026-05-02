import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

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
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)'
};

export default function ProblemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/problems/${id}`)
        .then(data => setForm({ ...emptyForm, ...data }))
        .catch(err => setError(err.message));
    }
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (id) await api.put(`/problems/${id}`, form);
      else await api.post('/problems', form);
      navigate('/admin/problems');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page-section">
      <p className="eyebrow dark">ADMIN</p>
      <h1>{id ? 'Edit Problem' : 'Add Problem'}</h1>
      {error && <p className="error-box">{error}</p>}

      <form onSubmit={handleSubmit} className="problem-form">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Problem title" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <div className="two-col">
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />
          <select name="difficulty" value={form.difficulty} onChange={handleChange}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="tags comma separated" />
        <textarea name="inputFormat" value={form.inputFormat} onChange={handleChange} placeholder="Input format" />
        <textarea name="outputFormat" value={form.outputFormat} onChange={handleChange} placeholder="Output format" />
        <textarea name="constraintsText" value={form.constraintsText} onChange={handleChange} placeholder="Constraints" />
        <div className="two-col">
          <textarea name="sampleInput" value={form.sampleInput} onChange={handleChange} placeholder="Sample input" />
          <textarea name="sampleOutput" value={form.sampleOutput} onChange={handleChange} placeholder="Sample output" />
        </div>
        <textarea name="explanation" value={form.explanation} onChange={handleChange} placeholder="Explanation" />
        <textarea className="code-textarea" name="javaSolution" value={form.javaSolution} onChange={handleChange} placeholder="Java solution code" />
        <div className="two-col">
          <input name="timeComplexity" value={form.timeComplexity} onChange={handleChange} placeholder="Time complexity" />
          <input name="spaceComplexity" value={form.spaceComplexity} onChange={handleChange} placeholder="Space complexity" />
        </div>
        <button className="solid-btn">Save Problem</button>
      </form>
    </section>
  );
}
