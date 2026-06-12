import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PartyPopper, CheckCircle2, ChevronRight, ShoppingBag } from "lucide-react";

export default function OrderConfirmation() {
  
  // SVG drawing animation
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => {
      const delay = 0.5 + i * 0.5;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
          opacity: { delay, duration: 0.01 }
        }
      };
    }
  };

  return (
    <section className="section-pad" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        className="glass"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100, duration: 0.6 }}
        style={{ padding: '3.5rem 2.5rem', textAlign: 'center', maxWidth: 600, width: '100%', position: 'relative', overflow: 'hidden' }}
      >
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <motion.svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            initial="hidden"
            animate="visible"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="#27ae60"
              strokeWidth="5"
              fill="rgba(39, 174, 96, 0.1)"
              variants={draw}
              custom={0}
            />
            <motion.path
              d="M30 50 L45 65 L70 35"
              stroke="#27ae60"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="transparent"
              variants={draw}
              custom={1}
            />
          </motion.svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <PartyPopper size={32} color="var(--color-accent)" /> Order Confirmed!
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Thank you for choosing Sowgandhika. Your fresh flowers will be handpicked and prepared for delivery soon.
          </p>

          <div style={{ background: 'var(--color-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-accent)', marginBottom: '2.5rem', textAlign: 'left' }}>
            <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Order Number</p>
            <h3 style={{ margin: '0 0 1rem', color: 'var(--color-primary)', fontFamily: 'var(--mono)' }}>#SOW-{(Math.random() * 100000).toFixed(0)}</h3>
            <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Estimated Delivery</p>
            <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>Today, before 7:00 PM</h4>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn-outline" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
            <Link to="/my-orders" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Track Order <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
