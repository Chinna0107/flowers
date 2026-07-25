import { useState } from "react";
import { useAuth } from "../store/authStore";

const WHATSAPP_NUMBER = "918374365897"; // replace with actual number

const SUBJECTS = [
  "Daily flower delivery issue",
  "Wrong / damaged order",
  "Subscription management",
  "Payment & billing",
  "General query",
];

const FAQS = [
  { q: "How fresh are the flowers?",             a: "All flowers are sourced daily from local growers and delivered the same day according to the category — never stored overnight." },
  { q: "Can I change my subscription schedule?", a: "Yes! Pause, resume or reschedule anytime from My Subscriptions — no calls needed." },
  { q: "What if my order is late or wrong?",     a: "Message us on WhatsApp immediately. We resolve delivery issues within 2 hours." },
  { q: "How do I cancel an order?",              a: "Orders can be cancelled within 2 hours of placement. Use the form below or WhatsApp us directly." },
  { q: "Do you deliver on Sundays?",             a: "Yes — Sunday deliveries run from 7am to 2pm. Place orders before 9pm Saturday." },
];

export default function Support() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.email || "", subject: SUBJECTS[0], message: "" });
  const [open, setOpen] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lines = [
      "🌸 *Support Request — Sowgandhika Flowers*",
      "",
      `👤 *From:* ${form.name || "Customer"}`,
      `📋 *Category:* ${form.subject}`,
      "",
      `💬 *Issue:*`,
      form.message,
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setSent(true);
  };

  const inp = {
    width: "100%",
    padding: "0.85rem 1rem",
    border: "1.5px solid rgba(201,168,106,0.5)",
    borderRadius: 8,
    fontFamily: "var(--font-primary)",
    fontSize: "0.96rem",
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          border: "2px dashed var(--color-accent)",
          background: "var(--color-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem", fontSize: "1.8rem",
        }}>💬</div>
        <h1 style={{ fontFamily: "var(--font-serif)", color: "var(--color-primary)", fontSize: "clamp(2rem,5vw,3rem)", margin: "0 0 0.5rem" }}>
          Support
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", margin: 0 }}>
          We typically resolve issues within <strong style={{ color: "var(--color-primary)" }}>2 hours</strong>.
        </p>
      </div>

      {/* ── QUICK CONTACT STRIP ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I need help with my Sowgandhika order 🌸")}`}
          target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "#25D366", borderRadius: 10, textDecoration: "none", transition: "0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#1ebe5d"}
          onMouseLeave={e => e.currentTarget.style.background = "#25D366"}>
          <span style={{ fontSize: "1.6rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </span>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>WhatsApp Us</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.85)" }}>Fastest response</p>
          </div>
        </a>
        <a href="tel:+919876543210"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "#fff", border: "1px solid rgba(201,168,106,0.3)", borderRadius: 10, textDecoration: "none", transition: "0.2s" }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(46,74,46,0.1)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
          <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-bg)", border: "1px dashed var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>📞</span>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.95rem" }}>Call Us</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--color-text-muted)" }}>Mon–Sat, 7am–8pm</p>
          </div>
        </a>
      </div>

      {/* ── SUPPORT FORM ── */}
      <div className="glass" style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--color-primary)", margin: "0 0 0.5rem" }}>Message Sent on WhatsApp!</h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
              Our team will respond within <strong>2 hours</strong>.
            </p>
            <button className="btn-primary" onClick={() => { setSent(false); setForm({ name: user?.email || "", subject: SUBJECTS[0], message: "" }); }}>
              Submit Another Request
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ display: "inline-block", border: "1px dashed var(--color-accent)", color: "var(--color-accent)", padding: "0.2rem 0.9rem", borderRadius: 100, fontSize: "0.72rem", letterSpacing: 2, textTransform: "uppercase", fontFamily: "var(--font-primary)", marginBottom: "0.6rem" }}>
                Raise a Ticket
              </span>
              <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--color-primary)", margin: "0 0 0.25rem", fontSize: "1.6rem" }}>How can we help?</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Submitting will open WhatsApp with your message pre-filled
              </p>
              <div style={{ width: 50, height: 3, background: "var(--color-accent)", borderRadius: 2, marginTop: "0.75rem" }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.1rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.4rem", fontSize: "0.82rem", letterSpacing: 0.3 }}>Your Name / Email</label>
                <input type="text" placeholder="e.g. Priya or priya@email.com"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                  onBlur={e => e.target.style.borderColor = "rgba(201,168,106,0.5)"}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.4rem", fontSize: "0.82rem", letterSpacing: 0.3 }}>Help Category *</label>
                <select required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  style={{ ...inp, cursor: "pointer" }}
                  onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                  onBlur={e => e.target.style.borderColor = "rgba(201,168,106,0.5)"}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.4rem", fontSize: "0.82rem", letterSpacing: 0.3 }}>Describe Your Issue *</label>
                <textarea required rows={5}
                  placeholder="Tell us what happened — order ID, date, what went wrong..."
                  value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  style={{ ...inp, resize: "vertical", minHeight: 120 }}
                  onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                  onBlur={e => e.target.style.borderColor = "rgba(201,168,106,0.5)"}
                />
              </div>

              <button type="submit" style={{
                width: "100%", padding: "1rem", background: "#25D366", color: "#fff",
                border: "none", borderRadius: 8, fontFamily: "var(--font-serif)", fontSize: "1rem",
                fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "0.6rem", transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#1ebe5d"}
                onMouseLeave={e => e.currentTarget.style.background = "#25D366"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Send via WhatsApp
              </button>
              <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.78rem", margin: 0 }}>
                Opens WhatsApp with your message · We respond within 2 hours
              </p>
            </form>
          </>
        )}
      </div>

      {/* ── FAQ ── */}
      <div>
        <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--color-primary)", fontSize: "1.5rem", marginBottom: "1.25rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid rgba(201,168,106,0.25)", borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "1rem 1.25rem", background: "none", border: "none", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: "var(--color-primary)", fontSize: "0.97rem" }}>{f.q}</span>
                <span style={{ color: "var(--color-accent)", fontSize: "1.2rem", flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 1.25rem 1rem", borderTop: "1px dashed rgba(201,168,106,0.3)" }}>
                  <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7, margin: "0.75rem 0 0", fontSize: "0.92rem" }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
