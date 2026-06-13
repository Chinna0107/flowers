import { useState, useEffect } from "react";
import { useAuth } from "../../store/authStore";
import { API } from "../../config/api";
import Swal from "sweetalert2";

const BLANK_COUPON = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  max_discount: '',
  min_order_value: ''
};

export default function AdminCoupons() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_COUPON);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`${API}/coupons`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load coupons');
        return r.json();
      })
      .then(d => setCoupons(Array.isArray(d) ? d : []))
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
          confirmButtonColor: '#2E4A2E'
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Coupon Code and Discount Value are required.',
        confirmButtonColor: '#2E4A2E'
      });
      return;
    }

    try {
      const res = await fetch(`${API}/coupons`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          code: form.code,
          discount_type: form.discount_type,
          discount_value: parseFloat(form.discount_value),
          max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
          min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create coupon');
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Coupon created successfully!',
        confirmButtonColor: '#2E4A2E'
      });

      setForm(BLANK_COUPON);
      setShowForm(false);
      load();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#2E4A2E'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Coupon?',
      text: 'Are you sure you want to delete this coupon? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel',
      background: 'var(--color-bg, #FAF7F2)',
      color: 'var(--color-primary, #2E4A2E)'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API}/coupons/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete coupon');
        }
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Coupon has been deleted.',
          confirmButtonColor: '#2E4A2E'
        });
        load();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
          confirmButtonColor: '#2E4A2E'
        });
      }
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
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', margin: 0 }}>Coupons</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Manage promotional discounts for subscribed members</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(BLANK_COUPON); setShowForm(!showForm); }} style={{ padding: '0.7rem 1.5rem' }}>
          {showForm ? '✕ Close' : '+ Create Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', border: '2px solid var(--color-accent)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            ➕ Create New Coupon
          </h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Coupon Code *</label>
                <input style={inp} placeholder="e.g. FESTIVE20" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Discount Type *</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} required>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Discount Value *</label>
                <input style={inp} type="number" step="any" placeholder={form.discount_type === 'percentage' ? "e.g. 15 (for 15%)" : "e.g. 100 (for ₹100)"} value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Max Discount (₹)</label>
                <input style={inp} type="number" step="any" placeholder="e.g. 150 (Only for Percentage)" disabled={form.discount_type !== 'percentage'} value={form.discount_type !== 'percentage' ? '' : form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Min Order Value (₹)</label>
                <input style={inp} type="number" step="any" placeholder="e.g. 499 (0 for no limit)" value={form.min_order_value} onChange={e => setForm({ ...form, min_order_value: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                ✓ Save Coupon
              </button>
              <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setForm(BLANK_COUPON); }} style={{ padding: '0.75rem 2rem' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Loading coupons...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
                {['Coupon Code', 'Discount Type', 'Discount Value', 'Max Discount', 'Min Order Value', 'Status', 'Created At', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(201,168,106,0.2)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--color-accent)', fontSize: '1.05rem', letterSpacing: 0.5 }}>{c.code}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{c.discount_type}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text)' }}>
                    {c.discount_type === 'percentage' && c.max_discount ? `₹${c.max_discount}` : '—'}
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text)' }}>
                    {c.min_order_value && parseFloat(c.min_order_value) > 0 ? `₹${c.min_order_value}` : 'No Limit'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: c.active ? 'rgba(46,74,46,0.1)' : 'rgba(220,38,38,0.1)',
                      color: c.active ? '#2E4A2E' : '#dc2626',
                      border: `1px solid ${c.active ? 'rgba(46,74,46,0.3)' : 'rgba(220,38,38,0.3)'}`
                    }}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '0.35rem 0.7rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No coupons created yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
