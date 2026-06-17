import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import FadeIn from "../components/FadeIn";
import { BUILDINGS, PINCODES } from "../data/addressOptions.js";

export default function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", otp: "", name: "", password: "", phone: "", address: "", flat: "", building: "", pincode: "" });
  const [otpToken, setOtpToken] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, verifyOtp, completeProfile } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (step === 1) {
      const result = await signup(form.email);
      if (result.success) {
        setSuccessMsg(result.message || "OTP sent! Check your email.");
        setOtpToken(result.otpToken);
        setStep(2);
      } else {
        setError(result.error);
      }
    } else if (step === 2) {
      const result = await verifyOtp(form.email, form.otp, otpToken);
      if (result.success) {
        setSetupToken(result.setupToken);
        setSuccessMsg(result.message || "Email verified! Complete your profile.");
        setStep(3);
      } else {
        setError(result.error);
      }
    } else if (step === 3) {
      if (!form.flat || !form.building || !form.pincode) {
        setError("Please enter flat number and select building name & pincode.");
        setLoading(false);
        return;
      }
      const addressJson = JSON.stringify({
        flat: form.flat,
        building: form.building,
        pincode: form.pincode,
        city: "Hyderabad"
      });
      const result = await completeProfile(setupToken, form.name, form.password, form.phone, addressJson);
      if (result.success) {
        navigate("/", { replace: true });
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
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h1 className="vintage-title" style={{ fontSize: "2.2rem", marginBottom: "0.25rem" }}>Sowgandhika</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              {step === 1 && "Create your account 🌸"}
              {step === 2 && `Code sent to ${form.email}`}
              {step === 3 && "Almost done! Tell us about yourself"}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ width: "50px", height: "4px", borderRadius: "2px", background: s <= step ? "var(--color-primary)" : "rgba(46,74,46,0.15)" }} />
            ))}
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
            {step === 1 && (
              <input style={inp} type="email" placeholder="Email Address" value={form.email} onChange={set("email")} required autoFocus />
            )}

            {step === 2 && (
              <input style={{ ...inp, textAlign: "center", letterSpacing: "0.5rem", fontSize: "1.2rem", fontWeight: "bold" }} type="text" placeholder="------" maxLength={6} value={form.otp} onChange={set("otp")} required autoFocus />
            )}

            {step === 3 && (
              <>
                <input style={inp} placeholder="Full Name" value={form.name} onChange={set("name")} required autoFocus />
                <input style={inp} type="password" placeholder="Create Password" value={form.password} onChange={set("password")} required minLength={6} />
                <input style={inp} placeholder="Phone Number" value={form.phone} onChange={set("phone")} />
                <input style={inp} placeholder="Flat / Door No" value={form.flat} onChange={set("flat")} required />
                <select style={inp} value={form.building} onChange={set("building")} required>
                  <option value="" disabled>Select Building Name</option>
                  {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select style={inp} value={form.pincode} onChange={set("pincode")} required>
                  <option value="" disabled>Select Pincode</option>
                  {PINCODES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "1rem", marginTop: "0.5rem", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : step === 1 ? "Send OTP" : step === 2 ? "Verify Code" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Already have an account?{" "}
            <Link to="/signin" style={{ color: "var(--color-accent)", fontWeight: 700, fontFamily: "var(--font-primary)" }}>
              Sign In
            </Link>
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
