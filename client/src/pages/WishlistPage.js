import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useAuth();
  const [moving, setMoving] = useState(false);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data } = await axios.get('http://localhost:5000/api/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load wishlist");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (error) {
      toast.error("Could not remove item");
    }
  };

  // --- BULK ACTION: MOVE ALL TO CART ---
  const handleMoveAll = async () => {
    if (wishlist.length === 0) return;
    setMoving(true);
    let addedCount = 0;
    let skippedCount = 0;
    const token = localStorage.getItem('token');

    try {
      // Iterate through all items
      for (const product of wishlist) {
        // Check if product requires variant selection
        const requiresVariant = product.hasVariations || (product.variants && product.variants.length > 0);

        // If it requires variant, we SKIP it
        if (requiresVariant) {
          skippedCount++;
          continue;
        }

        // Verify stock (simple product)
        if (product.countInStock === 0) {
          skippedCount++; // count out of stock as skipped
          continue;
        }

        // Add to Cart
        await axios.post('http://localhost:5000/api/cart/add', {
          productId: product._id,
          quantity: 1
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }); // Calling API directly to ensure async await works properly for sequential add

        // Remove from Wishlist
        await axios.delete(`http://localhost:5000/api/users/wishlist/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        addedCount++;
      }

      // Feedback
      if (addedCount > 0) {
        toast.success(`Moved ${addedCount} items to Cart`);
        // Refresh Component State
        fetchWishlist();
        // We should ideally refresh cart too, but pure context might not update till refresh. 
        // In a real app we'd call a context refresher. 
        // We'll rely on the user navigating or the app re-fetching.
        window.location.reload(); // Hard refresh to ensure cart/wishlist sync for now, simple & robust.
      }

      if (skippedCount > 0) {
        toast(`Skipped ${skippedCount} items (Select size manually)`, {
          icon: 'ℹ️',
          duration: 4000
        });
      }

    } catch (error) {
      console.error(error);
      toast.error("Error moving items");
    } finally {
      setMoving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--abyss)',
        color: 'var(--fog)'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ minHeight: '100vh', background: 'var(--abyss)', padding: '140px 4% 80px' }}>

      {/* SCOPED STYLES FOR TIGHTER GRID */}
      <style>{`
        .wishlist-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--space-md);
        }
        .wishlist-card {
            background: rgba(255,255,255,0.02);
            border: var(--border-subtle);
            position: relative;
            transition: transform 0.3s;
        }
        .wishlist-card:hover {
            transform: translateY(-4px);
            border-color: var(--border-light);
            background: rgba(255,255,255,0.04);
        }
        .wishlist-img-container {
            aspect-ratio: 3/4;
            width: 100%;
            overflow: hidden;
            background: #000;
        }
        .wishlist-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.9;
            transition: transform 0.5s;
        }
        .wishlist-card:hover .wishlist-img {
            transform: scale(1.05);
            opacity: 1;
        }
        .wishlist-details {
            padding: 12px;
        }
        .wishlist-title {
            font-size: 0.85rem;
            color: var(--ivory);
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .wishlist-price {
            font-size: 0.8rem;
            color: var(--gold);
            font-weight: 500;
        }
        .move-all-btn {
            background: transparent;
            border: 1px solid var(--gold);
            color: var(--gold);
            padding: 8px 16px;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            cursor: pointer;
            transition: all 0.3s;
        }
        .move-all-btn:hover:not(:disabled) {
            background: var(--gold);
            color: var(--abyss);
        }
        .move-all-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: var(--stone);
            color: var(--stone);
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: 'var(--space-2xl)',
          paddingBottom: 'var(--space-md)',
          borderBottom: 'var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--ivory)',
              fontStyle: 'italic'
            }}>
              Saved Pieces
            </h1>
            <p style={{ color: 'var(--fog)', fontSize: '0.9rem', marginTop: 'var(--space-2xs)' }}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              className="move-all-btn"
              onClick={handleMoveAll}
              disabled={moving}
            >
              {moving ? 'Processing...' : 'Move All to Bag'}
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-4xl)' }}>
            <h2 className="display-md" style={{ marginBottom: 'var(--space-md)' }}>
              Nothing saved yet
            </h2>
            <p style={{ color: 'var(--fog)', marginBottom: 'var(--space-2xl)' }}>
              Save pieces you love to revisit them later.
            </p>
            <Link to="/" className="btn-primary">
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div key={product._id} className="wishlist-card">
                <button
                  onClick={() => handleRemove(product._id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(5,5,5,0.6)',
                    border: 'none',
                    color: 'var(--ivory)',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(4px)',
                    borderRadius: '50%'
                  }}
                  title="Remove"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>

                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                  <div className="wishlist-img-container">
                    <img src={product.imageUrl} alt={product.name} className="wishlist-img" />
                  </div>
                  <div className="wishlist-details">
                    <h3 className="wishlist-title">{product.name}</h3>
                    <p className="wishlist-price">₹{product.price.toLocaleString('en-IN')}</p>

                    {/* Size Warning Indicator if variant needed */}
                    {(product.hasVariations || (product.variants && product.variants.length > 0)) && (
                      <span style={{
                        fontSize: '0.65rem',
                        color: 'var(--stone)',
                        display: 'block',
                        marginTop: '4px',
                        fontStyle: 'italic'
                      }}>
                        Select size to add
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;