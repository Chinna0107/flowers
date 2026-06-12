import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Repeat, Flower2 } from "lucide-react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";

const STATUS_C = { Active: { bg: 'rgba(46,74,46,0.1)', color: '#2E4A2E', border: 'rgba(46,74,46,0.3)' }, Paused: { bg: 'rgba(201,168,106,0.15)', color: '#b58b3c', border: 'rgba(201,168,106,0.5)' }, Cancelled: { bg: 'rgba(0,0,0,0.05)', color: '#666', border: 'rgba(0,0,0,0.1)' } };

export default function MySubscriptions() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) { navigate('/auth'); return; }
    fetch(`${API}/subscriptions/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSubs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isSubscriptionExpired = (endDateStr) => {
    if (!endDateStr) return false;
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    return new Date() > endDate;
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
    
    const expired = isSubscriptionExpired(sub.end_date);
    const nextDelivery = expired ? 'Expired' : formatDate(getNextDeliveryDate(sub.schedule));
    
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
              <strong>Status:</strong> <span class="badge ${expired ? 'badge-expired' : 'badge-active'}">${expired ? 'EXPIRED' : (sub.status || 'ACTIVE')}</span>
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

  useEffect(() => { load(); }, [token]);

  const cancel = async (id) => {
    if (!confirm('Cancel this subscription?')) return;
    await fetch(`${API}/subscriptions/${id}/cancel`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(201,168,106,0.15)', color: 'var(--color-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Repeat size={32} />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-primary)', fontSize: '2.5rem', margin: '0 0 0.5rem' }}>My Subscriptions</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage your recurring flower delivery plans.</p>
      </motion.div>

      {loading ? <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p> : (
        subs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <Flower2 size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No subscriptions yet.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/subscriptions')}>Start a Subscription</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {subs.map((s, i) => {
              const sc = STATUS_C[s.status] || STATUS_C.Active;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(201,168,106,0.3)', boxShadow: '0 8px 30px rgba(46,74,46,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem', margin: 0 }}>{s.product_name}</p>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: 100, backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: '0.8rem', fontWeight: 600 }}>{s.status}</span>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: '0 0 0.25rem' }}>🔁 {s.schedule}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      Next Delivery: {isSubscriptionExpired(s.end_date) ? (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>Expired</span>
                      ) : (
                        formatDate(getNextDeliveryDate(s.schedule))
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handlePrintSubscription(s)} style={{ background: 'none', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-primary)', fontSize: '0.85rem' }}>Print</button>
                    {s.status !== 'Cancelled' && !isSubscriptionExpired(s.end_date) && (
                      <button onClick={() => cancel(s.id)} style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-primary)', fontSize: '0.85rem' }}>Cancel</button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
