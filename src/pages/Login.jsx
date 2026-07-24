import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    login(email, isAdmin);
    navigate(isAdmin ? '/admin/dashboard' : '/');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await loginWithGoogle(credentialResponse.credential);
    if (res.success) {
      navigate(res.isAdmin ? '/admin/dashboard' : '/');
    } else {
      alert(res.error || 'Google login failed');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '440px', padding: '3rem', textAlign: 'center' }}>
        {/* Vintage Badge Logo */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%', border: '3px dashed var(--color-accent)',
          margin: '0 auto 1.5rem auto', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)'
        }}>
          <span style={{ fontSize: '1.6rem' }}>✿</span>
          <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', letterSpacing: 1 }}>SOWGANDHIKA</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome Back
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontStyle: 'italic' }}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '0.85rem 1rem', border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-primary)',
              fontSize: '1rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)',
              outline: 'none', width: '100%', boxSizing: 'border-box'
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            Sign in as Admin (demo)
          </label>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(201,168,106,0.3)' }} />
          <span style={{ padding: '0 1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(201,168,106,0.3)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Login Failed');
              alert('Google Login Failed');
            }}
            theme="filled_black"
            shape="circle"
            text="signin_with"
          />
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-accent)' }}>Sign Up</Link>
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          By signing in you agree to our{' '}
          <Link to="/privacy" style={{ color: 'var(--color-accent)' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
