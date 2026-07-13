import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../store/authStore";
import { API } from "../config/api";
import { Calendar, Repeat, Flower2, Zap, ArrowLeft, ShieldCheck, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import "./Subscriptions.css";
import { BUILDINGS, PINCODES } from "../data/addressOptions.js";


const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const PLANS = [
  { id: 'monthly', label: 'Monthly', icon: <Calendar size={24} />, desc: 'Daily delivery for 30 days', deliveries: 30, days: 30 },
  { id: 'weekly', label: 'Weekly', icon: <Flower2 size={24} />, desc: '4 deliveries/month · choose your day', deliveries: 4, days: 28 },
  { id: 'alternate', label: 'Alternate Days', icon: <Zap size={24} />, desc: '15 deliveries in 30 days (every 2nd day)', deliveries: 15, days: 30 },
  { id: 'n_days', label: 'Custom N Days', icon: <Repeat size={24} />, desc: 'Choose how many days you want', custom: true },
];

// Returns array of Date objects for delivery dates starting from `start`
function getDeliveryDates(schedule, weekday, nDays, start = new Date(Date.now() + 86400000)) {
  const dates = [];
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);

  if (schedule === 'monthly') {
    let d = new Date(s);
    for (let i = 0; i < 30; i++) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  } else if (schedule === 'alternate') {
    let d = new Date(s);
    for (let i = 0; i < 15; i++) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 2);
    }
  } else if (schedule === 'weekly') {
    let d = new Date(s);
    // advance to chosen weekday
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    for (let i = 0; i < 4; i++) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
  } else if (schedule === 'n_days') {
    let d = new Date(s);
    for (let i = 0; i < nDays; i++) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  }
  return dates;
}

// Mini calendar that highlights delivery dates
function DeliveryCalendar({ dates }) {
  if (!dates || dates.length === 0) return null;

  // Determine month range to show
  const months = [];
  const seen = new Set();
  dates.forEach(d => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) { seen.add(key); months.push({ year: d.getFullYear(), month: d.getMonth() }); }
  });

  const deliverySet = new Set(dates.map(d => d.toDateString()));

  return (
    <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
      <p className="subscription-label" style={{ marginBottom: '0.75rem' }}>📅 Delivery Calendar Preview</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
        {months.map(({ year, month }) => {
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const cells = [];
          for (let i = 0; i < firstDay; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);

          return (
            <div key={`${year}-${month}`} style={{ background: '#fff', border: '1px solid rgba(201,168,106,0.3)', borderRadius: 14, padding: '1rem 1.1rem', minWidth: 220, flex: '1 1 220px', maxWidth: 280 }}>
              <div style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                {new Date(year, month).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', paddingBottom: '4px' }}>{d}</div>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dateKey = new Date(year, month, day).toDateString();
                  const isDelivery = deliverySet.has(dateKey);
                  return (
                    <div key={i} style={{
                      width: '100%', aspectRatio: '1', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: isDelivery ? 700 : 400,
                      background: isDelivery ? 'var(--color-primary)' : 'transparent',
                      color: isDelivery ? '#FAF7F2' : 'var(--color-text)',
                      boxShadow: isDelivery ? '0 2px 6px rgba(46,74,46,0.25)' : 'none',
                      cursor: 'default',
                    }}>{day}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>🌸 Green = delivery day</p>
    </div>
  );
}

export default function Subscriptions() {
  const [schedule, setSchedule] = useState('monthly');
  const [nDays, setNDays] = useState(10);
  const [weekday, setWeekday] = useState(1); // Monday default
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [step, setStep] = useState("configure"); // "configure" or "address"
  const [address, setAddress] = useState({ name: '', flat: '', building: BUILDINGS[0], city: 'Hyderabad', pincode: PINCODES[0], phone: '' });
  const [timing, setTiming] = useState("6 am - 7:30 am");
  const setAddr = (k) => (e) => setAddress(p => ({ ...p, [k]: e.target.value }));
  
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Track if we already applied the preSelectedProduct from router state
  const appliedPreselect = useRef(false);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => {
        // Show all subscription-eligible products: pooja-basic, pooja-premium, fresh
        const subscriptionProducts = Array.isArray(data)
          ? data.filter(p => 
              p.category === 'pooja-basic' || 
              p.category === 'pooja-premium' || 
              p.category === 'fresh' ||
              p.price_per_unit
            )
          : [];
        setProducts(subscriptionProducts);

        // Check if a product was passed via router state (clicked Subscribe from product card)
        const preSelected = location.state?.preSelectedProduct;
        if (preSelected && !appliedPreselect.current) {
          appliedPreselect.current = true;
          // Find the matching product from backend list (for accurate price_per_unit)
          const match = subscriptionProducts.find(p => p.id === preSelected.id);
          setProduct(match || preSelected);
        } else if (!appliedPreselect.current && subscriptionProducts.length > 0) {
          setProduct(subscriptionProducts[0]);
        }
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoadingProducts(false);
      });
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.name) setAddress(p => ({ ...p, name: data.name }));
        if (data.phone) setAddress(p => ({ ...p, phone: data.phone }));
        if (data.address) {
          try {
            const parsed = JSON.parse(data.address);
            if (parsed && typeof parsed === 'object') {
              setAddress(p => ({
                ...p,
                flat: parsed.flat || '',
                building: parsed.building || BUILDINGS[0],
                pincode: parsed.pincode || PINCODES[0]
              }));
            }
          } catch (e) {
            // legacy address
          }
        }
      })
      .catch(() => {});
  }, [token]);

  const calculatePrice = () => {
    if (!product) return 0;
    const dailyRate = product.price_per_unit || product.our_price || 0;
    const plan = PLANS.find(p => p.id === schedule);
    if (schedule === 'n_days') return dailyRate * nDays;
    return dailyRate * (plan.deliveries ?? plan.days ?? 1);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceedToAddress = () => {
    if (!user || !token) { 
      navigate('/signin'); 
      return; 
    }
    setStep("address");
  };

  const handlePayment = async () => {
    // Validate address fields
    const requiredFields = ['name', 'flat', 'building', 'pincode', 'phone'];
    const fieldLabels = {
      name: 'Full Name',
      flat: 'Flat / Door No',
      building: 'Building Name',
      pincode: 'Pincode',
      phone: 'Phone Number'
    };
    for (const field of requiredFields) {
      if (!address[field] || !address[field].trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Field',
          text: `Please enter your ${fieldLabels[field]}. All address fields are required.`,
          confirmButtonColor: '#2E4A2E'
        });
        return;
      }
    }

    setLoading(true);
    const totalPrice = calculatePrice();
    const fullAddress = `${address.name}, ${address.flat}, ${address.building}, Hyderabad - ${address.pincode} (Tel: ${address.phone}, Time: ${timing})`;

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        Swal.fire({
          icon: 'error',
          title: 'Gateway Error',
          text: 'Failed to load payment gateway. Please try again.',
          confirmButtonColor: '#2E4A2E'
        });
        setLoading(false);
        return;
      }

      // Create order
      const res = await fetch(`${API}/payment/create-subscription-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          product_name: product.name,
          schedule,
          n_days: schedule === 'n_days' ? nDays : undefined,
          weekday: schedule === 'weekly' ? weekday : undefined,
          price_per_day: product.price_per_unit || product.our_price,
          total: totalPrice,
          address: fullAddress
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error);

      // Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Sowgandhika Flowers',
        description: `${product.name} - ${schedule === 'n_days' ? `${nDays} Days` : PLANS.find(p => p.id === schedule)?.label} Subscription`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API}/payment/verify-subscription`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                receipt: orderData.receipt,
                subscription_data: orderData.subscription_data
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error);

            Swal.fire({
              icon: 'success',
              title: 'Subscription Activated!',
              text: `✅ Subscription successfully activated: ${verifyData.subscription.id}`,
              confirmButtonColor: '#2E4A2E'
            }).then(() => {
              navigate('/my-subscriptions');
            });
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: 'Verification Failed',
              text: 'Payment verification failed: ' + err.message,
              confirmButtonColor: '#2E4A2E'
            });
          }
        },
        prefill: {
          name: user.name || user.email,
          email: user.email,
        },
        theme: {
          color: '#2E4A2E',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: 'Payment failed: ' + response.error.description,
          confirmButtonColor: '#2E4A2E'
        });
      });
      razorpay.open();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Subscription failed',
        confirmButtonColor: '#2E4A2E'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '4rem 1.5rem', minHeight: '80vh', textAlign: 'center' }}>
        <h2>Loading subscription products...</h2>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '4rem 1.5rem', minHeight: '80vh', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-primary)', marginBottom: '1rem' }}>No Subscription Products Available</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Please check back later or browse our regular products.</p>
        <button className="btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    );
  }

  const totalPrice = calculatePrice();

  return (
    <div className="subscriptions-container">
      <Helmet>
        <title>Flower Subscriptions | Sowgandhika Flowers</title>
        <meta name="description" content="Subscribe to daily, weekly or alternate-day fresh flower deliveries in Hyderabad. Perfect for morning Pooja rituals or bringing fresh blooms into your home." />
        <link rel="canonical" href="https://sowgandhikafreshflowers.com/subscriptions" />
      </Helmet>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="subscriptions-hero">
        <div className="hero-icon-container">
          <Flower2 size={32} color="var(--color-accent)" />
        </div>
        <h1 className="subscriptions-title">Subscriptions</h1>
        <p className="subscriptions-subtitle">Fresh flowers on your schedule. Pay with Razorpay.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="subscription-card">

        <AnimatePresence mode="wait">
          {step === "configure" ? (
            <motion.div key="configure" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              {/* Product Select */}
              <div style={{ marginBottom: '2.5rem' }}>
                <label className="subscription-label">Choose Your Flower</label>

                {/* Pre-selected product banner */}
                {location.state?.preSelectedProduct && product && product.id === location.state.preSelectedProduct.id && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(46,74,46,0.08), rgba(201,168,106,0.12))',
                    border: '1.5px solid var(--color-accent)',
                    borderRadius: '12px', padding: '0.85rem 1.1rem',
                    marginBottom: '1rem', fontSize: '0.95rem'
                  }}>
                    {product.img && (
                      <img src={product.img} alt={product.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'Playfair Display, serif' }}>
                        {product.name}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
                        ✅ Pre-selected · ₹{product.price_per_unit || product.our_price}/day
                      </div>
                    </div>
                  </div>
                )}

                <div className="select-wrapper">
                  <select value={product ? product.id : ''} onChange={e => setProduct(products.find(p => p.id === parseInt(e.target.value)))}
                    className="subscription-select">
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.price_per_unit || p.our_price}/day</option>
                    ))}
                  </select>
                  <div className="select-wrapper-arrow">▼</div>
                </div>
              </div>

              {/* Plans */}
              <p className="subscription-label" style={{ marginBottom: '1rem' }}>Choose Your Schedule</p>
              <div className="plans-grid">
                {PLANS.map(p => (
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} key={p.id} onClick={() => setSchedule(p.id)}
                    className={`plan-button ${schedule === p.id ? 'selected' : ''}`}>
                    <div className="plan-icon">{p.icon}</div>
                    <div className="plan-title">{p.label}</div>
                    <div className="plan-desc">{p.desc}</div>
                    {!p.custom && product && (
                      <div className="plan-price">
                        ₹{(product.price_per_unit || product.our_price || 0) * (p.deliveries ?? p.days)}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Weekly day picker */}
              {schedule === 'weekly' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', background: '#fff', border: '1px dashed rgba(201,168,106,0.5)', borderRadius: 14 }}>
                  <label className="subscription-label" style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Choose delivery day of the week</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {WEEKDAYS.map((d, i) => (
                      <button key={i} onClick={() => setWeekday(i)}
                        style={{
                          padding: '0.4rem 0.9rem', borderRadius: 100, border: '1.5px solid',
                          borderColor: weekday === i ? 'var(--color-primary)' : 'rgba(201,168,106,0.4)',
                          background: weekday === i ? 'var(--color-primary)' : '#fff',
                          color: weekday === i ? '#FAF7F2' : 'var(--color-primary)',
                          fontFamily: 'Lato, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                        }}>{d}</button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Delivery Calendar Preview */}
              <DeliveryCalendar dates={getDeliveryDates(schedule, weekday, nDays)} />

              {schedule === 'n_days' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="custom-days-wrapper">
                  <label className="subscription-label" style={{ marginBottom: '1rem' }}>How many days?</label>
                  <div className="custom-days-controls">
                    <button onClick={() => setNDays(Math.max(10, nDays - 1))} className="btn-counter">−</button>
                    <input type="number" min="10" max="90" value={nDays} onChange={e => setNDays(Math.min(90, Math.max(10, +e.target.value)))}
                      className="input-counter" />
                    <button onClick={() => setNDays(Math.min(90, nDays + 1))} className="btn-counter">+</button>
                  </div>
                  {product && (
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                      Total: ₹{product.price_per_unit || product.our_price} × {nDays} days = ₹{totalPrice}
                    </div>
                  )}
                </motion.div>
              )}

              <div style={{ borderTop: '1px dashed rgba(201,168,106,0.5)', paddingTop: '2.5rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--color-accent)' }}>{product?.name}</strong> ·{' '}
                    <strong>{
                      schedule === 'alternate' ? '15 deliveries over 30 days' :
                      schedule === 'weekly' ? `Every ${WEEKDAYS[weekday]}, 4 times this month` :
                      schedule === 'monthly' ? '30 daily deliveries for a month' :
                      `${nDays} daily deliveries`
                    }</strong>
                  </p>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '1rem' }}>
                    Total: ₹{totalPrice}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    ₹{product?.price_per_unit || product?.our_price} × {schedule === 'n_days' ? nDays : PLANS.find(p => p.id === schedule)?.deliveries} deliveries
                  </div>
                </div>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={handleProceedToAddress}
                  style={{ width: '100%', maxWidth: 360, padding: '1.1rem', fontSize: '1.1rem', borderRadius: '12px' }}>
                  {user ? 'Proceed to Delivery Address' : 'Login to Subscribe'}
                </motion.button>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Zap size={14} /> Secure payment · Cancel anytime
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="address" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <button onClick={() => setStep("configure")} className="back-config-btn">
                <ArrowLeft size={18} /> Back to Configuration
              </button>

              <h2 className="step-title">
                <MapPin size={24} color="var(--color-accent)" /> Delivery Address Details
              </h2>

              <div className="address-grid">
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input type="text" placeholder="Full Name" value={address.name} onChange={setAddr("name")} className="address-input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number *</label>
                  <input type="tel" placeholder="Phone Number" value={address.phone} onChange={setAddr("phone")} className="address-input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Flat / Door No *</label>
                  <input type="text" placeholder="Flat / Door No" value={address.flat} onChange={setAddr("flat")} className="address-input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Building Name *</label>
                  <select value={address.building} onChange={setAddr("building")} className="address-input" style={{ height: '46px', background: '#fff' }}>
                    {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Pincode *</label>
                  <select value={address.pincode} onChange={setAddr("pincode")} className="address-input" style={{ height: '46px', background: '#fff' }}>
                    {PINCODES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">City</label>
                  <input type="text" value="Hyderabad" readOnly className="address-input" />
                </div>
                <div className="input-group span-2">
                  <label className="input-label">Delivery Timing *</label>
                  <select value={timing} onChange={e => setTiming(e.target.value)} className="address-input" style={{ height: '46px', background: '#fff' }}>
                    <option value="6 am - 7:30 am">6 AM - 7:30 AM (Morning Delivery)</option>
                    <option value="6 pm - 9 pm">6 PM - 9 PM (Evening Delivery)</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed rgba(201,168,106,0.5)', paddingTop: '2.5rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    Total: ₹{totalPrice}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                    Free Delivery included. Secure payment via Razorpay.
                  </p>
                </div>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={handlePayment} disabled={loading}
                  style={{ width: '100%', maxWidth: 360, padding: '1.1rem', fontSize: '1.1rem', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Processing...' : 'Pay with Razorpay'}
                </motion.button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '1.25rem', color: '#27ae60', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} /> 100% Secure Payment
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
