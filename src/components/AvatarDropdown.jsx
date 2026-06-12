import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

export default function AvatarDropdown() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.email ? user.email[0].toUpperCase() : '?';

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--color-accent)',
          backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)',
          fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
        {initials}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%', minWidth: 180,
          backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-glass)',
          overflow: 'hidden', zIndex: 100
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px dashed var(--color-accent)', backgroundColor: 'var(--color-bg)' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Signed in as</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
          {[
            { to: '/my-orders', label: '📦 My Orders' },
            { to: '/my-subscriptions', label: '🔁 Subscriptions' },
            { to: '/support', label: '💬 Support' },
          ].map(item => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '0.7rem 1rem', color: 'var(--color-primary)', textDecoration: 'none', fontFamily: 'var(--font-serif)', fontSize: '0.9rem', borderBottom: '1px solid rgba(201,168,106,0.15)', transition: '0.15s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout}
            style={{ display: 'block', width: '100%', padding: '0.7rem 1rem', background: 'none', border: 'none', textAlign: 'left', color: '#c0392b', fontFamily: 'var(--font-serif)', fontSize: '0.9rem', cursor: 'pointer' }}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
