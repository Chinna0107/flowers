import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight, Leaf, ShieldCheck, Tag, Gift, ChevronRight, Flower2 } from "lucide-react";
import { useCart } from "../store/cartStore.jsx";
import { CATEGORIES } from "../data/products.js";
import "./Cart.css";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, discount, coupon, applyCoupon } = useCart();
  const navigate = useNavigate();

  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const shipping = 0; 
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // If subtotal is lower than discount, total is 0.
  const total = Math.max(subtotal + (shipping === 0 ? 0 : shipping) - discount, 0);

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    
    // Mock valid coupons
    if (code === "WELCOME10") {
      const discountAmount = Math.round(subtotal * 0.1); // 10% off
      applyCoupon(code, discountAmount);
      setShowCouponInput(false);
    } else if (code === "FRESH50") {
      applyCoupon(code, 50); // ₹50 off
      setShowCouponInput(false);
    } else {
      setCouponError("Invalid coupon code.");
    }
  };

  const handleWhatsAppOrder = () => {
    const WHATSAPP_NUMBER = "918374365897";
    const itemsText = cart.map(item => `• ${item.quantity}x ${item.name} (₹${item.price * item.quantity})`).join('\n');
    const lines = [
      "🌸 *New Order Request — Sowgandhika Flowers*",
      "",
      "*Cart Items:*",
      itemsText,
      "",
      `*Subtotal:* ₹${subtotal}`,
      `*Delivery:* ${shipping === 0 ? 'Free' : '₹' + shipping}`,
      `*Total:* ₹${total}`,
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="cart-empty-icon"
          >
            <ShoppingBag size={40} />
          </motion.div>
          <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            Your Cart is Empty
          </motion.h2>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            Looks like you haven't added any fresh blooms to your cart yet.
          </motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              Explore Flowers <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        
        <div className="cart-header">
          <div className="cart-title-row">
            <h1 className="cart-title">Your Cart <Leaf size={24} style={{ color: 'var(--color-accent)', marginLeft: '8px' }} /></h1>
            <div className="cart-guarantee-badge">
              <ShieldCheck size={16} /> 100% Freshness<br/>Guaranteed
            </div>
          </div>
          <p className="cart-count-sub">You have {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart.</p>
        </div>

        <div className="cart-layout">
          
          {/* ITEMS LIST */}
          <div className="cart-items-section">
            <div className="cart-items-list">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="cart-item"
                  >
                    <div className="cart-item-top">
                      <img src={item.img} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-details">
                        <div className="cart-item-cat">{CATEGORIES.find(c => c.key === item.cat)?.label || "Product"}</div>
                        <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                          <h2 className="cart-item-name">{item.name}</h2>
                        </Link>
                        <p className="cart-item-price">
                          ₹{item.price}
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 'normal', marginLeft: '4px' }}>
                            / {item.unitQuantity || "100g"}
                          </span>
                        </p>
                        
                        <div className="cart-item-tags">
                          <span className="cart-tag"><Leaf size={12}/> Handpicked</span>
                          <span className="cart-tag"><Flower2 size={12}/> Fresh & Pure</span>
                          <span className="cart-tag"><ShieldCheck size={12}/> Premium Quality</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cart-item-actions">
                      <div className="cart-item-total">
                        ₹{item.price * item.quantity}
                      </div>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="btn-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* SUMMARY BOX */}
          <div className="cart-summary">
            <div className="summary-header">
              <h3 className="summary-title">Order Summary</h3>
              {!showCouponInput && !coupon && (
                <button className="btn-coupon" onClick={() => setShowCouponInput(true)}>
                  <Tag size={14}/> Apply Coupon
                </button>
              )}
            </div>
            
            {showCouponInput && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Enter Code (e.g. WELCOME10)" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', textTransform: 'uppercase' }}
                  />
                  <button onClick={handleApplyCoupon} style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Apply</button>
                </div>
                {couponError && <span style={{ color: 'red', fontSize: '0.8rem' }}>{couponError}</span>}
              </div>
            )}

            {coupon && (
              <div style={{ marginBottom: '1.5rem', background: '#eaf4e6', padding: '0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#27ae60', fontWeight: 'bold' }}><Tag size={12}/> {coupon} Applied</span>
                <button onClick={() => applyCoupon("", 0)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
              </div>
            )}
            
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-val">₹{subtotal}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Delivery {shipping === 0 && <span className="free-badge">Free</span>}</span>
              <span className="summary-val">{shipping === 0 ? '₹0' : `₹${shipping}`}</span>
            </div>

            {discount > 0 && (
              <div className="summary-row" style={{ color: '#27ae60' }}>
                <span className="summary-label">Discount ({coupon})</span>
                <span className="summary-val">-₹{discount}</span>
              </div>
            )}
            
            <hr className="summary-divider" />

            <div className="summary-total">
              <span className="total-label">Total</span>
              <span className="total-val">₹{total}</span>
            </div>

            <div className="secure-checkout-box">
              <p className="secure-title"><ShieldCheck size={16}/> Secure Checkout</p>
              <p className="secure-sub">100% freshness guaranteed.</p>
            </div>
          </div>

          {shipping > 0 && (
            <div className="promo-banner">
              <div className="promo-icon"><Gift size={24} /></div>
              <div className="promo-text">
                Add flowers worth ₹160 more to get<br/>
                <strong>FREE DELIVERY</strong>
              </div>
              <ChevronRight size={20} className="promo-arrow" />
            </div>
          )}

          <div className="cart-checkout-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-checkout" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>

              <button 
                className="btn-checkout" 
                style={{ 
                  backgroundColor: '#25D366', 
                  borderColor: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onClick={handleWhatsAppOrder}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order via WhatsApp
              </button>
            </div>

        </div>
      </div>
    </div>
  );
}
