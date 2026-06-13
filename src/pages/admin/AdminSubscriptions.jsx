import { useState, useEffect } from "react";
import { useAuth } from "../../store/authStore";
import { API } from "../../config/api";


export default function AdminSubscriptions() {
  const { token } = useAuth();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isSubscriptionExpired = (endDateStr, status) => {
    if (status === 'Paused') return false;
    if (!endDateStr) return false;
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    return new Date() > endDate;
  };

  const load = () => {
    if (!token) return;
    fetch(`${API}/subscriptions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSubs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  const filteredSubs = subs.filter(s => {
    if (filter === 'All') return true;
    const expired = isSubscriptionExpired(s.end_date, s.status);
    if (filter === 'Expired') return expired && s.status !== 'Paused';
    if (filter === 'Active') return s.status === 'Active' && !expired;
    return s.status === filter;
  });

  useEffect(() => { load(); }, [token]);

  const getStatusBadge = (status) => {
    const badges = {
      Active: { bg: 'rgba(46,74,46,0.1)', color: '#2E4A2E', border: 'rgba(46,74,46,0.3)' },
      Paused: { bg: 'rgba(201,168,106,0.15)', color: '#b58b3c', border: 'rgba(201,168,106,0.5)' },
      Cancelled: { bg: 'rgba(0,0,0,0.05)', color: '#666', border: 'rgba(0,0,0,0.1)' },
      Inactive: { bg: 'rgba(220,38,38,0.05)', color: '#dc2626', border: 'rgba(220,38,38,0.1)' },
    };
    const sc = badges[status] || badges.Active;
    return <span style={{ padding: '0.25rem 0.65rem', borderRadius: 100, backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: '0.75rem', fontWeight: 600 }}>
      {status}
    </span>;
  };

  const getNextDeliveryDate = (schedule) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    if (!schedule) return tomorrow;
    
    const s = schedule.toLowerCase();
    if (s.includes('alternate')) {
      return dayAfter;
    }
    return tomorrow;
  };

  const handlePrintSubscription = (sub) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const expired = isSubscriptionExpired(sub.end_date, sub.status);
    const nextDelivery = sub.status === 'Paused' ? 'Paused' : expired ? 'Expired' : formatDate(sub.next_delivery);
    
    const html = `
      <html>
        <head>
          <title>Print Subscription #${sub.id}</title>
          <style>
            body { font-family: 'Lato', sans-serif; color: #333; margin: 30px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #2E4A2E; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-family: 'Playfair Display', serif; color: #2E4A2E; margin: 0; font-size: 24px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; text-transform: uppercase; color: #C9A86A; letter-spacing: 1px; margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .badge { padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
            .badge-active { background: #e2f0d9; color: #385723; }
            .badge-paused { background: #fff2cc; color: #b58b3c; }
            .badge-expired { background: #fce4d6; color: #c65911; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2E4A2E; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print Subscription</button>
          </div>
          <div class="header">
            <h1 class="title">SOWGANDHIKA FLOWERS</h1>
            <p style="margin: 5px 0 0; font-style: italic; color: #666;">Fresh Daily · Subscription Details</p>
          </div>
          
          <div class="info-grid">
            <div>
              <strong>Subscription ID:</strong> #${sub.id}<br>
              <strong>Product:</strong> ${sub.product_name}<br>
              <strong>Schedule:</strong> ${sub.schedule}<br>
              <strong>Price Per Day:</strong> ${sub.price_per_day ? `₹${sub.price_per_day}` : '—'}
            </div>
            <div style="text-align: right;">
              <strong>Start Date:</strong> ${formatDate(sub.start_date)}<br>
              <strong>End Date:</strong> ${formatDate(sub.end_date)}<br>
              <strong>Next Delivery:</strong> ${nextDelivery}<br>
              <strong>Status:</strong> <span class="badge ${sub.status === 'Paused' ? 'badge-paused' : (expired ? 'badge-expired' : 'badge-active')}">${expired ? 'EXPIRED' : (sub.status || 'ACTIVE').toUpperCase()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Details</div>
            <div><strong>Name:</strong> ${sub.customer_name || 'Customer'}</div>
            <div><strong>Email:</strong> ${sub.customer_email || '—'}</div>
            ${sub.customer_phone || sub.phone ? `<div><strong>Phone:</strong> ${sub.customer_phone || sub.phone}</div>` : ''}
          </div>

          ${sub.customer_address || sub.address ? `
          <div class="section">
            <div class="section-title">Delivery Address</div>
            <div>${sub.customer_address || sub.address}</div>
          </div>
          ` : ''}

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
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
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', margin: 0 }}>Subscriptions</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
          Manage all recurring flower delivery plans • Total: <strong>{filteredSubs.length}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['All', 'Active', 'Paused', 'Cancelled', 'Expired'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '0.35rem 1rem', fontSize: '0.85rem' }}>{f}</button>
        ))}
      </div>

      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Loading subscriptions...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
                {['ID', 'Customer', 'Product', 'Schedule', 'Status', 'Start Date', 'End Date', 'Next Delivery', 'Price/Day', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map(s => {
                const expired = isSubscriptionExpired(s.end_date, s.status);
                return (
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
                    <td style={{ padding: '0.75rem' }}>{getStatusBadge(s.status)}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(s.start_date)}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{formatDate(s.end_date)}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {s.status === 'Paused' ? (
                        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Paused</span>
                      ) : expired ? (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>Expired</span>
                      ) : (
                        formatDate(s.next_delivery)
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--color-text)', fontWeight: 600 }}>
                      {s.price_per_day ? `₹${s.price_per_day}` : '—'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button onClick={() => handlePrintSubscription(s)} className="btn-outline" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                        Print
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredSubs.length === 0 && (
                <tr><td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No subscriptions match the selected filter.
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
