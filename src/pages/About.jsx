import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./About.css";
import logo from "../assets/logo.jpeg";

const VALUES = [
  { icon: "🌿", title: "Farm to Doorstep",   desc: "We source directly from trusted local farms every morning — zero middlemen, maximum freshness." },
  { icon: "✦",  title: "Artisan Crafted",    desc: "Every arrangement is hand-curated by our florists who treat every bloom with love and precision." },
  { icon: "🎁", title: "Gift-Ready Always",  desc: "Kraft paper wrapping, satin ribbons and a personalised message card on every single order." },
  { icon: "🚚", title: "On-Time Delivery",   desc: "We promise same-day delivery for orders placed before 10 AM — fresh at your doorstep, always." },
  { icon: "🔁", title: "Flexible Plans",     desc: "Alternate days, weekly, monthly or your own custom interval — flowers on your terms." },
  { icon: "💚", title: "Eco Conscious",      desc: "Biodegradable packaging, no plastics. We love the earth as much as we love flowers." },
];

const TEAM = [
  // { name: "Sowgandhika",    role: "Founder & Head Florist",    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80", quote: "Every flower is a soul blossoming in nature." },
  // { name: "Priya Lakshmi",  role: "Bridal Styling Expert",     img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&q=80", quote: "Bridal florals are my canvas — tradition is my art." },
  // { name: "Ravi Kumar",     role: "Delivery & Operations",     img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80", quote: "Fresh flowers deserve a flawless journey." },
];

const MILESTONES = [
  { year: "2025",   label: "Founded",            desc: "Started with a dream and a small cart of flowers in Hyderabad." },
  { year: "500+",   label: "Happy Customers",    desc: "Serving homes, temples, weddings and events across Hyderabad." },
  { year: "50+",    label: "Products",           desc: "From daily pooja packs to bridal Poola Jada — we have it all." },
  { year: "100%",   label: "Fresh Daily",        desc: "Every single product is sourced and crafted on the day of delivery." },
];

export default function About() {
  return (
    <div className="about-page">
      <Helmet>
        <title>About Us | Sowgandhika Flowers</title>
        <meta name="description" content="Learn the story of Sowgandhika Flowers. We are an artisanal flower studio in Hyderabad delivering farm-fresh, custom-wrapped flower arrangements, Pooja flowers, and traditional garlands." />
        <link rel="canonical" href="https://sowgandhikafreshflowers.com/about" />
      </Helmet>

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <div className="about-badge">
            <img src={logo} alt="Sowgandhika" style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: '3px solid #C9A86A', boxShadow: '0 4px 24px rgba(201,168,106,0.35)' }} />
          </div>
          <h1 className="about-hero-title">Our Story</h1>
          <p className="about-hero-sub">Born from a love of blooms &amp; tradition — delivered to your doorstep</p>
        </div>
      </section>

      {/* ── STORY SECTION ── */}
      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-story-img-col">
            <div className="about-story-img-frame">
              <img
                src="https://res.cloudinary.com/dwgqfg2xc/image/upload/v1782584364/WhatsApp_Image_2026-06-27_at_16.06.51_n1ra0k.jpg"
                alt="Sowgandhika flowers"
                className="about-story-img"
              />
              <div className="about-story-img-badge">
                <span style={{ fontSize: "1.6rem" }}>✿</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.8rem", color: "var(--color-accent)", letterSpacing: 1 }}>EST. 2025</span>
              </div>
            </div>
          </div>
          <div className="about-story-text-col">
            <span className="section-tag-a">Who We Are</span>
            <h2 className="about-section-title">More Than a Flower Shop</h2>
            <div className="about-divider" />
            <p className="about-body">
              Sowgandhika was born in 2025 from a deeply personal love for flowers — their fragrance, their emotion,
              their ability to transform any moment into something sacred. What began as a small pooja flower delivery
              has grown into Hyderabad's most trusted artisanal flower studio.
            </p>
            <p className="about-body">
              We believe every bloom has a story. Whether it's the marigold that adorns your morning pooja, the jasmine
              Poola Jada braided into a bride's hair, or the rose bouquet that says "I love you" — we handle every
              flower with the reverence it deserves.
            </p>
            <p className="about-body">
              From farm to your doorstep in hours, never days. That's our promise. That's Sowgandhika.
            </p>
            <Link to="/products" className="btn-primary about-cta" style={{ textDecoration: "none", display: "inline-block", marginTop: "1.5rem" }}>
              Explore Our Flowers
            </Link>
          </div>
        </div>
      </section>

      {/* ── MILESTONES ── */}
      <section className="about-milestones">
        <div className="about-milestones-inner">
          {MILESTONES.map(m => (
            <div key={m.label} className="milestone-card">
              <span className="milestone-year">{m.year}</span>
              <span className="milestone-label">{m.label}</span>
              <p className="milestone-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="about-values">
        <div className="about-values-inner">
          <div className="about-values-header">
            <span className="section-tag-a">Our Principles</span>
            <h2 className="about-section-title">Why Sowgandhika?</h2>
            <div className="about-divider" style={{ margin: "1rem auto" }} />
            <p className="about-section-sub">Six pillars that make every order extraordinary</p>
          </div>
          <div className="values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      {/* <section className="about-team">
        <div className="about-team-inner">
          <div className="about-values-header">
            <span className="section-tag-a">The People</span>
            <h2 className="about-section-title">Meet Our Team</h2>
            <div className="about-divider" style={{ margin: "1rem auto" }} />
            <p className="about-section-sub">Passionate artisans behind every bloom</p>
          </div>
          <div className="team-grid">
            {TEAM.map(t => (
              <div key={t.name} className="team-card">
                <div className="team-img-wrap">
                  <img src={t.img} alt={t.name} className="team-img" loading="lazy" />
                  <div className="team-img-overlay" />
                </div>
                <div className="team-info">
                  <h3 className="team-name">{t.name}</h3>
                  <p className="team-role">{t.role}</p>
                  <p className="team-quote">"{t.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── CLOSING CTA BANNER ── */}
      <section className="about-cta-banner">
        <div className="about-cta-overlay" />
        <div className="about-cta-content">
          <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>✿</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#FAF7F2", margin: "0 0 1rem" }}>
            Experience the Sowgandhika Difference
          </h2>
          <p style={{ color: "rgba(250,247,242,0.85)", marginBottom: "2rem", fontSize: "1.1rem", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Join hundreds of families in Hyderabad who start every day with fresh flowers from us.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/products" className="btn-primary" style={{ textDecoration: "none", padding: "0.9rem 2.2rem" }}>Shop Now</Link>
            <Link to="/subscriptions" style={{ textDecoration: "none", padding: "0.9rem 2.2rem", border: "1px solid #FAF7F2", color: "#FAF7F2", fontFamily: "'Playfair Display', serif", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.95rem", transition: "0.2s" }}>
              Subscribe
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
