import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Repeat, Flower2 } from "lucide-react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const API = 'http://localhost:5000/api';
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
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>Next Delivery: {s.next_delivery ? new Date(s.next_delivery).toLocaleDateString('en-IN') : '—'}</p>
                  </div>
                  {s.status !== 'Cancelled' && (
                    <button onClick={() => cancel(s.id)} style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-primary)', fontSize: '0.85rem' }}>Cancel</button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
