import { useEffect, useState } from "react";
import { useAuth } from "../../store/authStore";

const STATUS_C = { Delivered: '#2E4A2E', 'In Transit': '#C9A86A', Processing: '#888', Confirmed: '#2563eb', Cancelled: '#dc2626' };
const API = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API}/reports`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([reportData, ordersData]) => {
      setStats(reportData.stats);
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading dashboard...</div>;

  const STAT_CARDS = [
    { label: 'Total Orders',   value: stats?.totalOrders   ?? '—', icon: '📦', change: 'All time' },
    { label: 'Active Subs',    value: stats?.activeSubs    ?? '—', icon: '🔁', change: 'Currently active' },
    { label: 'Revenue',        value: stats ? `₹${parseFloat(stats.totalRevenue).toLocaleString('en-IN')}` : '—', icon: '💰', change: 'All time' },
    { label: 'Products',       value: stats?.totalProducts ?? '—', icon: '❀', change: 'In catalogue' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', marginBottom: '0.25rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Welcome back! Here's what's happening today.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontStyle: 'italic' }}>{s.change}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 0.25rem' }}>{s.value}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>Recent Orders</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
              {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid rgba(201,168,106,0.2)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-primary)' }}>#{r.id}</td>
                <td style={{ padding: '0.75rem', color: 'var(--color-text)' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{r.customer_name}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{r.customer_email}</p>
                </td>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontWeight: 700 }}>₹{parseFloat(r.total).toLocaleString('en-IN')}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, backgroundColor: STATUS_C[r.status] || '#888', color: '#FAF7F2', fontSize: '0.78rem' }}>{r.status}</span>
                </td>
                <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
