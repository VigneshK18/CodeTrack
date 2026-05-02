import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-section center-box">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="solid-btn">Go Home</Link>
    </section>
  );
}
