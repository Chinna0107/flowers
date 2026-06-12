import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../store/cartStore.jsx";
import { CATEGORIES } from "../data/products.js";
import "./Cart.css";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const shipping = subtotal > 0 && subtotal < 1000 ? 50 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + shipping + tax;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
          <h1 className="cart-title">Your Cart</h1>
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
                        <p className="cart-item-price">₹{item.price}</p>
                        <div className="cart-item-total">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                    
                    <div className="cart-item-actions" data-total={`₹${item.price * item.quantity}`}>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="btn-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                        <Trash2 size={16} /> <span className="btn-remove-text">Remove</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* SUMMARY BOX */}
          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="summary-val">₹{subtotal}</span>
            </div>
            
            <div className="summary-row">
              <span>Estimated Tax (5%)</span>
              <span className="summary-val">₹{tax}</span>
            </div>
            
            <div className="summary-row">
              <span>Delivery</span>
              {shipping === 0 ? (
                <span className="summary-val free">Free</span>
              ) : (
                <span className="summary-val">₹{shipping}</span>
              )}
            </div>
            
            {shipping > 0 && (
              <p style={{ fontSize: '0.8rem', color: '#e67e22', marginTop: '-0.5rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                Add ₹{1000 - subtotal} more for free delivery!
              </p>
            )}

            <div className="summary-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button className="btn-checkout" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <p style={{ margin: '0 0 0.5rem' }}>🔒 Secure Checkout</p>
              <p style={{ margin: 0 }}>100% freshness guaranteed.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
