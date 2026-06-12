import { useState } from "react";
import "./Contact.css";

const CONTACT_INFO = [
  { icon: "📞", label: "Call Us",      value: "+91 98765 43210",     sub: "Mon–Sat, 7am–8pm",         href: "tel:+919876543210" },
  { icon: "✉️", label: "Email Us",     value: "hello@sowgandhika.in", sub: "We reply within 24 hours",  href: "mailto:hello@sowgandhika.in" },
  { icon: "📍", label: "Visit Us",     value: "Hyderabad, Telangana",  sub: "By appointment only",       href: "https://maps.google.com" },
  { icon: "⏰", label: "Working Hours",value: "Mon–Sat: 7am–8pm",     sub: "Sun: 8am–2pm",              href: null },
];

const SUBJECTS = ["Flower Order", "Subscription", "Bulk / Wedding Order", "Gifting", "Support", "Other"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Flower Order", message: "" });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState("");

  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = (field) => ({
    width: "100%",
    padding: "0.9rem 1rem",
    border: `1.5px solid ${focused === field ? "var(--color-primary)" : "rgba(201,168,106,0.45)"}`,
    borderRadius: 8,
    fontFamily: "'Lato', sans-serif",
    fontSize: "0.97rem",
    backgroundColor: focused === field ? "#fff" : "var(--color-bg)",
    color: "var(--color-text)",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
    boxSizing: "border-box",
  });

  return (
    <div className="contact-page">

      {/* ── HERO ── */}
      <section className="contact-hero">
        <div className="contact-hero-overlay" />
        <div className="contact-hero-content">
          <span className="contact-hero-tag">Get In Touch</span>
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-sub">We love hearing from you — let's talk flowers</p>
        </div>
      </section>

      <div className="contact-body">

        {/* ── INFO CARDS ROW ── */}
        <div className="contact-info-grid">
          {CONTACT_INFO.map(c => (
            <div key={c.label} className="contact-info-card">
              <div className="cic-icon-wrap">{c.icon}</div>
              <div>
                <p className="cic-label">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="cic-value" target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    {c.value}
                  </a>
                ) : (
                  <p className="cic-value" style={{ cursor: "default" }}>{c.value}</p>
                )}
                <p className="cic-sub">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FORM + MAP ROW ── */}
        <div className="contact-main-grid">

          {/* FORM PANEL */}
          <div className="contact-form-panel">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success-badge">
                  <svg viewBox="0 0 200 200" width="100" height="100">
                    <defs><path id="ctop" d="M 100,100 m -68,0 a 68,68 0 1,1 136,0" /></defs>
                    <circle cx="100" cy="100" r="88" fill="none" stroke="#C9A86A" strokeWidth="2" strokeDasharray="4 3" />
                    <text fill="#C9A86A" fontSize="11" fontFamily="'Playfair Display', serif" letterSpacing="3">
                      <textPath href="#ctop" startOffset="8%">SOWGANDHIKA • THANK YOU •</textPath>
                    </text>
                    <text x="100" y="106" textAnchor="middle" fontSize="34" fill="#2E4A2E">✿</text>
                  </svg>
                </div>
                <h2 className="contact-success-title">Message Received!</h2>
                <p className="contact-success-body">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <p className="contact-success-body" style={{ color: "var(--color-accent)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                  Until then — may your space be full of fresh blooms 🌸
                </p>
                <button className="btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => setSent(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="contact-form-header">
                  <span className="section-tag-c">Write to Us</span>
                  <h2 className="contact-form-title">Send a Message</h2>
                  <div className="contact-divider" />
                </div>
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="cf-row">
                    <div className="cf-field">
                      <label className="cf-label">Your Name *</label>
                      <input
                        type="text" required placeholder="e.g. Priya Sharma"
                        value={form.name} onChange={e => set("name", e.target.value)}
                        onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                        style={inputStyle("name")}
                      />
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Email Address *</label>
                      <input
                        type="email" required placeholder="you@example.com"
                        value={form.email} onChange={e => set("email", e.target.value)}
                        onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                        style={inputStyle("email")}
                      />
                    </div>
                  </div>
                  <div className="cf-row">
                    <div className="cf-field">
                      <label className="cf-label">Phone Number</label>
                      <input
                        type="tel" placeholder="+91 98765 43210"
                        value={form.phone} onChange={e => set("phone", e.target.value)}
                        onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                        style={inputStyle("phone")}
                      />
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Subject *</label>
                      <select
                        required value={form.subject} onChange={e => set("subject", e.target.value)}
                        onFocus={() => setFocused("subject")} onBlur={() => setFocused("")}
                        style={{ ...inputStyle("subject"), cursor: "pointer" }}
                      >
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="cf-field">
                    <label className="cf-label">Message *</label>
                    <textarea
                      required rows={6} placeholder="Tell us about your requirement — occasion, quantity, delivery date..."
                      value={form.message} onChange={e => set("message", e.target.value)}
                      onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
                      style={{ ...inputStyle("message"), resize: "vertical" }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1rem", marginTop: "0.5rem" }}>
                    Send Message →
                  </button>
                  <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
                    We respond within 24 hours · Your details are kept private
                  </p>
                </form>
              </>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="contact-right-panel">

            {/* Map placeholder */}
            <div className="contact-map-wrap">
              <iframe
                title="Sowgandhika Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243646.90522753898!2d78.24323041601563!3d17.412281101623817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1721000000000!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0, display: "block" }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Quick links */}
            <div className="contact-quick-panel">
              <h3 className="contact-quick-title">Quick Links</h3>
              <div className="contact-quick-grid">
                {[
                  { icon: "💐", label: "Browse Products",   to: "/products" },
                  { icon: "🔁", label: "Subscriptions",     to: "/subscriptions" },
                  { icon: "💬", label: "Support FAQ",        to: "/support" },
                  { icon: "✦",  label: "About Sowgandhika", to: "/about" },
                ].map(q => (
                  <a key={q.label} href={q.to} className="contact-quick-card">
                    <span style={{ fontSize: "1.4rem" }}>{q.icon}</span>
                    <span>{q.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
