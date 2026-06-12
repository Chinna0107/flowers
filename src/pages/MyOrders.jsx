import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";

const STATUS_ICONS = { Delivered: <CheckCircle size={16} />, 'In Transit': <Truck size={16} />, Processing: <Clock size={16} />, Confirmed: <CheckCircle size={16} /> };
const STATUS_COLORS = {
  Delivered: { bg: 'rgba(46,74,46,0.1)', color: '#2E4A2E', border: 'rgba(46,74,46,0.3)' },
  'In Transit': { bg: 'rgba(201,168,106,0.15)', color: '#b58b3c', border: 'rgba(201,168,106,0.5)' },
  Processing: { bg: 'rgba(0,0,0,0.05)', color: '#666', border: 'rgba(0,0,0,0.1)' },
  Confirmed: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb', border: 'rgba(37,99,235,0.3)' },
  Cancelled: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', border: 'rgba(220,38,38,0.3)' },
};

export default function MyOrders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    fetch(`${API}/orders/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(201,168,106,0.15)', color: 'var(--color-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Package size={32} />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-primary)', fontSize: '2.5rem', margin: '0 0 0.5rem' }}>My Orders</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Track and manage your recent flower deliveries.</p>
      </motion.div>

      {loading ? <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading your orders...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <p>No orders yet. <button className="btn-primary" style={{ marginLeft: '0.5rem' }} onClick={() => navigate('/products')}>Shop Now</button></p>
            </div>
          ) : orders.map((o, idx) => {
            const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Processing;
            const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
            return (
              <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(201,168,106,0.3)', boxShadow: '0 8px 30px rgba(46,74,46,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem', margin: 0 }}>#{o.id}</p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: 100, backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: '0.82rem', fontWeight: 600 }}>
                      {STATUS_ICONS[o.status]} {o.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: '0 0 0.5rem' }}>📅 {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text)', margin: 0 }}>
                    <span style={{ fontWeight: 600 }}>Items:</span> {Array.isArray(items) ? items.map(i => `${i.name} ×${i.quantity}`).join(', ') : '—'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(201,168,106,0.05)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px dashed rgba(201,168,106,0.4)' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: 1 }}>Order Total</p>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.4rem', margin: 0 }}>₹{parseFloat(o.total).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
