import { useState, useEffect } from "react";
import { useAuth } from "../../store/authStore";
import { API } from "../../config/api";

export default function AdminBanner() {
  const { token } = useAuth();
  const [form, setForm] = useState({ title: '', subtitle: '', link_text: '', link_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/settings/home_middle_banner`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);



  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/home_middle_banner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage('Banner saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert('Failed to save banner');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    padding: '0.7rem 1rem',
    border: '1px solid var(--color-accent)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-primary)',
    background: 'rgba(255,255,255,0.9)',
    color: 'var(--color-text)',
    outline: 'none',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '1rem'
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading banner settings...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', margin: 0 }}>Home Page Banner</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Edit the promotional banner displayed on the home page</p>
      </div>

      <div className="glass" style={{ padding: '2rem', maxWidth: '800px', border: '2px solid var(--color-accent)' }}>
        {message && <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>✓ {message}</div>}
        
        <form onSubmit={handleSave}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)' }}>Banner Title</label>
          <input style={inp} placeholder="e.g. Premium Floral Arrangements" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />

          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)' }}>Banner Subtitle</label>
          <input style={inp} placeholder="e.g. Celebrate every moment with our handpicked blooms" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />

          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)' }}>Button Text</label>
          <input style={inp} placeholder="e.g. Shop Now" value={form.link_text} onChange={e => setForm({ ...form, link_text: e.target.value })} />

          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)' }}>Button URL</label>
          <input style={inp} placeholder="e.g. /products" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} />



          <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            {saving ? 'Saving...' : 'Save Banner Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
