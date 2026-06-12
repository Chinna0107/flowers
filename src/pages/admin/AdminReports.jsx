import { useEffect, useState } from "react";
import { useAuth } from "../../store/authStore";

const API = 'http://localhost:5000/api';

export default function AdminReports() {
  const { token } = useAuth();
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setReport);
  }, [token]);

  if (!report) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading reports...</div>;

  const maxRevenue = Math.max(...(report.monthlySales || []).map(m => parseFloat(m.revenue) || 0), 1);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', margin: 0 }}>Reports</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>Sales and performance overview</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Revenue',   value: `₹${parseFloat(report.stats?.totalRevenue || 0).toLocaleString('en-IN')}`, sub: 'All time' },
          { label: 'Total Orders',    value: report.stats?.totalOrders ?? '—',   sub: 'All time' },
          { label: 'Total Customers', value: report.stats?.totalCustomers ?? '—', sub: 'Registered' },
          { label: 'Active Subs',     value: report.stats?.activeSubs ?? '—',     sub: 'Active plans' },
        ].map(c => (
          <div key={c.label} className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-accent)', margin: '0 0 0.25rem' }}>{c.value}</p>
            <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', margin: '0 0 0.2rem', fontWeight: 600, fontSize: '0.9rem' }}>{c.label}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Monthly Bar Chart */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Monthly Revenue</h2>
          {report.monthlySales?.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 160 }}>
              {report.monthlySales.map(m => (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>₹{(parseFloat(m.revenue)/1000).toFixed(0)}k</span>
                  <div style={{ width: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px 4px 0 0', height: `${(parseFloat(m.revenue) / maxRevenue) * 120}px`, transition: '0.3s' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{m.month?.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>No data yet</p>}
        </div>

        {/* Top Products */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Top Products</h2>
          {report.topProducts?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {report.topProducts.map((p, i) => {
                const max = Math.max(...report.topProducts.map(x => parseInt(x.order_count) || 0), 1);
                const pct = Math.round((parseInt(p.order_count) / max) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 600 }}>{p.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontFamily: 'var(--font-serif)' }}>₹{parseFloat(p.revenue).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: 'rgba(201,168,106,0.2)', borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.order_count} orders</span>
                  </div>
                );
              })}
            </div>
          ) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>No data yet</p>}
        </div>
      </div>
    </div>
  );
}
