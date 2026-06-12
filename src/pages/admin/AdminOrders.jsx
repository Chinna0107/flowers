import { useState, useEffect } from "react";
import { useAuth } from "../../store/authStore";

const STATUSES = ['All', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];
import { API } from "../../config/api";

const STATUS_C = { Delivered: '#2E4A2E', 'In Transit': '#C9A86A', Processing: '#888', Cancelled: '#dc2626', Confirmed: '#2563eb' };

const handlePrintOrder = (order) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  // Parse items
  let itemsList = [];
  try {
    itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
  } catch (e) {
    itemsList = [];
  }
  
  // Parse address
  let addressHtml = '';
  let customerPhone = '';
  if (order.address) {
    try {
      const parsedAddr = typeof order.address === 'string' ? JSON.parse(order.address) : order.address;
      if (parsedAddr && typeof parsedAddr === 'object') {
        if (parsedAddr.address) {
          addressHtml = `<div>${parsedAddr.address}</div>`;
        } else {
          addressHtml = `
            <div>${parsedAddr.flat || ''} ${parsedAddr.building || ''}</div>
            <div>${parsedAddr.street || ''}</div>
            <div>${parsedAddr.city || ''} - ${parsedAddr.pincode || ''}</div>
          `;
        }
        customerPhone = parsedAddr.phone || order.phone || order.customer_phone || '';
      } else {
        addressHtml = `<div>${parsedAddr}</div>`;
      }
    } catch (e) {
      addressHtml = `<div>${order.address}</div>`;
    }
  } else {
    addressHtml = '<div>No address details provided</div>';
  }

  // Items table
  const itemsTableRows = Array.isArray(itemsList) ? itemsList.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name || 'Product'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price || 0}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price || 0) * (item.quantity || 1)}</td>
    </tr>
  `).join('') : '';

  const html = `
    <html>
      <head>
        <title>Print Order #${order.id}</title>
        <style>
          body { font-family: 'Lato', sans-serif; color: #333; margin: 30px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #2E4A2E; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-family: 'Playfair Display', serif; color: #2E4A2E; margin: 0; font-size: 24px; }
          .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 14px; text-transform: uppercase; color: #C9A86A; letter-spacing: 1px; margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { padding: 10px; background: #FAF7F2; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
          .total { text-align: right; font-size: 18px; font-weight: bold; color: #2E4A2E; margin-top: 20px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2E4A2E; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print Receipt</button>
        </div>
        <div class="header">
          <h1 class="title">SOWGANDHIKA FLOWERS</h1>
          <p style="margin: 5px 0 0; font-style: italic; color: #666;">Fresh Daily · Order Receipt</p>
        </div>
        
        <div class="order-info">
          <div>
            <strong>Order ID:</strong> #${order.id}<br>
            <strong>Date:</strong> ${new Date(order.created_at).toLocaleString('en-IN')}<br>
            <strong>Status:</strong> ${order.status}
          </div>
          <div style="text-align: right;">
            <strong>Total Amount:</strong> ₹${parseFloat(order.total).toLocaleString('en-IN')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Customer Details</div>
          <div><strong>Name:</strong> ${order.customer_name || 'Customer'}</div>
          <div><strong>Email:</strong> ${order.customer_email || '—'}</div>
          ${customerPhone ? `<div><strong>Phone:</strong> ${customerPhone}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">Delivery Address</div>
          ${addressHtml}
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Product</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Price</th>
                <th style="width: 20%; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>
          <div class="total">Grand Total: ₹${parseFloat(order.total).toLocaleString('en-IN')}</div>
        </div>

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

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) return;
    const url = filter === 'All' ? `${API}/orders` : `${API}/orders?status=${filter}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, token]);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.2rem', margin: 0 }}>Orders</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>Manage and track all orders</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '0.35rem 1rem', fontSize: '0.85rem' }}>{s}</button>
        ))}
      </div>
      <div className="glass" style={{ padding: '1.5rem' }}>
        {loading ? <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
                {['Order ID', 'Customer', 'Total', 'Date', 'Status', 'Update', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(201,168,106,0.2)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-primary)' }}>#{o.id}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{o.customer_name}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{o.customer_email}</p>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>₹{parseFloat(o.total).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, backgroundColor: STATUS_C[o.status] || '#888', color: '#FAF7F2', fontSize: '0.78rem' }}>{o.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ padding: '0.3rem', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem', cursor: 'pointer' }}>
                      {['Processing', 'In Transit', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handlePrintOrder(o)} className="btn-outline" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                      Print
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
