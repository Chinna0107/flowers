import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCart } from "../store/cartStore.jsx";
import { useAuth } from "../store/authStore";
import { CATEGORIES } from "../data/products.js";
import "./Products.css";

const API = 'http://localhost:5000/api';

function ProductCard({ p }) {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleBuy = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    addToCart({
      id: p.id,
      name: p.name,
      price: p.our_price,
      original: p.mrp || p.our_price,
      img: p.img,
      cat: p.category,
      desc: p.description,
      tag: p.tag
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="pc-card">
      <div className="pc-mobile-row">
        <Link to={`/product/${p.id}`} className="pc-img-wrap" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <img src={p.img} alt={p.name} className="pc-img" loading="lazy" />
          <span className="pc-tag">{p.tag}</span>
          {p.mrp && p.mrp > p.our_price && (
            <span className="pc-discount">{Math.round((1 - p.our_price / p.mrp) * 100)}% off</span>
          )}
        </Link>
        <div className="pc-body">
          <span className="pc-cat-label">{CATEGORIES.find(c => c.key === p.category)?.label || p.category}</span>
          <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="pc-name">{p.name}</h3>
          </Link>
          <p className="pc-desc">{p.description}</p>
          <div className="pc-price-row">
            <span className="pc-price">₹{p.our_price}</span>
            {p.mrp && <span className="pc-original">₹{p.mrp}</span>}
          </div>
        </div>
      </div>
      <div className="pc-actions">
        <button className={`pc-buy${added ? " pc-added" : ""}`} onClick={handleBuy}>
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
        <button className="pc-sub" onClick={() => navigate("/subscriptions")}>
          🔁 Subscribe
        </button>
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

      {/* ── PAGE HERO ── */}
      <div className="products-hero">
        <div className="products-hero-overlay" />
        <div className="products-hero-content">
          <h1>Our Collection</h1>
          <p>Farm-fresh blooms for every tradition, occasion &amp; doorstep</p>
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
                <h3>No flowers found</h3>
                <p>Try adjusting your search or browse a different category.</p>
                <button className="btn-primary" onClick={() => { setSearchQuery(""); setActive("all"); }} style={{ marginTop: '1rem' }}>
                  View All Products
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
