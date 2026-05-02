export default function StatCard({ label, value, helper }) {
  return (
    <div className="stat-card">
      <h3>{value}</h3>
      <p>{label}</p>
      {helper && <small>{helper}</small>}
    </div>
  );
}
