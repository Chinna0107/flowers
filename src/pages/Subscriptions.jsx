import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../store/authStore";
import { API } from "../config/api";
import { Calendar, Repeat, Flower2, Zap } from "lucide-react";

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

  const handleContinue = async () => {
    if (!user || !token) { 
      navigate('/signin'); 
      return; 
    }

    setLoading(true);
    const totalPrice = calculatePrice();

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
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
          total: totalPrice
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

            alert(`✅ Payment successful! Subscription activated: ${verifyData.subscription.id}`);
            navigate('/my-subscriptions');
          } catch (err) {
            alert('Payment verification failed: ' + err.message);
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
        alert('Payment failed: ' + response.error.description);
      });
      razorpay.open();
    } catch (err) {
      alert(err.message || 'Subscription failed');
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
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '4rem 1.5rem', minHeight: '80vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed var(--color-accent)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
          <Flower2 size={32} color="var(--color-accent)" />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-primary)', fontSize: '3rem', marginBottom: '0.5rem' }}>Subscriptions</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', fontStyle: 'italic' }}>Fresh flowers on your schedule. Pay with Razorpay.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(201,168,106,0.3)', borderRadius: '24px', padding: '3rem', boxShadow: '0 16px 40px rgba(46,74,46,0.06)' }}>

        {/* Product Select */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>Choose Your Flower</label>
          <div style={{ position: 'relative' }}>
            <select value={product ? product.id : ''} onChange={e => setProduct(products.find(p => p.id === parseInt(e.target.value)))}
              style={{ width: '100%', padding: '1rem 1.5rem', border: '1px solid rgba(201,168,106,0.5)', borderRadius: '12px', fontFamily: 'Lato, sans-serif', fontSize: '1.1rem', backgroundColor: '#fff', color: 'var(--color-text)', cursor: 'pointer', outline: 'none', appearance: 'none' }}>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - ₹{p.price_per_unit}/day</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-accent)' }}>▼</div>
          </div>
        </div>

        {/* Plans */}
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '1rem' }}>Choose Your Schedule</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {PLANS.map(p => (
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} key={p.id} onClick={() => setSchedule(p.id)}
              style={{ padding: '1.5rem 1rem', border: `2px solid ${schedule === p.id ? 'var(--color-primary)' : 'rgba(201,168,106,0.3)'}`, borderRadius: '16px', cursor: 'pointer', textAlign: 'center', backgroundColor: schedule === p.id ? 'var(--color-primary)' : '#fff', color: schedule === p.id ? '#FAF7F2' : 'var(--color-primary)', transition: 'all 0.3s', boxShadow: schedule === p.id ? '0 8px 24px rgba(46,74,46,0.2)' : 'none' }}>
              <div style={{ marginBottom: '1rem', color: schedule === p.id ? 'var(--color-accent)' : 'var(--color-primary)' }}>{p.icon}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.label}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.4 }}>{p.desc}</div>
              {!p.custom && product && (
                <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>
                  ₹{product.price_per_unit * p.days}
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {schedule === 'n_days' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginBottom: '2rem', padding: '2rem', backgroundColor: '#fff', border: '1px dashed var(--color-accent)', borderRadius: '16px', textAlign: 'center' }}>
            <label style={{ display: 'block', fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: 600 }}>How many days?</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <button onClick={() => setNDays(Math.max(1, nDays - 1))} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--color-accent)', background: '#fff', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <input type="number" min="1" max="90" value={nDays} onChange={e => setNDays(Math.min(90, Math.max(1, +e.target.value)))}
                style={{ width: 90, padding: '0.75rem', textAlign: 'center', border: '2px solid var(--color-primary)', borderRadius: '12px', fontFamily: 'Lato, sans-serif', fontSize: '1.5rem', fontWeight: 700, outline: 'none' }} />
              <button onClick={() => setNDays(Math.min(90, nDays + 1))} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--color-accent)', background: '#fff', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
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
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={handleContinue} disabled={loading}
            style={{ width: '100%', maxWidth: 360, padding: '1.1rem', fontSize: '1.1rem', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : user ? 'Pay with Razorpay' : 'Login to Subscribe'}
          </motion.button>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Zap size={14} /> Secure payment · Cancel anytime
          </p>
        </div>
      </motion.div>
    </div>
  );
}
