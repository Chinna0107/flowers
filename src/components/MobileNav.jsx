import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flower2, ShoppingBag, RefreshCcw, CircleUserRound, LayoutGrid, Info, Phone, LogIn, Package, Repeat, LifeBuoy, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../store/authStore';
import { useCart } from '../store/cartStore.jsx';
import { useWishlist } from '../store/wishlistStore.jsx';

export default function MobileNav(){
  const { pathname } = useLocation();
  const isActive = (p) => pathname === p;
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleLink = () => {
    setMenuOpen(false);
  };

  return (
    <div ref={menuRef}>
      {menuOpen && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          right: '10px',
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          padding: '0.5rem 0',
          zIndex: 1000,
          minWidth: '220px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Link to="/about" onClick={handleLink} style={dropdownItemStyle}><Info size={16}/> About Us</Link>
          <Link to="/contact" onClick={handleLink} style={dropdownItemStyle}><Phone size={16}/> Contact Us</Link>
          
          {user ? (
            <>
              <div style={{ borderTop: '1px dashed var(--color-accent)', margin: '0.5rem 0' }} />
              <Link to="/my-orders" onClick={handleLink} style={dropdownItemStyle}><Package size={16}/> My Orders</Link>
              <Link to="/my-subscriptions" onClick={handleLink} style={dropdownItemStyle}><Repeat size={16}/> My Subscriptions</Link>
              <Link to="/support" onClick={handleLink} style={dropdownItemStyle}><LifeBuoy size={16}/> Support</Link>
              <div style={{ borderTop: '1px dashed var(--color-accent)', margin: '0.5rem 0' }} />
              <button onClick={handleLogout} style={{ ...dropdownItemStyle, color: '#c0392b', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}><LogOut size={16}/> Logout</button>
            </>
          ) : (
            <>
              <div style={{ borderTop: '1px dashed var(--color-accent)', margin: '0.5rem 0' }} />
              <Link to="/login" onClick={handleLink} style={dropdownItemStyle}><LogIn size={16}/> Login</Link>
            </>
          )}
        </div>
      )}

      <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        <Link to="/" className={isActive('/') ? 'active' : ''}>
          <Flower2 />
          <span>Home</span>
        </Link>
        <Link to="/products" className={isActive('/products') ? 'active' : ''}>
          <LayoutGrid />
          <span>Products</span>
        </Link>
        <Link to="/cart" className={isActive('/cart') ? 'active' : ''} style={{ position: 'relative' }}>
          <ShoppingBag />
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '0', right: '15px', background: '#c0392b', color: '#fff', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '10px', lineHeight: 1 }}>
              {cartCount}
            </span>
          )}
          <span>Cart</span>
        </Link>
        <Link to="/wishlist" className={isActive('/wishlist') ? 'active' : ''} style={{ position: 'relative' }}>
          <Heart />
          {wishlistCount > 0 && (
            <span style={{ position: 'absolute', top: '0', right: '15px', background: '#c0392b', color: '#fff', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '10px', lineHeight: 1 }}>
              {wishlistCount}
            </span>
          )}
          <span>Wishlist</span>
        </Link>
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className={isActive('/account') || menuOpen ? 'active' : ''} 
          style={{ 
            background: 'none', border: 'none', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', gap: '4px', color: 'var(--color-primary)', 
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.65rem' 
          }}
        >
          <CircleUserRound />
          <span>Account</span>
        </button>
      </nav>
    </div>
  );
}

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 1.25rem',
  color: 'var(--color-primary)',
  textDecoration: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.9rem',
};
