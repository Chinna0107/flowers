import { Link, NavLink, useNavigate } from "react-router-dom";
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
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()).catch(() => []),
      fetch(`${API}/settings/home_middle_banner`).then(r => r.json()).catch(() => null)
    ]).then(([productsData, bannerData]) => {
      setProducts(Array.isArray(productsData) ? productsData : []);
      if (bannerData && !bannerData.error) setBanner(bannerData);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading home data:', err);
      setLoading(false);
    });
  }, []);

  // Filter products dynamically based on admin flags
  const freshDaily = products.filter(p => p.is_fresh_daily);
  const popular = products.filter(p => p.is_trending);
  const bestsellers = products.filter(p => p.is_best_seller);
  const festive = products.filter(p => p.is_festive_collection);

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
          <div className="hero-badge-new">
            <span className="leaf-icon">🌿</span> 100% Fresh Flowers
          </div>
          <h1 className="hero-title-main">Fresh Temple<br/><span className="highlight-text">Flowers</span></h1>
          <div className="hero-divider"></div>
          <p className="hero-sub-text">Handpicked blooms for pooja, celebrations and every sacred moment.</p>
          
          <div className="hero-features-list">
            <div className="feature-item">
              <span className="feature-icon flower">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#c9a86a"><path d="M12 22a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2zM5.5 17.5a2 2 0 0 1-1.41-.59 2 2 0 0 1 0-2.82 2 2 0 0 1 2.82 0 2 2 0 0 1 0 2.82 2 2 0 0 1-1.41.59zM2.5 12a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2zM5.5 6.5a2 2 0 0 1-1.41-.59 2 2 0 0 1 0-2.82 2 2 0 0 1 2.82 0 2 2 0 0 1 0 2.82 2 2 0 0 1-1.41.59zM12 4a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2zM18.5 6.5a2 2 0 0 1-1.41-.59 2 2 0 0 1 0-2.82 2 2 0 0 1 2.82 0 2 2 0 0 1 0 2.82 2 2 0 0 1-1.41.59zM21.5 12a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2zM18.5 17.5a2 2 0 0 1-1.41-.59 2 2 0 0 1 0-2.82 2 2 0 0 1 2.82 0 2 2 0 0 1 0 2.82 2 2 0 0 1-1.41.59zM12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
              </span>
              <div className="feature-text">
                <span className="ft-title">Premium Quality</span>
                <span className="ft-sub">Temple Grade Flowers</span>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon truck">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </span>
              <div className="feature-text">
                {/* <span className="ft-title">Same Day Delivery</span> */}
                <span className="ft-sub">Freshness Guaranteed</span>
              </div>
            </div>
          </div>

          <div className="hero-ctas">
            <Link to="/products" className="btn-buy-now">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Buy Now &gt;
            </Link>
            <button onClick={handleInstallClick} className="btn-download-now">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Now
            </button>
          </div>
        </div>
      </div>

      {/* ── FLOATING FEATURE ROW ── */}
      <div className="floating-feature-wrapper">
        <div className="floating-features-row">
          <div className="ff-item">
            <span className="ff-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l-1.89.46 1.18-1.56C6 16 10 10 17 8z"/><path d="M20.25 11c-2.6 1.83-4 4.54-4.22 8l1.45-1.12C18.17 14.5 19.5 12.5 20.25 11z"/></svg>
            </span>
            <span className="ff-title">Fresh Every<br/>Morning</span>
            <span className="ff-sub">Handpicked daily</span>
          </div>
          <div className="ff-divider"></div>
          <div className="ff-item">
            <span className="ff-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </span>
            <span className="ff-title">Daily <br/>Delivery</span>
            <span className="ff-sub">Fast & Reliable</span>
          </div>
          <div className="ff-divider"></div>
          <div className="ff-item">
            <span className="ff-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22v-2h20v2H2zm2-2v-4h2v4H4zm4 0v-4h2v4H8zm4 0v-4h2v4h-2zm4 0v-4h2v4h-2zM4 14l8-8 8 8H4zm8-10.5L3 13h18L12 3.5z"/></svg>
            </span>
            <span className="ff-title">Freshly Graded<br/>Quality</span>
            <span className="ff-sub">Pure & Sacred</span>
          </div>
          <div className="ff-divider"></div>
          <div className="ff-item">
            <span className="ff-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </span>
            <span className="ff-title">500+ Happy<br/>Customers</span>
            <span className="ff-sub">Trusted by many</span>
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="section-pad categories-section-mobile">
        <div className="section-header categories-header">
          <h2 className="section-title text-left">Shop by Category</h2>
          <Link to="/products" className="view-all-btn">View All &gt;</Link>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.key} to={`/products?cat=${cat.key}`} className="cat-card">
              <div className="cat-img-wrap">
                <img src={cat.img} alt={cat.label} className="cat-img" loading="lazy" />
              </div>
              <div className="cat-info">
                <p className="cat-name">{cat.label}</p>
                <div className="cat-ornament">
                  <span className="ornament-line"></span>
                  <span className="ornament-diamond">❖</span>
                  <span className="ornament-line"></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
            <img src="https://res.cloudinary.com/dikovivqq/image/upload/v1782588135/WhatsApp_Image_2026-06-19_at_17.10.10_uvplls.jpg" alt="Flower garlands" />
            <div className="home-image-caption">Fresh Flower Strings for Decor</div>
          </div>
          <div className="home-image-card">
            <img src="https://res.cloudinary.com/dwgqfg2xc/image/upload/v1782584626/WhatsApp_Image_2026-06-27_at_09.42.10_eixvv6.jpg" alt="Bridal flower hair" />
            <div className="home-image-caption">Traditional garlands for pooja and ceremony</div>
          </div>
        </div>
      </section>

      {/* ── FRESH DAILY (FEATURED) ── */}
      {!loading && freshDaily.length > 0 && (
        <section className="section-alt">
          <div className="section-header">
            <span className="section-tag">Featured</span>
            <h2 className="section-title">Fresh Daily</h2>
            <p className="section-sub">Handpicked blooms delivered fresh every morning</p>
          </div>
          <div className="products-grid">
            {freshDaily.map(p => <PopularCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* ── POPULAR PRODUCTS ── */}
      {!loading && popular.length > 0 && (
        <section className="section-pad">
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

      {/* ── DYNAMIC HOME BANNER ── */}
      {!loading && banner && (
        <section className="home-dynamic-banner" style={{ backgroundImage: `url(/home-middle-banner.png)` }}>
          <div className="home-dynamic-banner-overlay"></div>
          <div className="home-dynamic-banner-content">
            {banner.title && <h2 className="banner-title">{banner.title}</h2>}
            {banner.subtitle && <p className="banner-sub">{banner.subtitle}</p>}
            {banner.link_text && banner.link_url && (
              <Link to={banner.link_url} className="btn-primary banner-btn">
                {banner.link_text}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── BEST SELLERS ── */}
      {!loading && bestsellers.length > 0 && (
        <section className="section-alt">
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

      {/* ── FESTIVE COLLECTIONS ── */}
      {!loading && festive.length > 0 && (
        <section className="section-pad">
          <div className="section-header">
            <span className="section-tag">Celebration</span>
            <h2 className="section-title">Festive Collections</h2>
            <p className="section-sub">Exclusive floral sets for your special occasions</p>
          </div>
          <div className="products-grid">
            {festive.map(p => <PopularCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

    
      {/* ── FLOATING ACTION BUTTONS ── */}
      <div className="floating-action-buttons">
        <a href="https://wa.me/8347365897" target="_blank" rel="noopener noreferrer" className="fab fab-whatsapp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          WhatsApp
        </a>
        <a href="tel:8347365897" className="fab fab-call">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 0 0-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/></svg>
          Call Us
        </a>
      </div>

      {/* ── BOTTOM NAVIGATION ── */}
      <div className="bottom-nav">
        <NavLink to="/" end className={({isActive}) => `bn-item ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-7l-2-2"></path><path d="M12 15l2-2"></path><circle cx="12" cy="7" r="3"></circle><path d="M12 4a3 3 0 0 0-3 3c0 2 3 3 3 3s3-1 3-3a3 3 0 0 0-3-3z"></path><path d="M9 7a3 3 0 0 0-3 3c0 2 3 3 3 3s3-1 3-3a3 3 0 0 0-3-3z"></path><path d="M15 7a3 3 0 0 1 3 3c0 2-3 3-3 3s-3-1-3-3a3 3 0 0 1 3-3z"></path></svg>
          <span>Home</span>
        </NavLink>
        <NavLink to="/products" className={({isActive}) => `bn-item ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span>Products</span>
        </NavLink>
        <NavLink to="/cart" className={({isActive}) => `bn-item ${isActive ? 'active' : ''}`}>
          <div style={{position: 'relative'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <span>Cart</span>
        </NavLink>
        <NavLink to="/subscriptions" className={({isActive}) => `bn-item ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          <span>Subs</span>
        </NavLink>
        <NavLink to="/account" className={({isActive}) => `bn-item ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Account</span>
        </NavLink>
      </div>

    </div>
  );
}
