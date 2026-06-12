import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import FadeIn from "../components/FadeIn";

export default function Auth() {
  const [tab, setTab] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", otp: "", address: "" });
  const [otpToken, setOtpToken] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup, forgotPassword, verifyOtp, completeProfile } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (tab === "signin") {
      const result = await login(form.email, form.password);
      if (result.success) {
        navigate(result.isAdmin ? "/admin/dashboard" : "/", { replace: true });
      } else {
        setError(result.error);
        if (result.error.toLowerCase().includes("verify your email")) {
           setTab("verify_otp");
        }
      }
    } else if (tab === "signup") {
      const result = await signup(form.email);
      if (result.success) {
        setSuccessMsg(result.message || "OTP sent! Please check your email.");
        setOtpToken(result.otpToken);
        setTab("verify_otp");
      } else {
        setError(result.error);
      }
    } else if (tab === "verify_otp") {
      const result = await verifyOtp(form.email, form.otp, otpToken);
      if (result.success) {
        setSetupToken(result.setupToken);
        setSuccessMsg(result.message || "Email verified! Complete your profile.");
        setTab("complete_profile");
      } else {
        setError(result.error);
      }
    } else if (tab === "complete_profile") {
      const result = await completeProfile(setupToken, form.name, form.password, form.phone, form.address);
      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(result.error);
      }
    } else if (tab === "forgot_password") {
      const result = await forgotPassword(form.email);
      if (result.success) {
        setSuccessMsg(result.message || "Password reset link sent to your email.");
        setTab("signin");
        setForm({ ...form, password: "" });
      } else {
        setError(result.error);
      }
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

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h1 className="vintage-title" style={{ fontSize: "2.2rem", marginBottom: "0.25rem" }}>Sowgandhika</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Fresh flowers, delivered with love 🌸</p>
          </div>

          {/* Tabs */}
          {(tab === "signin" || tab === "signup") && (
            <div style={{ display: "flex", background: "rgba(46,74,46,0.08)", borderRadius: "10px", padding: "4px", marginBottom: "1.75rem" }}>
              {["signin", "signup"].map((t) => (
                <button key={t} onClick={() => { setTab(t); setError(""); setSuccessMsg(""); }}
                  style={{
                    flex: 1, padding: "0.6rem", border: "none", borderRadius: "8px", cursor: "pointer",
                    fontFamily: "var(--font-primary)", fontWeight: 700, fontSize: "0.9rem", transition: "all 0.25s",
                    background: tab === t ? "var(--color-primary)" : "transparent",
                    color: tab === t ? "#FAF7F2" : "var(--color-text-muted)",
                    boxShadow: tab === t ? "0 4px 12px rgba(46,74,46,0.25)" : "none",
                  }}>
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}
          
          {tab === "forgot_password" && (
            <h2 style={{ textAlign: "center", fontFamily: "var(--font-primary)", marginBottom: "1.5rem", color: "var(--color-primary)" }}>
              Reset Password
            </h2>
          )}

          {tab === "verify_otp" && (
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-primary)", color: "var(--color-primary)", marginBottom: "0.5rem" }}>
                Verify Email
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                We sent a 6-digit code to <strong>{form.email}</strong>.
              </p>
            </div>
          )}

          {tab === "complete_profile" && (
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-primary)", color: "var(--color-primary)", marginBottom: "0.5rem" }}>
                Complete Your Profile
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                Almost done! Tell us a bit more about yourself.
              </p>
            </div>
          )}

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
            {tab === "signup" && (
              <input style={inp} type="email" placeholder="Email Address" value={form.email} onChange={set("email")} required />
            )}
            
            {tab === "signin" && (
              <>
                <input style={inp} type="email" placeholder="Email Address" value={form.email} onChange={set("email")} required />
                <input style={inp} type="password" placeholder="Password" value={form.password} onChange={set("password")} required minLength={6} />
              </>
            )}
            {tab === "forgot_password" && (
              <input style={inp} type="email" placeholder="Email Address" value={form.email} onChange={set("email")} required />
            )}

            {tab === "verify_otp" && (
              <input style={{...inp, textAlign: "center", letterSpacing: "0.5rem", fontSize: "1.2rem", fontWeight: "bold" }} type="text" placeholder="------" maxLength={6} value={form.otp} onChange={set("otp")} required />
            )}

            {tab === "complete_profile" && (
              <>
                <input style={inp} placeholder="Full Name" value={form.name} onChange={set("name")} required />
                <input style={inp} type="password" placeholder="Create Password" value={form.password} onChange={set("password")} required minLength={6} />
                <input style={inp} placeholder="Phone Number" value={form.phone} onChange={set("phone")} />
                <textarea style={{...inp, resize: "vertical", minHeight: "80px"}} placeholder="Delivery Address (Flat, Street, City, Pincode)" value={form.address} onChange={set("address")} />
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ padding: "1rem", marginTop: "0.5rem", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : tab === "signin" ? "Sign In" : tab === "signup" ? "Create Account" : tab === "verify_otp" ? "Verify Code" : tab === "complete_profile" ? "Save & Continue" : "Send Reset Link"}
            </button>
          </form>

          {tab === "signin" && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button onClick={() => { setTab("forgot_password"); setError(""); setSuccessMsg(""); }}
                style={{ background: "none", border: "none", color: "var(--color-accent)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-primary)" }}>
                Forgot Password?
              </button>
            </div>
          )}

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            {tab === "signin" ? "Don't have an account? " : tab === "signup" ? "Already have an account? " : "Remember your password? "}
            <button onClick={() => { setTab(tab === "signup" ? "signin" : tab === "signin" ? "signup" : "signin"); setError(""); setSuccessMsg(""); }}
              style={{ background: "none", border: "none", color: "var(--color-accent)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-primary)" }}>
              {tab === "signup" ? "Sign In" : tab === "signin" ? "Sign Up" : "Back to Sign In"}
            </button>
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
