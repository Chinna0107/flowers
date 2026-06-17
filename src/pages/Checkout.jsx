import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../store/cartStore.jsx";
import { useAuth } from "../store/authStore";
import { CheckCircle2, MapPin, CreditCard, ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react";
import "./Checkout.css";
import { API } from "../config/api";
import Swal from "sweetalert2";
import { BUILDINGS, PINCODES } from "../data/addressOptions.js";

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

const displayAddress = (addrStr) => {
  if (!addrStr) return "";
  try {
    const parsed = typeof addrStr === 'string' ? JSON.parse(addrStr) : addrStr;
    if (parsed && typeof parsed === 'object') {
      return `${parsed.flat || ''}, ${parsed.building || ''}, Hyderabad - ${parsed.pincode || ''}`;
    }
  } catch (e) {
    // not JSON
  }
  return addrStr;
};

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [address, setAddress] = useState({ name: '', flat: '', building: BUILDINGS[0], city: 'Hyderabad', pincode: PINCODES[0], phone: '' });
  const [timing, setTiming] = useState("6 am - 7:30 am");
  const [customTiming, setCustomTiming] = useState("");
  const set = (k) => (e) => setAddress(p => ({ ...p, [k]: e.target.value }));

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const total = useMemo(() => subtotal + tax - discount, [subtotal, tax, discount]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
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
              setSavedAddress(`${parsed.flat || ''}, ${parsed.building || ''}, Hyderabad - ${parsed.pincode || ''}`);
            } else {
              setSavedAddress(data.address);
            }
          } catch (e) {
            setSavedAddress(data.address);
          }
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
        if (data.name) setAddress(p => ({ ...p, name: data.name }));
        if (data.phone) setAddress(p => ({ ...p, phone: data.phone }));
      })
      .catch(() => {});
  }, [token]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch(`${API}/coupons/apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: couponCode, cart })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Failed to apply coupon');
        setDiscount(0);
        setCouponApplied(false);
        Swal.fire({
          icon: 'error',
          title: 'Coupon Error',
          text: data.error || 'Failed to apply coupon',
          confirmButtonColor: '#2E4A2E'
        });
      } else {
        setDiscount(parseFloat(data.discount));
        setCouponApplied(true);
        setCouponError("");
        Swal.fire({
          icon: 'success',
          title: 'Coupon Applied!',
          text: `You saved ₹${data.discount} on eligible products.`,
          confirmButtonColor: '#2E4A2E'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to connect to the server.',
        confirmButtonColor: '#2E4A2E'
      });
    }
  };

  const handleConfirmOrder = async () => {
    if (!token) { navigate('/auth'); return; }
    setLoading(true);
    try {
      const cartPayload = cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        img: i.img,
        unitQuantity: i.unitQuantity
      }));
      const selectedTiming = timing === 'custom' ? `Custom: ${customTiming}` : timing;
      const addrPayload = (!useNewAddress && savedAddress)
        ? { name: user?.name || '', address: displayAddress(savedAddress), phone: address.phone, timing: selectedTiming }
        : { ...address, name: address.name || user?.name || '', timing: selectedTiming };

      if (paymentMethod === 'cod') {
        const res = await fetch(`${API}/payment/cod`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cart: cartPayload, address: addrPayload, total: subtotal + tax, coupon_code: couponApplied ? couponCode : undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        clearCart();
        navigate('/confirmation', { state: { orderId: data.order_id } });
        return;
      }

      // Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Razorpay failed to load', confirmButtonColor: '#2E4A2E' });
        setLoading(false);
        return;
      }

      const orderRes = await fetch(`${API}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cart: cartPayload, address: addrPayload, total: subtotal + tax, coupon_code: couponApplied ? couponCode : undefined }),
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
            Swal.fire({
              icon: 'error',
              title: 'Verification Failed',
              text: 'Payment verification failed. Contact support.',
              confirmButtonColor: '#2E4A2E'
            });
          }
        },
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#2E4A2E' },
        modal: { ondismiss: () => setLoading(false) },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: err.message || 'Payment failed',
        confirmButtonColor: '#2E4A2E'
      });
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (useNewAddress || !savedAddress) {
        // Validate that all fields in address are filled
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
      }
      // Validate timing
      if (timing === 'custom' && (!customTiming || !customTiming.trim())) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Delivery Timing',
          text: 'Please specify your custom delivery timing.',
          confirmButtonColor: '#2E4A2E'
        });
        return;
      }
    }
    setStep(s => s + 1);
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
                
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value)} 
                    disabled={couponApplied}
                    style={{ 
                      padding: '0.65rem 1rem', 
                      border: '1px solid rgba(201,168,106,0.5)', 
                      borderRadius: '8px', 
                      outline: 'none', 
                      flex: 1,
                      textTransform: 'uppercase'
                    }} 
                  />
                  {couponApplied ? (
                    <button 
                      onClick={() => { setCouponApplied(false); setDiscount(0); setCouponCode(""); }} 
                      className="btn-outline" 
                      style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #dc2626', color: '#dc2626' }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyCoupon} 
                      className="btn-primary" 
                      style={{ padding: '0.65rem 1.25rem', borderRadius: '8px' }}
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.4rem', margin: 0 }}>{couponError}</p>}
                
                <div style={{ marginTop: '1.5rem', borderTop: '1px dashed rgba(201,168,106,0.3)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    <span>Tax (5%)</span>
                    <span>₹{tax}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#27ae60', fontSize: '0.95rem', fontWeight: 600 }}>
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="checkout-total"><span>Grand Total</span><span>₹{total}</span></div>
                </div>
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
                    <div className="checkout-input-group">
                      <label className="checkout-label">Full Name</label>
                      <input type="text" placeholder="Full Name" value={address.name} onChange={set("name")} className="checkout-input" />
                    </div>
                    <div className="checkout-input-group">
                      <label className="checkout-label">Phone Number</label>
                      <input type="tel" placeholder="Phone Number" value={address.phone} onChange={set("phone")} className="checkout-input" />
                    </div>
                    <div className="checkout-input-group">
                      <label className="checkout-label">Flat / Door No</label>
                      <input type="text" placeholder="Flat / Door No" value={address.flat} onChange={set("flat")} className="checkout-input" />
                    </div>
                    <div className="checkout-input-group">
                      <label className="checkout-label">Building Name</label>
                      <select value={address.building} onChange={set("building")} className="checkout-input" style={{ height: '46px', background: '#fff' }}>
                        {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="checkout-input-group">
                      <label className="checkout-label">Pincode</label>
                      <select value={address.pincode} onChange={set("pincode")} className="checkout-input" style={{ height: '46px', background: '#fff' }}>
                        {PINCODES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="checkout-input-group">
                      <label className="checkout-label">City</label>
                      <input type="text" value="Hyderabad" readOnly className="checkout-input" />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '2rem', borderTop: '1px dashed rgba(201,168,106,0.3)', paddingTop: '1.5rem' }}>
                  <h3 className="checkout-step-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Delivery Timing</h3>
                  <div className="checkout-input-group">
                    <label className="checkout-label">Choose Delivery Timing</label>
                    <select value={timing} onChange={e => setTiming(e.target.value)} className="checkout-input" style={{ height: '46px', background: '#fff' }}>
                      <option value="6 am - 7:30 am">6 AM - 7:30 AM (Morning Delivery)</option>
                      <option value="6 pm - 9 pm">6 PM - 9 PM (Evening Delivery)</option>
                      <option value="custom">Custom Timing</option>
                    </select>
                  </div>
                  {timing === 'custom' && (
                    <div className="checkout-input-group" style={{ marginTop: '1rem' }}>
                      <label className="checkout-label">Specify Custom Delivery Timing</label>
                      <input type="text" placeholder="e.g. 10:00 AM, 3:00 PM" value={customTiming} onChange={e => setCustomTiming(e.target.value)} className="checkout-input" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="checkout-step-title">Payment</h2>
                <div className="payment-methods">
                  {[['upi','UPI / Cards / NetBanking (Razorpay)']].map(([val, label]) => (
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
          <button className="btn-primary btn-checkout-nav" onClick={handleNextStep}>
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
