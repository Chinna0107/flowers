import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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

  // close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header className="glass" style={{
        padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '1px solid var(--color-accent)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logo} alt="Sowgandhika" style={{
            width: 78, height: 78, borderRadius: '50%',
            objectFit: 'cover', border: '2px solid var(--color-accent)', flexShrink: 0
          }} />
          <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: 700 }}>
            Sowgandhika
          </span>
        </Link>

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
          {user ? <AvatarDropdown /> : (
            <Link to="/signin" className="btn-primary"
              style={{ textDecoration: 'none', padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
              Login
            </Link>
          )}
        </nav>

        {/* Hamburger removed as requested */}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .header-desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
