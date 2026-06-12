export default function AdminDashboard() {
  return (
    <section style={{ padding: '2rem' }}>
      <h1 className="vintage-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Total Orders</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>142</p>
        </div>
        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Active Subs</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>38</p>
        </div>
        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Revenue</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>$4,250</p>
        </div>
      </div>
    </section>
  );
}
