import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./Contact.css";

const WHATSAPP_NUMBER = "918374365897"; // replace with actual number

const CONTACT_INFO = [
  { icon: "📞", label: "Call Us",       value: "+91 83743 65897",                  sub: "Mon–Sat, 7am–8pm",        href: "tel:+918374365897" },
  { icon: "✉️", label: "Email Us",      value: "sowgandhikafreshflowers@gmail.com", sub: "We reply within 24 hours", href: "mailto:sowgandhikafreshflowers@gmail.com" },
  { icon: "📍", label: "Visit Us",      value: "Hyderabad, Telangana",              sub: "By appointment only",      href: "https://maps.google.com" },
  { icon: "⏰", label: "Working Hours", value: "Mon–Sat: 7am–8pm",                 sub: "Sun: 8am–2pm",             href: null },
];

const SUBJECTS = ["Flower Order", "Subscription", "Bulk / Wedding Order", "Gifting", "Support", "Other"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Flower Order", message: "" });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build WhatsApp message
    const lines = [
      "🌸 *New Enquiry — Sowgandhika Flowers*",
      "",
      `👤 *Name:* ${form.name}`,
      `✉️ *Email:* ${form.email}`,
      form.phone ? `📞 *Phone:* ${form.phone}` : null,
      `📋 *Subject:* ${form.subject}`,
      "",
      `💬 *Message:*`,
      form.message,
    ].filter(l => l !== null).join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  };

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
      <Helmet>
        <title>Contact Us | Sowgandhika Flowers</title>
        <meta name="description" content="Get in touch with Sowgandhika Flowers in Hyderabad. Contact us for bulk orders, wedding bookings, garlands, Pooja flower deliveries, or custom flower subscriptions." />
        <link rel="canonical" href="https://sowgandhikafreshflowers.com/contact" />
      </Helmet>

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

        {/* ── INFO CARDS ── */}
        <div className="contact-info-grid">
          {CONTACT_INFO.map(c => (
            <div key={c.label} className="contact-info-card">
              <div className="cic-icon-wrap">{c.icon}</div>
              <div className="cic-text">
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

        {/* ── FORM + RIGHT PANEL ── */}
        <div className="contact-main-grid">

          {/* FORM PANEL */}
          <div className="contact-form-panel">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success-badge">
                  <svg viewBox="0 0 200 200" width="110" height="110">
                    <defs><path id="ctop" d="M 100,100 m -68,0 a 68,68 0 1,1 136,0" /></defs>
                    <circle cx="100" cy="100" r="88" fill="none" stroke="#C9A86A" strokeWidth="2" strokeDasharray="4 3" />
                    <text fill="#C9A86A" fontSize="11" fontFamily="'Playfair Display', serif" letterSpacing="3">
                      <textPath href="#ctop" startOffset="8%">SOWGANDHIKA • THANK YOU •</textPath>
                    </text>
                    <text x="100" y="106" textAnchor="middle" fontSize="34" fill="#2E4A2E">✿</text>
                  </svg>
                </div>
                <h2 className="contact-success-title">Message Sent!</h2>
                <p className="contact-success-body">
                  Your message has been sent to our WhatsApp. We'll get back to you within a few hours.
                </p>
                <p className="contact-success-body" style={{ color: "var(--color-accent)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                  Until then — may your space be full of fresh blooms 🌸
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
                  <button className="btn-primary" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "Flower Order", message: "" }); }}>
                    Send Another Message
                  </button>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank" rel="noreferrer"
                    className="contact-wa-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="contact-form-header">
                  <span className="section-tag-c">Write to Us</span>
                  <h2 className="contact-form-title">Send a Message</h2>
                  <div className="contact-divider" />
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Submitting this form will open WhatsApp with your message pre-filled
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="cf-row">
                    <div className="cf-field">
                      <label className="cf-label">Your Name *</label>
                      <input type="text" required placeholder="e.g. Priya Sharma"
                        value={form.name} onChange={e => set("name", e.target.value)}
                        onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                        style={inputStyle("name")} />
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Email Address *</label>
                      <input type="email" required placeholder="you@example.com"
                        value={form.email} onChange={e => set("email", e.target.value)}
                        onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                        style={inputStyle("email")} />
                    </div>
                  </div>
                  <div className="cf-row">
                    <div className="cf-field">
                      <label className="cf-label">Phone Number</label>
                      <input type="tel" placeholder="+91 98765 43210"
                        value={form.phone} onChange={e => set("phone", e.target.value)}
                        onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                        style={inputStyle("phone")} />
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Subject *</label>
                      <select required value={form.subject} onChange={e => set("subject", e.target.value)}
                        onFocus={() => setFocused("subject")} onBlur={() => setFocused("")}
                        style={{ ...inputStyle("subject"), cursor: "pointer" }}>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="cf-field">
                    <label className="cf-label">Message *</label>
                    <textarea required rows={6}
                      placeholder="Tell us about your requirement — occasion, quantity, delivery date..."
                      value={form.message} onChange={e => set("message", e.target.value)}
                      onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
                      style={{ ...inputStyle("message"), resize: "vertical" }} />
                  </div>

                  <button type="submit" className="contact-wa-submit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Send via WhatsApp
                  </button>

                  <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                    Opens WhatsApp with your message · We respond within a few hours
                  </p>
                </form>
              </>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="contact-right-panel">
            <div className="contact-map-wrap">
              <iframe
                title="Sowgandhika Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243646.90522753898!2d78.24323041601563!3d17.412281101623817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1721000000000!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0, display: "block" }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* WhatsApp direct CTA */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to enquire about flowers from Sowgandhika 🌸")}`}
              target="_blank" rel="noreferrer" className="contact-wa-direct">
              <div className="contact-wa-direct-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: "0 0 0.2rem", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Chat Directly on WhatsApp</p>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.8)" }}>Tap to start a conversation now</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" style={{ marginLeft: "auto", flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

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
