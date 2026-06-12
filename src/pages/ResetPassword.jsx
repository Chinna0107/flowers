import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";

const API = 'http://localhost:5000/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset link. Token is missing.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "0.95rem 1rem",
    border: "1px solid var(--color-accent)", borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-primary)", boxSizing: "border-box",
    background: "rgba(255,255,255,0.85)", outline: "none", fontSize: "0.95rem",
    marginBottom: "1rem"
  };

  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "4rem 1rem", minHeight: "60vh", alignItems: "center" }}>
      <FadeIn direction="up" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="glass" style={{ padding: "2rem", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-primary)", marginBottom: "1rem", color: "var(--color-primary)" }}>
            Reset Password
          </h2>
          
          {success ? (
            <>
              <div style={{ color: "#16a34a", fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
              <p style={{ marginBottom: "1.5rem" }}>Password has been reset successfully.</p>
              <button className="btn-primary" onClick={() => navigate("/auth")} style={{ width: "100%" }}>
                Go to Login
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}
              
              <input 
                type="password" 
                placeholder="New Password" 
                style={inp} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6} 
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                style={inp} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                minLength={6} 
              />
              
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
