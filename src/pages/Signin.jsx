import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { GoogleLogin } from '@react-oauth/google';
import FadeIn from "../components/FadeIn";

export default function Signin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.isAdmin ? "/admin/dashboard" : "/", { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await loginWithGoogle(credentialResponse.credential);
    if (res.success) {
      navigate(res.isAdmin ? '/admin/dashboard' : '/', { replace: true });
    } else {
      setError(res.error || 'Google login failed');
    }
  };

  const inp = {
    width: "100%", padding: "0.95rem 1rem",
    border: "1px solid var(--color-accent)", borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-primary)", boxSizing: "border-box",
    background: "rgba(255,255,255,0.85)", outline: "none", fontSize: "0.95rem",
  };

  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "4rem 1rem", minHeight: "80vh", alignItems: "center", boxSizing: "border-box" }}>
      <FadeIn direction="up" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="glass" style={{ padding: "clamp(1.5rem, 5vw, 2.5rem)", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h1 className="vintage-title" style={{ fontSize: "2.2rem", marginBottom: "0.25rem" }}>Sowgandhika</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Welcome back 🌸</p>
          </div>

          {error && (
            <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input style={inp} type="email" placeholder="Email Address" value={form.email} onChange={set("email")} required />
            <input style={inp} type="password" placeholder="Password" value={form.password} onChange={set("password")} required minLength={6} />
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "1rem", marginTop: "0.5rem", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(201,168,106,0.3)' }} />
            <span style={{ padding: '0 1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(201,168,106,0.3)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google Login Failed');
              }}
              theme="filled_black"
              shape="circle"
              text="signin_with"
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Link to="/forgot-password" style={{ background: "none", border: "none", color: "var(--color-accent)", fontSize: "0.85rem", textDecoration: "underline", fontFamily: "var(--font-primary)" }}>
              Forgot Password?
            </Link>
          </div>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--color-accent)", fontWeight: 700, fontFamily: "var(--font-primary)" }}>
              Sign Up
            </Link>
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
