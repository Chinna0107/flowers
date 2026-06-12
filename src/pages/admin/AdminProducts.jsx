import { useState, useEffect } from "react";
import { useAuth } from "../../store/authStore";
import { API } from "../../config/api";

const BLANK = { name: '', category: 'fresh', price_per_unit: '', our_price: '', mrp: '', tag: '', img: '', description: '' };

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const load = () => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API}/products/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setForm({ ...form, img: data.url });
      }
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editing ? `${API}/products/${editing}` : `${API}/products`;
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        price_per_unit: form.price_per_unit ? +form.price_per_unit : null,
        our_price: +form.our_price,
        mrp: form.mrp ? +form.mrp : null,
      }),
    });
    setForm(BLANK); setEditing(null); setShowForm(false); setImageFile(null); load();
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      category: p.category,
      price_per_unit: p.price_per_unit || '',
      our_price: p.our_price,
      mrp: p.mrp || '',
      tag: p.tag || '',
      img: p.img || '',
      description: p.description || '',
    });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
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
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', margin: 0 }}>Products</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Manage your flower catalogue with ease</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(BLANK); setEditing(null); setImageFile(null); setShowForm(!showForm); }} style={{ padding: '0.7rem 1.5rem' }}>
          {showForm ? '✕ Close' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', border: '2px solid var(--color-accent)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            {editing ? '✏️ Edit Product' : '➕ New Product'}
          </h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Product Name *</label>
                <input style={inp} placeholder="e.g. Premium Rose Bouquet" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Category *</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="fresh">Fresh Flowers</option>
                  <option value="pooja-premium">Pooja Premium</option>
                  <option value="pooja-basic">Pooja Basic</option>
                  <option value="poola-jada">Poola Jada</option>
                  <option value="hair">Hair Accessories</option>
                  <option value="garlands">Garlands</option>
                  <option value="jewellery">Flower Jewellery</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Price Per Unit (₹)</label>
                <input style={inp} type="number" placeholder="Daily rate for subscriptions" value={form.price_per_unit} onChange={e => setForm({ ...form, price_per_unit: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Our Price (₹) *</label>
                <input style={inp} type="number" placeholder="Your selling price" value={form.our_price} onChange={e => setForm({ ...form, our_price: e.target.value })} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>MRP (₹)</label>
                <input style={inp} type="number" placeholder="Maximum retail price" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Tag</label>
                <input style={inp} placeholder="e.g. Best Seller, Premium" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Product Image</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ padding: '0.7rem 1.5rem', border: '2px dashed var(--color-accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--color-bg)', fontWeight: 600, color: 'var(--color-accent)' }}>
                  {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
                {form.img && (
                  <img src={form.img} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-accent)' }} />
                )}
                {form.img && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>✓ Image uploaded</span>}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>Description</label>
              <textarea style={{ ...inp, minHeight: '100px', resize: 'vertical' }} placeholder="Describe the product..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                {editing ? '💾 Update Product' : '✓ Save Product'}
              </button>
              <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setForm(BLANK); setImageFile(null); }} style={{ padding: '0.75rem 2rem' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Loading products...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
                {['Image', 'Name', 'Category', 'Price/Unit', 'Our Price', 'MRP', 'Tag', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(201,168,106,0.2)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    {p.img && <img src={p.img} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />}
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-primary)' }}>{p.name}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{p.category}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text)' }}>{p.price_per_unit ? `₹${p.price_per_unit}` : '—'}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>₹{p.our_price}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{p.mrp ? `₹${p.mrp}` : '—'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {p.tag && <span style={{ background: 'var(--color-primary)', color: 'var(--color-secondary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem' }}>{p.tag}</span>}
                  </td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(p)} className="btn-outline" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '0.35rem 0.7rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No products yet. Add your first product!</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
