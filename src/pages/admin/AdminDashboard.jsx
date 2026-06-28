import { useEffect, useState } from "react";
import { useAuth } from "../../store/authStore";
import { API } from "../../config/api";

const STATUS_C = { Delivered: '#2E4A2E', 'In Transit': '#C9A86A', Processing: '#888', Confirmed: '#2563eb', Cancelled: '#dc2626' };

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allSubs, setAllSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API}/reports`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/subscriptions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([reportData, ordersData, subsData]) => {
      setStats(reportData.stats);
      const orders = Array.isArray(ordersData) ? ordersData : [];
      const subs = Array.isArray(subsData) ? subsData : [];
      setAllOrders(orders);
      setAllSubs(subs);
      setRecentOrders(orders.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading dashboard...</div>;

  // Compute correct stats client-side from raw data as source of truth
  const todayStr = new Date().toDateString();

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

  const todayOrders = allOrders.filter(o => new Date(o.created_at).toDateString() === todayStr);
  const todayRevenue = todayOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

  const now = new Date();
  const activeSubs = allSubs.filter(s => {
    if (s.status !== 'Active') return false;
    if (!s.end_date) return true;
    const end = new Date(s.end_date);
    end.setHours(23, 59, 59, 999);
    return now <= end;
  }).length;

  const getSubTotal = (s) => {
    const ppd = parseFloat(s.price_per_day) || 0;
    const sch = (s.schedule || '').toLowerCase();
    let days = 1;
    if (sch.includes('alternate')) days = 15;
    else if (sch.includes('monthly')) days = 30;
    else if (sch.includes('weekly')) days = 4;
    else { const m = sch.match(/(\d+)\s*days?/); if (m) days = parseInt(m[1]); }
    return ppd * days;
  };

  const todaySubs = allSubs.filter(s => new Date(s.created_at).toDateString() === todayStr);
  const subRevenue = todaySubs.reduce((sum, s) => sum + getSubTotal(s), 0);

  const totalProducts = stats?.totalProducts ?? '—';
  const totalCustomers = stats?.totalCustomers ?? '—';

  const STAT_CARDS = [
    { label: 'Total Orders',    value: totalOrders,   sub: `${todayOrders.length} today`,       icon: '📦', color: '#2E4A2E' },
    { label: 'Active Subs',     value: activeSubs,    sub: `${allSubs.length} total`,            icon: '🔁', color: '#C9A86A' },
    { label: 'Order Revenue',   value: `₹${totalRevenue.toLocaleString('en-IN')}`,  sub: `₹${todayRevenue.toLocaleString('en-IN')} today`, icon: '💰', color: '#2E4A2E' },
    { label: 'Sub Revenue',     value: `₹${subRevenue.toLocaleString('en-IN')}`,    sub: `${todaySubs.length} subs today`,               icon: '🌿', color: '#5c7c8c' },
    { label: 'Customers',       value: totalCustomers, sub: 'Registered',                        icon: '👥', color: '#5c7c8c' },
    { label: 'Products',        value: totalProducts,  sub: 'In catalogue',                      icon: '🌸', color: '#C9A86A' },
  ];

  // Order status breakdown
  const statusBreakdown = allOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // Subscription schedule breakdown
  const scheduleBreakdown = allSubs.reduce((acc, s) => {
    const key = (s.schedule || 'Unknown').toLowerCase();
    if (key.includes('alternate')) acc['Alternate Days'] = (acc['Alternate Days'] || 0) + 1;
    else if (key.includes('weekly')) acc['Weekly'] = (acc['Weekly'] || 0) + 1;
    else if (key.includes('monthly')) acc['Monthly'] = (acc['Monthly'] || 0) + 1;
    else acc['Custom'] = (acc['Custom'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', marginBottom: '0.25rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Welcome back! Here's what's happening today.</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontStyle: 'italic' }}>{s.sub}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: s.color, margin: '0 0 0.25rem' }}>{s.value}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Order Status Breakdown */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>Order Status</h2>
          {Object.keys(statusBreakdown).length === 0
            ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No orders yet.</p>
            : Object.entries(statusBreakdown).map(([status, count]) => {
                const pct = Math.round((count / totalOrders) * 100);
                return (
                  <div key={status} style={{ marginBottom: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: STATUS_C[status] || '#888' }}>{status}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(201,168,106,0.2)', borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: STATUS_C[status] || '#888', borderRadius: 3, transition: '0.3s' }} />
                    </div>
                  </div>
                );
              })
          }
        </div>

        {/* Subscription Schedule Breakdown */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>Subscription Plans</h2>
          {Object.keys(scheduleBreakdown).length === 0
            ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No subscriptions yet.</p>
            : Object.entries(scheduleBreakdown).map(([plan, count]) => {
                const total = allSubs.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={plan} style={{ marginBottom: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>{plan}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(201,168,106,0.2)', borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 3, transition: '0.3s' }} />
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* Recent Orders */}
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
