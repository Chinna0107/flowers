import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../store/authStore";
import { API } from "../config/api";
import { Calendar, Repeat, Flower2, Zap, ArrowLeft, ShieldCheck, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import "./Subscriptions.css";


const PLANS = [
  { id: 'monthly', label: 'Monthly', icon: <Calendar size={24} />, desc: 'Delivery every 30 days', days: 30 },
  { id: 'weekly', label: 'Weekly', icon: <Flower2 size={24} />, desc: 'Delivery every 7 days', days: 7 },
  { id: 'alternate', label: 'Alternate Days', icon: <Zap size={24} />, desc: 'Delivery every 2 days for 30 days', days: 30, interval: 2 },
  { id: 'n_days', label: 'Custom N Days', icon: <Repeat size={24} />, desc: 'Choose how many days you want', custom: true },
];

export default function Subscriptions() {
  const [schedule, setSchedule] = useState('monthly');
  const [nDays, setNDays] = useState(10);
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [step, setStep] = useState("configure"); // "configure" or "address"
  const [address, setAddress] = useState({ name: '', flat: '', building: '', street: '', city: 'Hyderabad', pincode: '', phone: '' });
  const setAddr = (k) => (e) => setAddress(p => ({ ...p, [k]: e.target.value }));
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => {
        const subscriptionProducts = Array.isArray(data) ? data.filter(p => p.price_per_unit) : [];
        setProducts(subscriptionProducts);
        if (subscriptionProducts.length > 0) {
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
          // Pre-populate street field if profile has saved address
          setAddress(p => ({ ...p, street: data.address }));
        }
      })
      .catch(() => {});
  }, [token]);

  const calculatePrice = () => {
    if (!product || !product.price_per_unit) return 0;
    const selectedPlan = PLANS.find(p => p.id === schedule);
    if (schedule === 'n_days') {
      return product.price_per_unit * nDays;
    }
    return product.price_per_unit * selectedPlan.days;
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
    const requiredFields = ['name', 'flat', 'building', 'street', 'pincode', 'phone'];
    const fieldLabels = {
      name: 'Full Name',
      flat: 'Flat / Door No',
      building: 'Building Name',
      street: 'Street / Area Name',
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
    const fullAddress = `${address.name}, ${address.flat}, ${address.building}, ${address.street}, Hyderabad - ${address.pincode} (Tel: ${address.phone})`;

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
          price_per_day: product.price_per_unit,
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
                <div className="select-wrapper">
                  <select value={product ? product.id : ''} onChange={e => setProduct(products.find(p => p.id === parseInt(e.target.value)))}
                    className="subscription-select">
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.price_per_unit}/day</option>
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
                        ₹{product.price_per_unit * p.days}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {schedule === 'n_days' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="custom-days-wrapper">
                  <label className="subscription-label" style={{ marginBottom: '1rem' }}>How many days?</label>
                  <div className="custom-days-controls">
                    <button onClick={() => setNDays(Math.max(1, nDays - 1))} className="btn-counter">−</button>
                    <input type="number" min="1" max="90" value={nDays} onChange={e => setNDays(Math.min(90, Math.max(1, +e.target.value)))}
                      className="input-counter" />
                    <button onClick={() => setNDays(Math.min(90, nDays + 1))} className="btn-counter">+</button>
                  </div>
                  {product && (
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                      Total: ₹{product.price_per_unit} × {nDays} days = ₹{totalPrice}
                    </div>
                  )}
                </motion.div>
              )}

              <div style={{ borderTop: '1px dashed rgba(201,168,106,0.5)', paddingTop: '2.5rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--color-accent)' }}>{product?.name}</strong> delivered{' '}
                    <strong>{
                      schedule === 'alternate' ? 'every 2 days for 30 days' : 
                      schedule === 'weekly' ? 'every 7 days' : 
                      schedule === 'monthly' ? 'every 30 days' : 
                      `daily for ${nDays} days`
                    }</strong>
                  </p>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '1rem' }}>
                    Total: ₹{totalPrice}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    ₹{product?.price_per_unit}/day × {schedule === 'n_days' ? nDays : PLANS.find(p => p.id === schedule)?.days} days
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
                {[
                  ['name', 'Full Name', 'text'],
                  ['flat', 'Flat / Door No', 'text'],
                  ['building', 'Building Name', 'text'],
                  ['street', 'Street / Area Name', 'text'],
                  ['pincode', 'Pincode', 'text'],
                  ['phone', 'Phone Number', 'tel']
                ].map(([k, l, t]) => (
                  <div key={k} className={`input-group ${k === 'street' ? 'span-2' : ''}`}>
                    <label className="input-label">{l} *</label>
                    <input 
                      type={t} 
                      placeholder={l} 
                      value={address[k]} 
                      onChange={setAddr(k)} 
                      className="address-input" 
                    />
                  </div>
                ))}
                <div className="input-group">
                  <label className="input-label">City</label>
                  <input type="text" value="Hyderabad" readOnly className="address-input" />
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
