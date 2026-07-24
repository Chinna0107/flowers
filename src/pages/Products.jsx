import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCart } from "../store/cartStore.jsx";
import { useWishlist } from "../store/wishlistStore.jsx";
import { useAuth } from "../store/authStore";
import { CATEGORIES, getProductQuantity } from "../data/products.js";
import { API } from "../config/api";
import "./Products.css";

function ProductCard({ p }) {
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  
  const inWishlist = isInWishlist(p.id);

  const handleBuy = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    // Add multiple quantities
    for(let i=0; i<qty; i++) {
      addToCart({
        id: p.id,
        name: p.name,
        price: p.our_price,
        original: p.mrp || p.our_price,
        img: p.img,
        cat: p.category,
        desc: p.description,
        tag: p.tag,
        unitQuantity: p.quantity || getProductQuantity(p)
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const increaseQty = () => setQty(q => q + 1);
  const decreaseQty = () => setQty(q => q > 1 ? q - 1 : 1);

  return (
    <div className="pc-card">
      {/* ── LEFT: IMAGE AREA ── */}
      <div className="pc-img-area">
        <Link to={`/product/${p.id}`} className="pc-img-link">
          <img src={p.img} alt={p.name} className="pc-img" loading="lazy" />
        </Link>
        {p.tag && <span className="pc-tag-overlay">{p.tag}</span>}
        {p.mrp && p.mrp > p.our_price && (
          <span className="pc-discount-overlay">{Math.round((1 - p.our_price / p.mrp) * 100)}% OFF</span>
        )}
      </div>

      {/* ── RIGHT: CONTENT AREA ── */}
      <div className="pc-content-area">
        {/* Wishlist Heart */}
        <button 
          className="pc-wishlist-btn" 
          aria-label="Add to wishlist"
          onClick={() => toggleWishlist(p)}
          style={{ color: inWishlist ? 'var(--color-primary)' : 'inherit' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M20.8 4.6a5.5 5.5 0 00-7.7 0l-1.1 1-1.1-1a5.5 5.5 0 00-7.8 7.8l1 1 7.9 7.9 7.9-7.9 1-1a5.5 5.5 0 000-7.8z"></path></svg>
        </button>

        <span className="pc-cat-label">{CATEGORIES.find(c => c.key === p.category)?.label || p.category}</span>
        
        <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="pc-name">{p.name}</h3>
        </Link>

        {/* Badges */}
        <div className="pc-badges">
          <span className="pc-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Handpicked</span>
          {(p.category === 'pooja-basic' || p.category === 'pooja-premium') ? (
            <span className="pc-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg> Temple Grade</span>
          ) : (
            <span className="pc-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> Fresh & Pure</span>
          )}
        </div>

        {/* Price & Weight */}
        <div className="pc-price-wrap">
          <span className="pc-price">₹{Number(p.our_price).toFixed(2)}</span>
          {p.mrp && <span className="pc-original">₹{Number(p.mrp).toFixed(2)}</span>}
        </div>
        <div className="pc-weight">{p.quantity || getProductQuantity(p)}</div>

        {/* Actions Row */}
        <div className="pc-actions-row">
          <div className="pc-qty-selector">
            <button onClick={decreaseQty}>−</button>
            <span>{qty}</span>
            <button onClick={increaseQty}>+</button>
          </div>
          <button className={`pc-add-cart-btn ${added ? 'added' : ''}`} onClick={handleBuy} title="Add to Cart">
            {!added ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCat = params.get("cat") || "all";
  const [active, setActive] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filtered = (active === "all" ? products : products.filter(p => p.category === active))
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    });

  return (
    <div className="products-page">
      <Helmet>
        <title>Our Flower Collection | Sowgandhika Flowers</title>
        <meta name="description" content="Browse our collection of fresh flowers online in Hyderabad. Sells premium garlands, Pooja basic/premium items, bridal Poola Jada, and flower jewellery." />
        <link rel="canonical" href="https://sowgandhikafreshflowers.com/products" />
      </Helmet>

      {/* ── TOP HEADER SECTION ── */}
      <div className="prod-top-header">
        <h1 className="prod-top-title">Sowgandhika Fresh Flowers</h1>
        <div className="prod-top-subtitle-wrap">
          <span className="prod-top-line"></span>
          <p className="prod-top-subtitle">Freshness You Can Feel, Purity You Can Trust</p>
          <span className="prod-top-line"></span>
        </div>
      </div>

      {/* ── TOP HORIZONTAL CATEGORIES (CIRCLES) ── */}
      <div className="prod-top-cats-wrapper">
        <div className="prod-top-cats">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`prod-top-cat-item ${active === cat.key ? "active" : ""}`}
            >
              <div className="prod-top-cat-circle">
                <img src={cat.img} alt={cat.label} loading="lazy" />
              </div>
              <span className="prod-top-cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="products-inner">

        {/* ── SEARCH BAR ── */}
        <div className="prod-search-bar">
          <div className="prod-search-wrap">
            <span className="prod-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search flowers, garlands, jewellery..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="prod-search-input"
              id="product-search"
            />
            {searchQuery && (
              <button className="prod-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>

        {/* ── LAYOUT: SIDEBAR + PRODUCTS ── */}
        <div className="prod-layout">

          {/* ── LEFT SIDEBAR: CATEGORIES ── */}
          <aside className="prod-sidebar">
            <div className="prod-sidebar-header">
              <span className="section-tag-p">Browse</span>
              <h2 className="prod-section-title">Categories</h2>
            </div>
            <div className="prod-cat-list">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActive(cat.key)}
                  className={`prod-cat-item${active === cat.key ? " prod-cat-active" : ""}`}
                >
                  <div className="prod-cat-thumb">
                    <img src={cat.img} alt={cat.label} loading="lazy" />
                  </div>
                  <div className="prod-cat-text">
                    {cat.sub && <span className="prod-cat-sub">{cat.sub}</span>}
                    <span className="prod-cat-name">{cat.label}</span>
                  </div>
                  {active === cat.key && <span className="prod-cat-check-icon">✓</span>}
                </button>
              ))}
            </div>
          </aside>

          {/* ── RIGHT: PRODUCTS ── */}
          <div className="prod-main">
            {/* ── RESULTS HEADER ── */}
            <div className="prod-results-header">
              <p className="prod-results-count">
                {loading ? 'Loading...' : (
                  <>
                    Showing <strong>{filtered.length}</strong> product{filtered.length !== 1 ? "s" : ""}
                    {active !== "all" && <> in <em>{CATEGORIES.find(c => c.key === active)?.label}</em></>}
                    {searchQuery && <> matching "<em>{searchQuery}</em>"</>}
                  </>
                )}
              </p>
            </div>

            {/* ── PRODUCTS GRID ── */}
            {loading ? (
              <div className="prod-empty">
                <span className="prod-empty-icon">🌸</span>
                <h3>Loading products...</h3>
              </div>
            ) : filtered.length > 0 ? (
              <div className="prod-grid">
                {filtered.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="prod-empty">
                <span className="prod-empty-icon">🌸</span>
                <h3>Coming soon 🔜</h3>
                <p>Try adjusting your search or browse a different category.</p>
                <button className="btn-primary" onClick={() => { setSearchQuery(""); setActive("all"); }} style={{ marginTop: '1rem' }}>
                  View All Products
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── BOTTOM SUBSCRIBE BANNER ── */}
      <div className="prod-subscribe-banner">
        <div className="prod-sub-banner-content">
          <div className="prod-sub-banner-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <div className="prod-sub-banner-text">
            <h4>Subscribe & Save More!</h4>
            <p>Get exclusive discounts & regular updates</p>
          </div>
        </div>
        <button className="prod-sub-banner-btn" onClick={() => navigate("/subscriptions")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          SUBSCRIBE NOW
        </button>
      </div>

    </div>
  );
}
