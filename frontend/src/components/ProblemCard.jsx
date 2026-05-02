import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2 } from 'lucide-react';

export default function ProblemCard({ problem, solved = false, bookmarked = false }) {
  return (
    <article className="problem-card">
      <div className="card-top">
        <span className={`difficulty ${problem.difficulty?.toLowerCase()}`}>{problem.difficulty}</span>
        <div className="icon-row">
          {solved && <CheckCircle2 size={20} className="success-icon" />}
          {bookmarked && <Bookmark size={20} className="bookmark-icon" />}
        </div>
      </div>
      <h3>{problem.title}</h3>
      <p>{problem.description}</p>
      <div className="meta-row">
        <span>{problem.category}</span>
        <span>{problem.timeComplexity}</span>
      </div>
      <div className="tags-row">
        {(problem.tags || '').split(',').filter(Boolean).slice(0, 3).map(tag => (
          <span key={tag}>{tag.trim()}</span>
        ))}
      </div>
      <Link to={`/problems/${problem.id}`} className="card-link">Solve Problem</Link>
    </article>
  );
}
