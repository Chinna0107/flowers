import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";

const API = 'http://localhost:5000/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The link may have expired.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Server error. Please try again later.");
      }
    };
    
    verify();
  }, [token]);

  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "4rem 1rem", minHeight: "60vh", alignItems: "center" }}>
      <FadeIn direction="up" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="glass" style={{ padding: "2rem", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-primary)", marginBottom: "1rem", color: "var(--color-primary)" }}>
            Email Verification
          </h2>
          
          {status === "verifying" && (
            <p style={{ color: "var(--color-text-muted)" }}>Verifying your email, please wait...</p>
          )}
          
          {status === "success" && (
            <>
              <div style={{ color: "#16a34a", fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
              <p style={{ marginBottom: "1.5rem" }}>{message}</p>
              <button className="btn-primary" onClick={() => navigate("/auth")} style={{ width: "100%" }}>
                Go to Login
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ color: "#dc2626", fontSize: "3rem", marginBottom: "1rem" }}>✗</div>
              <p style={{ color: "#dc2626", marginBottom: "1.5rem" }}>{message}</p>
              <button className="btn-outline" onClick={() => navigate("/auth")} style={{ width: "100%" }}>
                Back to Auth
              </button>
            </>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
