import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/profile').then(setProfile).catch(err => setError(err.message));
  }, []);

  return (
    <section className="page-section">
      <p className="eyebrow dark">ACCOUNT</p>
      <h1>Profile</h1>
      {error && <p className="error-box">{error}</p>}
      {profile && (
        <div className="profile-card">
          <h2>{profile.name}</h2>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Joined:</strong> {profile.createdAt?.slice(0, 10)}</p>
        </div>
      )}
    </section>
  );
}
