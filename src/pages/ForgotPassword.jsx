import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import FadeIn from "../components/FadeIn";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    const result = await forgotPassword(email);
    if (result.success) {
      setSuccessMsg(result.message || "Password reset link sent to your email.");
      setTimeout(() => navigate("/signin"), 3000);
    } else {
      setError(result.error);
    }
    setLoading(false);
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
            <h1 className="vintage-title" style={{ fontSize: "2.2rem", marginBottom: "0.25rem" }}>Reset Password</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Enter your email to receive reset link</p>
          </div>

          {error && (
            <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#16a34a", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input style={inp} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "1rem", marginTop: "0.5rem", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : "Send Reset Link"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Remember your password?{" "}
            <Link to="/signin" style={{ color: "var(--color-accent)", fontWeight: 700, fontFamily: "var(--font-primary)" }}>
              Sign In
            </Link>
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
