import { useState, useEffect } from "react";
import { useAuth } from "../../store/authStore";
import { API } from "../../config/api";


export default function AdminSubscriptions() {
  const { token } = useAuth();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) return;
    fetch(`${API}/subscriptions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSubs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getScheduleBadge = (schedule) => {
    const badges = {
      'Monthly': { bg: '#2E4A2E', icon: '📅' },
      'Weekly': { bg: '#C9A86A', icon: '📆' },
      'Alternate Days (30 days)': { bg: '#5c7c8c', icon: '🔄' },
    };
    const badge = badges[schedule] || { bg: '#888', icon: '🔁' };
    return <span style={{ background: badge.bg, color: '#FAF7F2', padding: '0.25rem 0.7rem', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600 }}>
      {badge.icon} {schedule}
    </span>;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', margin: 0 }}>Active Subscriptions</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
          Manage all active recurring delivery plans • Total: <strong>{subs.length}</strong>
        </p>
      </div>

      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Loading subscriptions...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
                {['ID', 'Customer', 'Product', 'Schedule', 'Start Date', 'End Date', 'Next Delivery', 'Price/Day'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(201,168,106,0.2)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                    {s.id}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem' }}>{s.customer_name}</p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.customer_email}</p>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text)', fontWeight: 500 }}>{s.product_name}</td>
                  <td style={{ padding: '0.75rem' }}>{getScheduleBadge(s.schedule)}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(s.start_date)}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(s.end_date)}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.85rem' }}>{formatDate(s.next_delivery)}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    {s.price_per_day ? `₹${s.price_per_day}` : '—'}
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No active subscriptions at the moment.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginTop: '2rem', background: 'rgba(201,168,106,0.08)' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', margin: '0 0 0.75rem', fontSize: '1.1rem' }}>📊 Schedule Types</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Monthly', desc: 'Delivery every 30 days', count: subs.filter(s => s.schedule === 'Monthly').length },
            { label: 'Weekly', desc: 'Delivery every 7 days', count: subs.filter(s => s.schedule === 'Weekly').length },
            { label: 'Alternate Days', desc: 'Delivery every 2 days for 30 days', count: subs.filter(s => s.schedule.includes('Alternate')).length },
            { label: 'Custom N Days', desc: 'Custom duration subscriptions', count: subs.filter(s => s.schedule.includes('Days') && !s.schedule.includes('Alternate')).length },
          ].map(item => (
            <div key={item.label} style={{ padding: '1rem', background: 'var(--color-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-accent)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.25rem' }}>{item.count}</div>
              <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
