import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/admin/products', label: 'Products', icon: '❀' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: '🔁' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
];

const activeStyle = {
  backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)',
  fontWeight: 700,
};

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)',
        display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', padding: '0 1.5rem 2rem', borderBottom: '1px solid rgba(201,168,106,0.3)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', border: '2px dashed var(--color-accent)',
            margin: '0 auto 0.75rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(250,247,242,0.1)'
          }}>
            <span style={{ fontSize: '1.4rem' }}>✿</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', margin: 0, fontSize: '1.2rem' }}>Sowgandhika</h2>
          <p style={{ color: 'rgba(250,247,242,0.6)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>Admin Panel</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1.5rem 0' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1.5rem', textDecoration: 'none',
                color: 'var(--color-secondary)', transition: '0.2s',
                ...(isActive ? activeStyle : {}),
              })}>
              <span>{n.icon}</span>
              <span style={{ fontFamily: 'var(--font-serif)', letterSpacing: 0.5 }}>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout}
          style={{ margin: '0 1rem 1rem', padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-serif)', letterSpacing: 1 }}>
          Logout
        </button>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '2.5rem', backgroundColor: 'var(--color-bg)', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
