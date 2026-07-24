import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { useCart } from "../store/cartStore.jsx";
import AvatarDropdown from "./AvatarDropdown";
import logo from "../assets/logo.jpeg";

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/cart', label: 'Cart' },
];

const navLinkStyle = (isActive) => ({
  color: isActive ? 'var(--color-accent)' : 'var(--color-primary)',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
  transition: '0.2s',
  borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
  paddingBottom: '2px',
});

export default function Header() {
  const { user, isAdmin } = useAuth();
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header className="glass header-container" style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--color-accent)'
      }}>
        {/* Left: Logo and Title */}
        <Link to="/" className="header-logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Sowgandhika" className="header-logo-img" />
          <div className="header-title">
            <span style={{ display: 'block', fontWeight: 700 }}>Sowgandhika</span>
            <span style={{ display: 'block', fontWeight: 700 }}>Fresh Flowers</span>
          </div>
        </Link>

        {/* Mobile: Same Day Delivery and User */}
        <div className="header-right-actions mobile-only-flex">
          <div className="header-delivery-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <div className="delivery-text">
              <span>Same Day</span>
              <span>Delivery</span>
            </div>
          </div>

          <div className="header-user-btn">
            {user ? <AvatarDropdown /> : (
              <button onClick={() => navigate('/signin')} className="mobile-user-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="header-desktop-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontFamily: 'var(--font-serif)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              style={({ isActive }) => navLinkStyle(isActive)}>
              <span style={{ position: 'relative' }}>
                {n.label}
                {n.label === 'Cart' && cartCount > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#c0392b', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '10px', lineHeight: 1 }}>
                    {cartCount}
                  </span>
                )}
              </span>
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin/dashboard"
              style={({ isActive }) => ({ color: isActive ? 'var(--color-accent)' : 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 })}>
              Admin ▦
            </NavLink>
          )}
          
          <div className="desktop-user-btn">
            {user ? <AvatarDropdown /> : (
              <button onClick={() => navigate('/signin')} className="mobile-user-icon" style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            )}
          </div>
        </nav>
      </header>

      <style>{`
        .header-container {
          padding: 0.85rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-logo-img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--color-accent);
          flex-shrink: 0;
          margin-right: 0.75rem;
        }
        .header-title {
          font-family: var(--font-serif);
          color: var(--color-primary);
          font-size: 1.1rem;
          line-height: 1.2;
        }
        .header-right-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .header-delivery-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .delivery-text {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          line-height: 1.1;
        }
        .mobile-user-icon {
          background: transparent;
          border: 1px solid var(--color-accent);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .header-desktop-nav { display: none !important; }
          .header-container { padding: 0.5rem 1rem; }
          .header-logo-img { width: 45px; height: 45px; margin-right: 0.5rem; }
          .header-title { font-size: 0.95rem; }
          .header-right-actions { gap: 0.75rem; }
          .delivery-text { font-size: 0.65rem; }
          .mobile-user-icon { width: 36px; height: 36px; }
        }
        @media (max-width: 380px) {
          .header-title { font-size: 0.8rem; }
          .delivery-text { display: none; }
        }
      `}</style>
    </>
  );
}
