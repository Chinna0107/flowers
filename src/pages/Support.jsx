import { useState } from "react";
import { motion } from "framer-motion";
import { HeadphonesIcon } from "lucide-react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const API = 'http://localhost:5000/api';
const SUBJECTS = ['Daily flower delivery issue', 'Wrong / damaged order', 'Subscription management', 'Payment & billing', 'General query'];

export default function Support() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: SUBJECTS[0], message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/auth'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setForm({ subject: SUBJECTS[0], message: '' });
    } catch (err) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(201,168,106,0.15)', color: 'var(--color-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <HeadphonesIcon size={32} />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-primary)', fontSize: '2.5rem', margin: '0 0 0.5rem' }}>Support</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>We typically resolve issues within 2 hours.</p>
      </motion.div>

      {success ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'rgba(46,74,46,0.06)', border: '1px solid rgba(46,74,46,0.2)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Ticket Submitted!</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Our team will get back to you shortly.</p>
          <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setSuccess(false)}>Submit Another</button>
        </motion.div>
      ) : (
        <div className="glass" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Help Category</label>
              <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                style={{ width: '100%', padding: '0.9rem', border: '1px solid var(--color-accent)', borderRadius: '10px', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-primary)', outline: 'none', cursor: 'pointer' }}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Message</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required
                placeholder="Describe your issue or request here..."
                style={{ width: '100%', minHeight: '140px', padding: '0.9rem', border: '1px solid var(--color-accent)', borderRadius: '10px', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
