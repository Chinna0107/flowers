import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../store/cartStore.jsx";
import { useAuth } from "../store/authStore";
import { CheckCircle2, MapPin, CreditCard, ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react";
import "./Checkout.css";
import { API } from "../config/api";


const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [address, setAddress] = useState({ name: '', flat: '', building: '', street: '', city: 'Hyderabad', pincode: '', phone: '' });
  const set = (k) => (e) => setAddress(p => ({ ...p, [k]: e.target.value }));

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.address) {
          setSavedAddress(data.address);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
        if (data.name) setAddress(p => ({ ...p, name: data.name }));
        if (data.phone) setAddress(p => ({ ...p, phone: data.phone }));
      })
      .catch(() => {});
  }, [token]);

  const handleConfirmOrder = async () => {
    if (!token) { navigate('/auth'); return; }
    setLoading(true);
    try {
      const cartPayload = cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, img: i.img }));
      const addrPayload = (!useNewAddress && savedAddress)
        ? { name: user?.name || '', address: savedAddress }
        : { ...address, name: address.name || user?.name || '' };

      if (paymentMethod === 'cod') {
        const res = await fetch(`${API}/payment/cod`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cart: cartPayload, address: addrPayload, total }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        clearCart();
        navigate('/confirmation', { state: { orderId: data.order_id } });
        return;
      }

      // Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Razorpay failed to load'); setLoading(false); return; }

      const orderRes = await fetch(`${API}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cart: cartPayload, address: addrPayload, total }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Sowgandhika Flowers',
        description: 'Fresh Flower Order',
        order_id: orderData.order_id,
        handler: async (response) => {
          const verifyRes = await fetch(`${API}/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...response, receipt: orderData.receipt }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            clearCart();
            navigate('/confirmation', { state: { orderId: orderData.receipt } });
          } else {
            alert('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#2E4A2E' },
        modal: { ondismiss: () => setLoading(false) },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      alert(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  if (cart.length === 0 && step === 1) {
    return (
      <section className="checkout-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="checkout-content" style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-primary)', marginBottom: '1rem' }}>Your cart is empty</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>Please add some fresh flowers before checking out.</p>
          <button className="btn-primary" onClick={() => navigate('/products')} style={{ width: '100%' }}>Browse Products</button>
        </div>
      </section>
    );
  }

  const steps = [
    { num: 1, label: "Review", icon: <CheckCircle2 size={16} /> },
    { num: 2, label: "Address", icon: <MapPin size={16} /> },
    { num: 3, label: "Payment", icon: <CreditCard size={16} /> }
  ];

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-progress">
        <div className="checkout-progress-bg" />
        <div className="checkout-progress-fill" style={{ width: `${((step - 1) / 2) * 80}%` }} />
        {steps.map(s => (
          <div key={s.num} className={`checkout-step ${step >= s.num ? 'active' : ''}`}>
            <div className="checkout-step-icon">{s.icon}</div>
            <span className="checkout-step-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="checkout-content">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}>

            {step === 1 && (
              <div>
                <h2 className="checkout-step-title">Order Summary</h2>
                {cart.map(item => (
                  <div key={item.id} className="checkout-item">
                    <img src={item.img} alt={item.name} className="checkout-item-img" />
                    <div className="checkout-item-details">
                      <h4 className="checkout-item-name">{item.name}</h4>
                      <p className="checkout-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <div className="checkout-item-price">₹{item.price * item.quantity}</div>
                  </div>
                ))}
                <div className="checkout-total"><span>Grand Total</span><span>₹{total}</span></div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="checkout-step-title">Shipping Address</h2>

                {savedAddress && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', border: `2px solid ${!useNewAddress ? 'var(--color-primary)' : '#e0d9d0'}`, borderRadius: '10px', cursor: 'pointer', marginBottom: '0.75rem', background: !useNewAddress ? 'rgba(46,74,46,0.05)' : 'transparent' }}>
                      <input type="radio" name="addr" checked={!useNewAddress} onChange={() => setUseNewAddress(false)} style={{ marginTop: '3px' }} />
                      <div>
                        <p style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-primary)' }}>Saved Address</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>{savedAddress}</p>
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: `2px solid ${useNewAddress ? 'var(--color-primary)' : '#e0d9d0'}`, borderRadius: '10px', cursor: 'pointer', background: useNewAddress ? 'rgba(46,74,46,0.05)' : 'transparent' }}>
                      <input type="radio" name="addr" checked={useNewAddress} onChange={() => setUseNewAddress(true)} />
                      <span style={{ fontWeight: 600 }}>Add another address</span>
                    </label>
                  </div>
                )}

                {(useNewAddress || !savedAddress) && (
                  <div className="checkout-form">
                    {[['name','Full Name','text'],['flat','Flat / Door No','text'],['building','Building Name','text'],['street','Street / Area','text'],['pincode','Pincode','text'],['phone','Phone Number','tel']].map(([k,l,t]) => (
                      <div key={k} className="checkout-input-group">
                        <label className="checkout-label">{l}</label>
                        <input type={t} placeholder={l} value={address[k]} onChange={set(k)} className="checkout-input" />
                      </div>
                    ))}
                    <div className="checkout-input-group">
                      <label className="checkout-label">City</label>
                      <input type="text" defaultValue="Hyderabad" readOnly className="checkout-input" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="checkout-step-title">Payment</h2>
                <div className="payment-methods">
                  {[['upi','UPI / Cards / NetBanking (Razorpay)'],['cod','Cash on Delivery']].map(([val, label]) => (
                    <label key={val} className={`payment-method ${paymentMethod === val ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <div className="payment-amount">
                  <p>Amount to Pay</p>
                  <h2>₹{total}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '1rem', color: '#27ae60', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} /> 100% Secure Transaction
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="checkout-actions">
        {step > 1 ? (
          <button className="btn-outline btn-checkout-nav" onClick={() => setStep(s => s - 1)}>
            <ChevronLeft size={18} /> Back
          </button>
        ) : <div />}

        {step < 3 ? (
          <button className="btn-primary btn-checkout-nav" onClick={() => setStep(s => s + 1)}>
            Next Step <ChevronRight size={18} />
          </button>
        ) : (
          <button className="btn-primary btn-checkout-nav" onClick={handleConfirmOrder} disabled={loading}
            style={{ background: '#27ae60', borderColor: '#27ae60', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : <><CheckCircle2 size={18} /> {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total}`}</>}
          </button>
        )}
      </div>
    </div>
  );
}

