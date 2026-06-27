import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useCart } from "../store/cartStore.jsx";
import { useAuth } from "../store/authStore";
import { CATEGORIES } from "../data/products.js";
import { API } from "../config/api";
import "./Home.css";

function PopularCard({ p }) {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const isPooja = p.category === 'pooja-basic' || p.category === 'pooja-premium';
  const isFresh = p.category === 'fresh';
  const isStringOnly = p.category === 'flower-strings';
  const showBuyOnce = !isPooja;
  const showSubscribe = (isPooja || isFresh) && !isStringOnly;
  
  const handleBuy = () => {
    if (!user) { navigate('/signin'); return; }
    addToCart({
      id: p.id,
      name: p.name,
      price: p.our_price,
      original: p.mrp || p.our_price,
      img: p.img,
      cat: p.category,
      desc: p.description,
      tag: p.tag,
      unitQuantity: p.quantity || ''
    });
    setAdded(true); 
    setTimeout(() => setAdded(false), 1600); 
  };
  
  const off = p.mrp && p.mrp > p.our_price ? Math.round((1 - p.our_price / p.mrp) * 100) : 0;
  
  return (
    <div className="product-card">
      <div className="product-mobile-row">
        <Link to={`/product/${p.id}`} className="product-img-wrap" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <img src={p.img} alt={p.name} className="product-img" loading="lazy" />
          {p.tag && <span className="product-tag">{p.tag}</span>}
          {off > 0 && <span className="pc-discount">{off}% off</span>}
        </Link>
        <div className="product-info">
          <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="product-name">{p.name}</h3>
          </Link>
          <div className="product-price-row">
            <span className="product-price">
              ₹{p.our_price}
              {p.quantity && (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 'normal', marginLeft: '4px' }}>
                  / {p.quantity}
                </span>
              )}
            </span>
            {p.mrp && <span className="product-original">₹{p.mrp}</span>}
          </div>
        </div>
      </div>
      <div className={`product-actions${(!showBuyOnce || !showSubscribe) ? ' single-action' : ''}`}
           style={(!showBuyOnce || !showSubscribe) ? { display: 'block' } : {}}>
        {showBuyOnce && (
          <button
            className={`pa-buy${added ? ' pa-added' : ''}`}
            onClick={handleBuy}
            style={!showSubscribe ? { width: '100%' } : {}}
          >
            {added ? '✓ Added' : 'Buy Once'}
          </button>
        )}
        {showSubscribe && (
          <button
            className="pa-sub"
            onClick={() => navigate('/subscriptions', { state: { preSelectedProduct: p } })}
            style={{
              width: !showBuyOnce ? '100%' : 'auto',
              ...(!showBuyOnce ? { background: 'var(--color-primary)', color: '#FAF7F2', borderColor: 'var(--color-primary)' } : {})
            }}
          >
            🔁 Subscribe
          </button>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  // Get popular and bestsellers from fetched products
  const popular = products.filter(p => ['Best Seller', 'Premium', 'Popular', 'Bridal'].includes(p.tag)).slice(0, 4);
  const bestsellers = products.filter(p => ['Best Seller', 'Value', 'Fresh', 'Trending'].includes(p.tag)).slice(0, 6);

  return (
    <div>
      <Helmet>
        <title>Sowgandhika Flowers | Fresh Flower Delivery & Subscriptions in Hyderabad</title>
        <meta name="description" content="Order fresh flowers online in Hyderabad. Sowgandhika Flowers offers daily Pooja flowers, traditional garlands, bridal hair flowers, and customized subscriptions." />
        <link rel="canonical" href="https://sowgandhikafreshflowers.com/" />
      </Helmet>

      {/* ── HERO BANNER ── */}
      <div className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content">
          {/* <h1 className="hero-title">Sowgandhika</h1> */}
          {/* <p className="hero-sub">Fresh Daily · Est. 2026</p> */}
          <div className="hero-ctas">
            {/* <Link to="/products" className="btn-primary hero-btn">Shop Now</Link> */}
            {/* <Link to="/subscriptions" className="btn-outline hero-btn hero-btn-outline">Subscribe</Link> */}
          </div>
        </div>
      </div>

      {/* ── IMAGE STRIP ── */}
      <section className="section-pad home-image-strip-section">
        <div className="section-header">
          <span className="section-tag">Featured</span>
          <h2 className="section-title">See Our Freshest Arrangements</h2>
          <p className="section-sub">Handpicked blooms, captured in real moments.</p>
        </div>
        <div className="home-image-strip">
          <div className="home-image-card">
            <img src="https://res.cloudinary.com/dwgqfg2xc/image/upload/v1782584507/WhatsApp_Image_2026-06-27_at_09.33.56_umdbmp.jpg" alt="Fresh roses" />
            <div className="home-image-caption">Premium rose bouquets for special moments</div>
          </div>
          <div className="home-image-card">
            <img src="https://res.cloudinary.com/dwgqfg2xc/image/upload/v1782584771/WhatsApp_Image_2026-06-17_at_22.59.33_a644rs.jpg" alt="Flower garlands" />
            <div className="home-image-caption">Fresh Flower Strings for Decor</div>
          </div>
          <div className="home-image-card">
            <img src="https://res.cloudinary.com/dwgqfg2xc/image/upload/v1782584626/WhatsApp_Image_2026-06-27_at_09.42.10_eixvv6.jpg" alt="Bridal flower hair" />
            <div className="home-image-caption">Traditional garlands for pooja and ceremony</div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section-pad">
        <div className="section-header">
          <span className="section-tag">Browse</span>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-sub">From daily pooja to bridal — we have it all</p>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.key} to={`/products?cat=${cat.key}`} className="cat-card">
              <div className="cat-img-wrap">
                <img src={cat.img} alt={cat.label} className="cat-img" loading="lazy" />
                <div className="cat-img-overlay" />
              </div>
              <div className="cat-info">
                {cat.sub && <p className="cat-sub">{cat.sub}</p>}
                <p className="cat-name">{cat.label}</p>
                <p className="cat-arrow">Explore →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── POPULAR PRODUCTS ── */}
      {!loading && popular.length > 0 && (
        <section className="section-alt">
          <div className="section-header">
            <span className="section-tag">Trending</span>
            <h2 className="section-title">Popular Products</h2>
            <p className="section-sub">Loved by customers across Hyderabad</p>
          </div>
          <div className="products-grid">
            {popular.map(p => <PopularCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* ── BEST SELLERS ── */}
      {!loading && bestsellers.length > 0 && (
        <section className="section-pad">
          <div className="section-header">
            <span className="section-tag">Top Picks</span>
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-sub">Our most ordered blooms this season</p>
          </div>
          <div className="products-grid">
            {bestsellers.map(p => <PopularCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

    </div>
  );
}
