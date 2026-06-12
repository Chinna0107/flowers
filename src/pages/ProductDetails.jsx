import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../store/cartStore.jsx";
import { useAuth } from "../store/authStore";
import { CATEGORIES } from "../data/products.js";
import { API } from "../config/api";
import { ChevronLeft, CheckCircle2, ShieldCheck, Clock, Truck } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading product:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <section className="section-pad" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading...</h2>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="section-pad" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ marginBottom: '2rem' }}>We couldn't find the flower arrangement you're looking for.</p>
        <button className="btn-primary" onClick={() => navigate('/products')}>Back to Products</button>
      </section>
    );
  }

  const category = CATEGORIES.find(c => c.key === product.category)?.label || "Flowers";
  const off = product.mrp && product.mrp > product.our_price ? Math.round((1 - product.our_price / product.mrp) * 100) : 0;

  const handleBuy = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.our_price,
      original: product.mrp || product.our_price,
      img: product.img,
      cat: product.category,
      desc: product.description,
      tag: product.tag
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="section-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>
      
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', marginBottom: '2rem', padding: 0 }}>
        <ChevronLeft size={18} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass" 
          style={{ padding: '1rem', borderRadius: '16px' }}
        >
          <div style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <img 
              src={product.img} 
              alt={product.name} 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            {product.tag && (
              <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--color-primary)', color: '#FAF7F2', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.tag}
              </span>
            )}
            {off > 0 && (
              <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#c0392b', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
                {off}% off
              </span>
            )}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
              {category}
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', margin: '0.5rem 0 1rem', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--color-primary)', fontSize: '2rem' }}>
                ₹{product.our_price}
              </span>
              {product.mrp && product.mrp > product.our_price && (
                <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.mrp}
                </span>
              )}
            </div>
            {product.price_per_unit && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                📅 Subscribe for ₹{product.price_per_unit}/day
              </p>
            )}
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', background: 'rgba(250,247,242,0.5)', border: '1px solid rgba(201,168,106,0.2)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
              <ShieldCheck size={20} color="var(--color-accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>100% Farm Fresh Guarantee</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
              <Clock size={20} color="var(--color-accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Handpicked every morning</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
              <Truck size={20} color="var(--color-accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Same-day delivery in Hyderabad</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className={`btn-primary ${added ? 'added' : ''}`} 
              onClick={handleBuy}
              style={{ 
                background: added ? '#27ae60' : 'var(--color-primary)', 
                borderColor: added ? '#27ae60' : 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' 
              }}
            >
              {added ? <><CheckCircle2 size={18} /> Added to Cart</> : "Add to Cart"}
            </button>
            <Link 
              to="/subscriptions" 
              className="btn-outline" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem' }}
            >
              🔁 Subscribe
            </Link>
          </div>

        </motion.div>
      </div>

    </section>
  );
}
