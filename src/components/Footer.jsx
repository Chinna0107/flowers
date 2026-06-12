import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
  { to: "/cart", label: "My Cart" },
];

const CATEGORIES = [
  { to: "/products?cat=pooja-premium", label: "Pooja Flowers – Premium" },
  { to: "/products?cat=pooja-basic",   label: "Pooja Flowers – Basic" },
  { to: "/products?cat=fresh",         label: "Fresh Flowers" },
  { to: "/products?cat=poola-jada",    label: "Poola Jada" },
  { to: "/products?cat=hair-accessories", label: "Hair Accessories" },
  { to: "/products?cat=garlands",      label: "Garlands" },
  { to: "/products?cat=jewellery",     label: "Flower Jewellery" },
];

const POLICIES = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
  { label: "Privacy Policy" },
  { label: "Refund Policy" },
  { label: "Shipping Policy" },
  { label: "Terms & Conditions" },
];

const colTitle = { fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#C9A86A", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "1.25rem" };
const linkStyle = { color: "rgba(250,247,242,0.75)", textDecoration: "none", fontSize: "0.88rem", display: "block", marginBottom: "0.6rem", transition: "color 0.2s", lineHeight: 1.5 };

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--color-primary)", borderTop: "4px solid var(--color-accent)", color: "#FAF7F2" }}>

      {/* ── MAIN GRID ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 2rem 3rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2.5rem" }}>

        {/* ── COL 1: BRAND ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <img src={logo} alt="Sowgandhika" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-accent)" }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#FAF7F2" }}>Sowgandhika</span>
          </div>
          <p style={{ color: "rgba(250,247,242,0.7)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: "1.5rem", maxWidth: 260 }}>
            Hyderabad's trusted artisanal flower studio. Fresh blooms sourced daily — from morning pooja to bridal moments.
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "var(--color-accent)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Fresh Daily · Est. 2026
          </p>
          {/* Social row */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
  {[
    {
      icon: <FaFacebookF />,
      href: "https://facebook.com",
      title: "Facebook",
    },
    {
      icon: <FaInstagram />,
      href: "https://instagram.com",
      title: "Instagram",
    },
    {
      icon: <FaXTwitter />,
      href: "https://x.com",
      title: "Twitter",
    },
    {
      icon: <FaYoutube />,
      href: "https://youtube.com",
      title: "YouTube",
    },
  ].map((s) => (
    <a
      key={s.title}
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      title={s.title}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "1px solid rgba(201,168,106,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        color: "#C9A86A",
        textDecoration: "none",
        transition: "all 0.3s ease",
      }}
    >
      {s.icon}
    </a>
  ))}
</div>
        </div>

        {/* ── COL 2: QUICK LINKS ── */}
        <div>
          <p style={colTitle}>Quick Links</p>
          {QUICK_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = "#C9A86A"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(250,247,242,0.75)"}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── COL 3: CATEGORIES ── */}
        <div>
          <p style={colTitle}>Categories</p>
          {CATEGORIES.map(l => (
            <Link key={l.to} to={l.to} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = "#C9A86A"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(250,247,242,0.75)"}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── COL 4: POLICIES ── */}
        <div>
          <p style={colTitle}>Policies</p>
          {POLICIES.map(l => (
            l.to
              ? <Link key={l.label} to={l.to} style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = "#C9A86A"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(250,247,242,0.75)"}>
                  {l.label}
                </Link>
              : <span key={l.label} style={{ ...linkStyle, cursor: "default" }}>{l.label}</span>
          ))}
        </div>

        {/* ── COL 5: CONTACT ── */}
        <div>
          <p style={colTitle}>Contact</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <p style={{ color: "var(--color-accent)", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 0.2rem", fontFamily: "'Lato', sans-serif" }}>Phone</p>
              <a href="tel:+919876543210" style={{ ...linkStyle, marginBottom: 0 }}>+91 98765 43210</a>
              <p style={{ color: "rgba(250,247,242,0.45)", fontSize: "0.78rem", margin: "0.15rem 0 0" }}>Mon–Sat, 7am–8pm</p>
            </div>
            <div>
              <p style={{ color: "var(--color-accent)", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 0.2rem", fontFamily: "'Lato', sans-serif" }}>Email</p>
              <a href="mailto:hello@sowgandhika.in" style={{ ...linkStyle, marginBottom: 0 }}>hello@sowgandhika.in</a>
            </div>
            <div>
              <p style={{ color: "var(--color-accent)", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 0.2rem", fontFamily: "'Lato', sans-serif" }}>Location</p>
              <p style={{ ...linkStyle, marginBottom: 0, cursor: "default" }}>Hyderabad, Telangana</p>
              <p style={{ color: "rgba(250,247,242,0.45)", fontSize: "0.78rem", margin: "0.15rem 0 0" }}>By appointment only</p>
            </div>
            <div>
              <p style={{ color: "var(--color-accent)", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 0.2rem", fontFamily: "'Lato', sans-serif" }}>Hours</p>
              <p style={{ ...linkStyle, marginBottom: 0, cursor: "default" }}>Mon–Sat: 7am – 8pm</p>
              <p style={{ color: "rgba(250,247,242,0.45)", fontSize: "0.78rem", margin: "0.15rem 0 0" }}>Sun: 8am – 2pm</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ borderTop: "1px solid rgba(201,168,106,0.25)", padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", maxWidth: 1280, margin: "0 auto" }}>
        <p style={{ color: "rgba(250,247,242,0.5)", fontSize: "0.82rem", margin: 0 }}>
          &copy; {new Date().getFullYear()} Sowgandhika Fresh Flowers. All rights reserved.
        </p>
        <p style={{ color: "rgba(250,247,242,0.5)", fontSize: "0.82rem", margin: 0, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
          Made with ❤️ by <a href="https://zewo.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-accent)", textDecoration: "none", fontSize: "1.0rem" }}>zewo</a>
        </p>
      </div>


    </footer>
  );
}
