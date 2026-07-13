import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Repeat, Flower2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";
import Swal from "sweetalert2";

const STATUS_C = { 
  Active: { bg: 'rgba(46,74,46,0.1)', color: '#2E4A2E', border: 'rgba(46,74,46,0.3)' }, 
  Paused: { bg: 'rgba(201,168,106,0.15)', color: '#b58b3c', border: 'rgba(201,168,106,0.5)' }, 
  Cancelled: { bg: 'rgba(0,0,0,0.05)', color: '#666', border: 'rgba(0,0,0,0.1)' },
  Inactive: { bg: 'rgba(220,38,38,0.05)', color: '#dc2626', border: 'rgba(220,38,38,0.1)' }
};

function getDeliveryDates(sub) {
  if (!sub.start_date) return [];
  const start = new Date(sub.start_date);
  start.setHours(0, 0, 0, 0);
  const end = sub.end_date ? new Date(sub.end_date) : null;
  const s = (sub.schedule || '').toLowerCase();
  const dates = [];

  if (s.includes('alternate')) {
    let d = new Date(start);
    for (let i = 0; i < 15; i++) {
      if (end && d > end) break;
      dates.push(new Date(d));
      d.setDate(d.getDate() + 2);
    }
  } else if (s.includes('weekly')) {
    const wd = sub.weekday ?? start.getDay();
    let d = new Date(start);
    while (d.getDay() !== wd) d.setDate(d.getDate() + 1);
    for (let i = 0; i < 4; i++) {
      if (end && d > end) break;
      dates.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
  } else if (s.includes('monthly') || s.includes('month')) {
    let d = new Date(start);
    for (let i = 0; i < 30; i++) {
      if (end && d > end) break;
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  } else {
    // daily / n_days
    let d = new Date(start);
    while (!end || d <= end) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
      if (dates.length > 90) break;
    }
  }
  return dates;
}

function SubscriptionCalendar({ sub }) {
  const [open, setOpen] = useState(false);
  const dates = getDeliveryDates(sub);
  if (!dates.length) return null;

  const months = [];
  const seen = new Set();
  dates.forEach(d => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) { seen.add(key); months.push({ year: d.getFullYear(), month: d.getMonth() }); }
  });
  const deliverySet = new Set(dates.map(d => d.toDateString()));
  const today = new Date().toDateString();

  return (
    <div style={{ width: '100%', marginTop: '0.75rem', borderTop: '1px dashed rgba(201,168,106,0.3)', paddingTop: '0.75rem' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-accent)', fontFamily: 'Playfair Display, serif', fontWeight: 600, fontSize: '0.9rem', padding: 0 }}>
        📅 View Delivery Dates {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </button>
      {open && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {months.map(({ year, month }) => {
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const cells = [];
            for (let i = 0; i < firstDay; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);
            return (
              <div key={`${year}-${month}`} style={{ background: '#FAF7F2', border: '1px solid rgba(201,168,106,0.25)', borderRadius: 12, padding: '0.75rem', minWidth: 200, flex: '1 1 200px', maxWidth: 260 }}>
                <div style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  {new Date(year, month).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-text-muted)', paddingBottom: 3 }}>{d}</div>
                  ))}
                  {cells.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const dk = new Date(year, month, day).toDateString();
                    const isDelivery = deliverySet.has(dk);
                    const isToday = dk === today;
                    return (
                      <div key={i} title={isDelivery ? '🌸 Delivery' : ''} style={{
                        aspectRatio: '1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.62rem', fontWeight: isDelivery ? 700 : 400,
                        background: isDelivery ? 'var(--color-primary)' : isToday ? 'rgba(201,168,106,0.2)' : 'transparent',
                        color: isDelivery ? '#FAF7F2' : isToday ? 'var(--color-accent)' : 'var(--color-text)',
                        outline: isToday && !isDelivery ? '1.5px solid var(--color-accent)' : 'none',
                      }}>{day}</div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p style={{ width: '100%', fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>🌸 Green = delivery · Ring = today</p>
        </div>
      )}
    </div>
  );
}

export default function MySubscriptions() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  const load = () => {
    const storedAuth = localStorage.getItem('auth');
    const activeToken = token || (storedAuth ? JSON.parse(storedAuth)?.token : null);
    if (!activeToken) { navigate('/auth'); return; }
    
    Promise.all([
      fetch(`${API}/subscriptions/my`, { headers: { Authorization: `Bearer ${activeToken}` } }).then(r => r.json()),
      fetch(`${API}/products`).then(r => r.json())
    ])
    .then(([subsData, prodsData]) => {
      setSubs(Array.isArray(subsData) ? subsData : []);
      const pMap = {};
      if (Array.isArray(prodsData)) {
        prodsData.forEach(p => pMap[p.name] = p);
      }
      setProducts(pMap);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  };

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

  useEffect(() => { 
    const storedAuth = localStorage.getItem('auth');
    const activeToken = token || (storedAuth ? JSON.parse(storedAuth)?.token : null);
    if (activeToken) {
      load(); 
    } else {
      // Small timeout to allow auth provider to initialize if refreshing
      const timer = setTimeout(() => {
        const recheckAuth = localStorage.getItem('auth');
        if (!token && !recheckAuth) {
          navigate('/auth');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [token]);

  const cancel = async (id) => {
    const storedAuth = localStorage.getItem('auth');
    const activeToken = token || (storedAuth ? JSON.parse(storedAuth)?.token : null);
    if (!activeToken) return;

    const result = await Swal.fire({
      title: 'Cancel Subscription?',
      text: 'Are you sure you want to cancel this subscription? You will stop receiving daily flower deliveries.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, Cancel it!',
      cancelButtonText: 'No, Keep it',
      background: 'var(--color-bg, #FAF7F2)',
      color: 'var(--color-primary, #2E4A2E)'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API}/subscriptions/${id}/cancel`, { 
          method: 'PUT', 
          headers: { Authorization: `Bearer ${activeToken}` } 
        });
        if (res.ok) {
          Swal.fire({
            title: 'Cancelled!',
            text: 'Your subscription status is now Cancelled.',
            icon: 'success',
            confirmButtonColor: 'var(--color-primary, #2E4A2E)',
            background: 'var(--color-bg, #FAF7F2)',
            color: 'var(--color-primary, #2E4A2E)'
          });
          load();
        } else {
          const errData = await res.json();
          Swal.fire({
            title: 'Error',
            text: errData.error || 'Failed to cancel subscription.',
            icon: 'error',
            confirmButtonColor: 'var(--color-primary, #2E4A2E)',
            background: 'var(--color-bg, #FAF7F2)',
            color: 'var(--color-primary, #2E4A2E)'
          });
        }
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'An error occurred. Please try again.',
          icon: 'error',
          confirmButtonColor: 'var(--color-primary, #2E4A2E)',
          background: 'var(--color-bg, #FAF7F2)',
          color: 'var(--color-primary, #2E4A2E)'
        });
      }
    }
  };

  const pause = async (id) => {
    const storedAuth = localStorage.getItem('auth');
    const activeToken = token || (storedAuth ? JSON.parse(storedAuth)?.token : null);
    if (!activeToken) return;

    const result = await Swal.fire({
      title: 'Pause Subscription?',
      text: 'Deliveries will be suspended temporarily. You can resume them anytime.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-accent, #C9A86A)',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, Pause it!',
      cancelButtonText: 'No, Keep active',
      background: 'var(--color-bg, #FAF7F2)',
      color: 'var(--color-primary, #2E4A2E)'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API}/subscriptions/${id}/pause`, { 
          method: 'PUT', 
          headers: { Authorization: `Bearer ${activeToken}` } 
        });
        if (res.ok) {
          Swal.fire({
            title: 'Paused!',
            text: 'Your subscription has been paused.',
            icon: 'success',
            confirmButtonColor: 'var(--color-primary, #2E4A2E)',
            background: 'var(--color-bg, #FAF7F2)',
            color: 'var(--color-primary, #2E4A2E)'
          });
          load();
        } else {
          const errData = await res.json();
          Swal.fire({
            title: 'Error',
            text: errData.error || 'Failed to pause subscription.',
            icon: 'error',
            confirmButtonColor: 'var(--color-primary, #2E4A2E)',
            background: 'var(--color-bg, #FAF7F2)',
            color: 'var(--color-primary, #2E4A2E)'
          });
        }
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'An error occurred. Please try again.',
          icon: 'error',
          confirmButtonColor: 'var(--color-primary, #2E4A2E)',
          background: 'var(--color-bg, #FAF7F2)',
          color: 'var(--color-primary, #2E4A2E)'
        });
      }
    }
  };

  const resume = async (id) => {
    const storedAuth = localStorage.getItem('auth');
    const activeToken = token || (storedAuth ? JSON.parse(storedAuth)?.token : null);
    if (!activeToken) return;

    const result = await Swal.fire({
      title: 'Resume Subscription?',
      text: 'Deliveries will start again from tomorrow.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #2E4A2E)',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, Resume it!',
      cancelButtonText: 'Cancel',
      background: 'var(--color-bg, #FAF7F2)',
      color: 'var(--color-primary, #2E4A2E)'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API}/subscriptions/${id}/resume`, { 
          method: 'PUT', 
          headers: { Authorization: `Bearer ${activeToken}` } 
        });
        if (res.ok) {
          Swal.fire({
            title: 'Resumed!',
            text: 'Your subscription has been resumed.',
            icon: 'success',
            confirmButtonColor: 'var(--color-primary, #2E4A2E)',
            background: 'var(--color-bg, #FAF7F2)',
            color: 'var(--color-primary, #2E4A2E)'
          });
          load();
        } else {
          const errData = await res.json();
          Swal.fire({
            title: 'Error',
            text: errData.error || 'Failed to resume subscription.',
            icon: 'error',
            confirmButtonColor: 'var(--color-primary, #2E4A2E)',
            background: 'var(--color-bg, #FAF7F2)',
            color: 'var(--color-primary, #2E4A2E)'
          });
        }
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'An error occurred. Please try again.',
          icon: 'error',
          confirmButtonColor: 'var(--color-primary, #2E4A2E)',
          background: 'var(--color-bg, #FAF7F2)',
          color: 'var(--color-primary, #2E4A2E)'
        });
      }
    }
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
              const expired = isSubscriptionExpired(s.end_date, s.status);
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ 
                    background: 'linear-gradient(145deg, #ffffff, #fdfbf7)', 
                    padding: '1.5rem', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(201,168,106,0.3)', 
                    boxShadow: '0 12px 35px rgba(46,74,46,0.05), inset 0 1px 0 #ffffff', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Product Image */}
                    <div style={{ width: '110px', height: '110px', borderRadius: '18px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.08)', background: '#f5f5f5' }}>
                      <img src={products[s.product_name]?.img || 'https://res.cloudinary.com/dwgqfg2xc/image/upload/v1782584507/WhatsApp_Image_2026-06-27_at_09.33.56_umdbmp.jpg'} alt={s.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.5rem', margin: 0 }}>{s.product_name}</h3>
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: 100, backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.status}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Schedule</span>
                          <span style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Repeat size={14} color="var(--color-accent)"/> {s.schedule}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Next Delivery</span>
                          <span style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 600 }}>
                            {s.status === 'Paused' ? (
                              <span style={{ color: 'var(--color-accent)' }}>Paused</span>
                            ) : expired ? (
                              <span style={{ color: '#dc2626' }}>Expired</span>
                            ) : (
                              formatDate(s.next_delivery)
                            )}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Price/Day</span>
                          <span style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{s.price_per_day || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                      <button onClick={() => handlePrintSubscription(s)} style={{ background: '#fff', border: '1px solid rgba(201,168,106,0.6)', color: 'var(--color-primary)', padding: '0.5rem 1.2rem', borderRadius: '100px', cursor: 'pointer', fontFamily: 'var(--font-primary)', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} onMouseOver={e=>e.target.style.background='var(--color-bg)'} onMouseOut={e=>e.target.style.background='#fff'}>Print</button>
                      
                      {s.status === 'Active' && !expired && (
                        <button onClick={() => pause(s.id)} style={{ background: '#fff', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '0.5rem 1.2rem', borderRadius: '100px', cursor: 'pointer', fontFamily: 'var(--font-primary)', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} onMouseOver={e=>{e.target.style.background='var(--color-accent)'; e.target.style.color='#fff'}} onMouseOut={e=>{e.target.style.background='#fff'; e.target.style.color='var(--color-accent)'}}>Pause</button>
                      )}
                      
                      {s.status === 'Paused' && !expired && (
                        <button onClick={() => resume(s.id)} style={{ background: 'var(--color-accent)', border: '1px solid var(--color-accent)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '100px', cursor: 'pointer', fontFamily: 'var(--font-primary)', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(201,168,106,0.3)' }} onMouseOver={e=>e.target.style.opacity='0.9'} onMouseOut={e=>e.target.style.opacity='1'}>Resume</button>
                      )}
                      

                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid rgba(201,168,106,0.15)', paddingTop: '0.2rem' }}>
                    <SubscriptionCalendar sub={s} />
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
