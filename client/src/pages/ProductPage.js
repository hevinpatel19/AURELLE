import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Accordion State
  const [openSection, setOpenSection] = useState('details');

  useEffect(() => {
    // FORCE RESET ON ID CHANGE
    window.scrollTo(0, 0);
    setProduct(null);
    setLoading(true);
    setReviews([]);
    setRelatedProducts([]);
    setSelectedSize('');
    setQuantity(1);
    setIsWishlisted(false);

    const fetchProduct = async () => {
      if (!id) return;

      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        // Ensure we actually got the *correct* product (paranoia check)
        if (data._id === id) {
          setProduct(data);
          setReviews(data.reviews || []);

          // Auto-select first variant if available
          if (data.variants && data.variants.length > 0) {
            const inStockVariant = data.variants.find(v => v.stock > 0);
            if (inStockVariant) setSelectedSize(inStockVariant.value);
          }

          // Fetch Related Products (same category)
          if (data.category && data.category._id) {
            try {
              // Use the optimized endpoint if available, or fallback to filter
              // Ideally backend has /api/products/:id/related. 
              // Let's rely on client-side filter for safety as verified in prev steps
              const { data: allProducts } = await axios.get('http://localhost:5000/api/products');
              const filtered = allProducts
                .filter(p => p.category?._id === data.category._id && p._id !== data._id)
                .slice(0, 3);
              setRelatedProducts(filtered);
            } catch (err) {
              console.error("Related fetch error", err);
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Product fetch failed:", error);
        setLoading(false);
        toast.error("Failed to load product details");
      }
    };
    fetchProduct();
  }, [id]);

  // Wishlist Logic
  useEffect(() => {
    if (user && product) {
      const checkWishlist = async () => {
        try {
          const { data } = await axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          // Defensive check against undefined wishlist
          const wishlist = data.wishlist || [];

          // Check if product is in wishlist (handles ID strings or populated objects)
          const exists = wishlist.some(item => {
            const itemId = item._id || item;
            return itemId.toString() === product._id.toString();
          });

          setIsWishlisted(exists);
        } catch (err) {
          // Silent fail
        }
      };
      checkWishlist();
    }
  }, [user, product]);

  const toggleWishlist = async () => {
    if (!user) return toast.error('Please login to wishlist');
    try {
      const token = localStorage.getItem('token');
      if (isWishlisted) {
        await axios.delete(`http://localhost:5000/api/users/wishlist/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Removed from wishlist');
        setIsWishlisted(false);
      } else {
        await axios.post('http://localhost:5000/api/users/wishlist', {
          productId: product._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Added to wishlist');
        setIsWishlisted(true);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Wishlist action failed';
      toast.error(msg);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Check stock for simple product or variant
    if (product.hasVariations) {
      if (!selectedSize) return toast.error(`Please select a ${product.variationType || 'size'}`);
      const variant = product.variants.find(v => v.value === selectedSize);
      if (!variant || variant.stock < quantity) return toast.error('Selected option out of stock');
    } else {
      if (product.countInStock < quantity) return toast.error('Out of stock');
    }

    addToCart(product._id, quantity, selectedSize);
    toast.success('Added to Cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login first');
    try {
      await axios.post(`http://localhost:5000/api/products/${id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Review Submitted');
      setComment('');
      setRating(5);

      // Refresh product data to show new review
      const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(data);
      setReviews(data.reviews || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review failed');
    }
  };

  // Loading State
  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--abyss)',
        color: 'var(--fog)',
        paddingTop: '80px'
      }}>
        <div className="skeleton" style={{ width: '200px', height: '20px', borderRadius: '4px' }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '8rem', textAlign: 'center', minHeight: '60vh', color: 'var(--fog)', paddingTop: '150px' }}>
        <h2>Product not found</h2>
        <Link to="/" className="btn-outline" style={{ marginTop: '2rem' }}>Return Home</Link>
      </div>
    );
  }

  // Stock Check Helper
  const isVariantMode = product.hasVariations;
  // If variant mode but no size selected, we don't know stock yet (unless ALL variants out)
  const currentVariant = isVariantMode && selectedSize ? product.variants.find(v => v.value === selectedSize) : null;
  const variantOutOfStock = isVariantMode && selectedSize && currentVariant?.stock === 0;

  // Calculate max quantity based on selected variant or simple product stock
  const maxQuantity = isVariantMode
    ? (currentVariant?.stock || 1)
    : (product.countInStock || 1);

  // Overall out of stock check
  const isOutOfStock = isVariantMode
    ? product.variants.every(v => v.stock === 0)
    : product.countInStock === 0;

  return (
    <div className="product-page">
      <div className="product-layout">
        {/* ═══════════════════════════════════════════════════════════════════
            GALLERY
            ═══════════════════════════════════════════════════════════════════ */}
        <div className={`product-gallery ${isOutOfStock ? 'out-of-stock' : ''}`}>
          <img src={product.imageUrl} alt={product.name} />
          {isOutOfStock && (
            <span className="stock-badge">Sold Out</span>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            DETAILS
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="product-details">
          <span className="product-category">{product.category?.name || 'Collection'}</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
          <p className="product-description">{product.description}</p>

          {/* VARIANT SELECTOR */}
          {isVariantMode && product.variants?.length > 0 && (
            <div className="variant-section">
              <div className="variant-label">
                {product.variationType || 'Size'}: <span>{selectedSize}</span>
              </div>
              <div className="variant-options">
                {product.variants.map((variant) => (
                  <button
                    key={variant.value}
                    className={`variant-btn ${selectedSize === variant.value ? 'active' : ''} ${variant.stock === 0 ? 'disabled' : ''}`}
                    onClick={() => variant.stock > 0 && setSelectedSize(variant.value)}
                    disabled={variant.stock === 0}
                    type="button"
                  >
                    {variant.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="product-actions">
            <div className="quantity-selector">
              <button
                className="quantity-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="quantity-value">{quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => setQuantity(Math.min(quantity + 1, maxQuantity))}
                disabled={quantity >= maxQuantity}
              >
                +
              </button>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={isOutOfStock || (isVariantMode && selectedSize && variantOutOfStock)}
            >
              {isOutOfStock ? 'Sold Out' : (variantOutOfStock ? 'Size Sold Out' : 'Add to Bag')}
            </button>

            <button
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={toggleWishlist}
              aria-label="Toggle Wishlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* ACCORDION DETAILS */}
          <div style={{ borderTop: 'var(--border-subtle)', marginTop: 'var(--space-xl)' }}>
            {['details', 'shipping', 'returns'].map((section) => (
              <div key={section} style={{ borderBottom: 'var(--border-subtle)' }}>
                <button
                  onClick={() => setOpenSection(openSection === section ? '' : section)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-lg) 0',
                    color: 'var(--ivory)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  {section === 'details' && 'Product Details'}
                  {section === 'shipping' && 'Shipping & Delivery'}
                  {section === 'returns' && 'Returns & Exchanges'}
                  <span style={{
                    transition: 'transform 0.3s',
                    transform: openSection === section ? 'rotate(45deg)' : 'rotate(0)'
                  }}>+</span>
                </button>
                {openSection === section && (
                  <div style={{
                    paddingBottom: 'var(--space-lg)',
                    color: 'var(--fog)',
                    fontSize: '0.9rem',
                    lineHeight: '1.8'
                  }}>
                    {section === 'details' && (
                      <div className="product-details-content">
                        <p>{product.details || product.description}</p>
                        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--stone)' }}>
                          SKU: {product._id?.slice(-8).toUpperCase()}
                        </div>
                      </div>
                    )}
                    {section === 'shipping' && (
                      <p>Complimentary shipping on orders over ₹5,000. Standard delivery: 5-7 business days.</p>
                    )}
                    {section === 'returns' && (
                      <p>Free returns within 14 days. Items must be unworn with original tags.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          REVIEWS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="display-md" style={{ marginBottom: 'var(--space-2xl)', textAlign: 'center' }}>
            Reviews
          </h2>

          {reviews.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--fog)' }}>No reviews yet.</p>
          ) : (
            <div style={{ marginBottom: 'var(--space-3xl)' }}>
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                    <span style={{ color: 'var(--ivory)', fontWeight: '500' }}>{review.name}</span>
                    <span style={{ color: 'var(--gold)' }}>{'★'.repeat(review.rating)}</span>
                  </div>
                  <p style={{ color: 'var(--fog)', lineHeight: '1.7' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Review Form (Authenticated Only) */}
          {user && (
            <form onSubmit={handleReviewSubmit} style={{
              background: 'var(--charcoal)',
              padding: 'var(--space-2xl)',
              border: 'var(--border-subtle)'
            }}>
              <h3 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>
                Write a Review
              </h3>

              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        fontSize: '1.5rem',
                        color: star <= rating ? 'var(--gold)' : 'var(--iron)',
                        transition: 'color 0.2s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  className="form-input"
                  placeholder="Share your thoughts..."
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                <span>Submit Review</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          RELATED PRODUCTS
          ═══════════════════════════════════════════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <section className="section section-dark">
          <div className="section-header">
            <span className="section-eyebrow">You May Also Like</span>
            <h2 className="section-title">Related Products</h2>
          </div>

          <div className="product-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {relatedProducts.slice(0, 3).map((prod) => (
              <Link key={prod._id} to={`/product/${prod._id}`} className="product-card">
                <div className="product-card-image">
                  <img src={prod.imageUrl} alt={prod.name} />
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-name">{prod.name}</h3>
                  <p className="product-card-price">₹{prod.price.toLocaleString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;