import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../store/wishlistStore.jsx';
import { useCart } from '../store/cartStore.jsx';
import { CATEGORIES } from '../data/products.js';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart({
      ...product,
      unitQuantity: product.unitQuantity || product.quantity
    });
    removeFromWishlist(product.id);
  };

  return (
    <div className="wishlist-page">
      <Helmet>
        <title>My Wishlist | Sowgandhika Flowers</title>
      </Helmet>

      <div className="wishlist-container">
        <div className="wishlist-header">
          <Link to="/products" className="back-link">
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
          <h1 className="vintage-title" style={{ margin: '1rem 0' }}>My Wishlist</h1>
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <Heart size={48} strokeWidth={1} style={{ color: 'rgba(201,168,106,0.5)', marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Save items you love and buy them later.</p>
            <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Explore Flowers
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map(product => (
              <div key={product.id} className="wishlist-card">
                <div className="wishlist-img-area">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.img} alt={product.name} />
                  </Link>
                  <button className="wishlist-remove-btn" onClick={() => removeFromWishlist(product.id)} title="Remove">
                    ✕
                  </button>
                </div>
                <div className="wishlist-content">
                  <span className="wishlist-cat">
                    {CATEGORIES.find(c => c.key === product.category)?.label || product.category}
                  </span>
                  <Link to={`/product/${product.id}`} className="wishlist-name">
                    {product.name}
                  </Link>
                  <div className="wishlist-price-row">
                    <span className="wishlist-price">₹{Number(product.our_price).toFixed(2)}</span>
                    {product.mrp && <span className="wishlist-mrp">₹{Number(product.mrp).toFixed(2)}</span>}
                  </div>
                  <button className="btn-primary wishlist-add-btn" onClick={() => handleMoveToCart(product)}>
                    <ShoppingBag size={16} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
