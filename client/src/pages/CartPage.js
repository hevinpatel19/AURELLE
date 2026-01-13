import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, removeFromCart, updateCartQuantity, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Animation state for removed items
  const [removingItem, setRemovingItem] = useState(null);

  // Safe cart array
  const cartItems = Array.isArray(cart) ? cart : [];

  // Safe price getter
  const getItemPrice = (item) => {
    if (!item?.product) return 0;
    return typeof item.product.price === 'number' ? item.product.price : 0;
  };

  // Safe image getter
  const getItemImage = (item) => {
    const url = item?.product?.imageUrl;
    return (url && typeof url === 'string' && url.trim() !== '') ? url : null;
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = getItemPrice(item);
      const quantity = item?.quantity ?? 0;
      return acc + (price * quantity);
    }, 0);
  };

  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    // API returns discountPercentage
    if (appliedCoupon.discountPercentage) {
      return Math.round(subtotal * (appliedCoupon.discountPercentage / 100));
    }
    return 0;
  };

  // Calculate total
  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscount());
  };

  // Handle coupon apply - REAL API CALL
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      // Call backend API
      const { data } = await axios.post(`${API_BASE_URL}/api/coupons/validate`, {
        couponCode: couponCode.trim()
      });

      if (data) {
        setAppliedCoupon({
          code: data.code,
          discountPercentage: data.discountPercentage,
          label: `${data.discountPercentage}% OFF`
        });
        setCouponCode('');
        toast.success(`Coupon applied: ${data.discountPercentage}% OFF`);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  // Handle quantity change
  const handleQuantityChange = (productId, size, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartQuantity(productId, newQuantity, size);
  };

  // Handle remove with animation
  const handleRemoveItem = (productId, size) => {
    setRemovingItem(`${productId}-${size}`);
    setTimeout(() => {
      removeFromCart(productId, size);
      setRemovingItem(null);
      toast.success('Removed from bag');
    }, 300);
  };

  // Checkout navigation
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      return navigate('/login');
    }
    navigate('/checkout', {
      state: {
        appliedCoupon,
        discountedTotal: calculateTotal()
      }
    });
  };

  // Inline styles for animations
  const itemStyle = (productId, size) => ({
    opacity: removingItem === `${productId}-${size}` ? 0 : 1,
    transform: removingItem === `${productId}-${size}` ? 'translateX(-20px)' : 'translateX(0)',
    transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
  });

  return (
    <div className="cart-page">
      <div className="cart-container" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div className="cart-header">
          <h1 className="cart-title">Your Bag</h1>
          <p className="cart-count">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <h2>Nothing here yet</h2>
            <p>Your bag is waiting to be filled with exceptional pieces.</p>
            <Link to="/" className="btn-primary" style={{ marginTop: 'var(--space-xl)' }}>
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 'var(--space-3xl)',
            alignItems: 'start'
          }} className="cart-layout">

            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map((item, index) => {
                const product = item?.product || {};
                const productId = product._id;
                const productName = product.name || 'Product';
                const imageUrl = getItemImage(item);
                const itemPrice = getItemPrice(item);
                const quantity = item?.quantity ?? 1;
                const size = item?.size || null;
                const lineTotal = itemPrice * quantity;

                return (
                  <div
                    key={`${productId || index}-${size || ''}-${index}`}
                    style={{
                      ...itemStyle(productId, size),
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr',
                      gap: 'var(--space-lg)',
                      padding: 'var(--space-lg) 0',
                      borderBottom: 'var(--border-subtle)'
                    }}
                    className="cart-item-row"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/product/${productId}`}
                      style={{
                        width: '100px',
                        height: '130px',
                        background: 'var(--charcoal)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative'
                      }}
                      className="cart-item-image-link"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={productName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--stone)',
                          fontSize: '0.55rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}>
                          No Image
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
                      {/* Top: Name, Size, Remove */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Link
                            to={`/product/${productId}`}
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              color: 'var(--ivory)',
                              textDecoration: 'none',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ivory)'}
                          >
                            {productName}
                          </Link>
                          {size && (
                            <p style={{
                              fontSize: '0.75rem',
                              color: 'var(--fog)',
                              marginTop: 'var(--space-2xs)'
                            }}>
                              Size: <span style={{ color: 'var(--mist)' }}>{size}</span>
                            </p>
                          )}
                          <p style={{
                            fontSize: '0.8rem',
                            color: 'var(--fog)',
                            marginTop: 'var(--space-xs)'
                          }}>
                            ₹{itemPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(productId, size)}
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--stone)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--burgundy)';
                            e.currentTarget.style.background = 'rgba(114, 47, 55, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--stone)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                          aria-label="Remove item"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Bottom: Quantity & Total */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        {/* Quantity Controls */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: 'var(--slate)',
                          border: 'var(--border-subtle)',
                          transition: 'border-color 0.2s',
                          position: 'relative',
                          zIndex: 2
                        }}
                          className="quantity-wrapper"
                        >
                          <button
                            onClick={() => handleQuantityChange(productId, size, quantity - 1)}
                            disabled={quantity <= 1}
                            style={{
                              width: '34px',
                              height: '34px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              color: quantity <= 1 ? 'var(--iron)' : 'var(--mist)',
                              cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                              fontSize: '1rem',
                              transition: 'all 0.15s'
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            width: '32px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: 'var(--ivory)',
                            fontSize: '0.85rem'
                          }}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(productId, size, quantity + 1)}
                            style={{
                              width: '34px',
                              height: '34px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--mist)',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              transition: 'all 0.15s'
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div style={{
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: 'var(--gold)'
                        }}>
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div style={{
              background: 'var(--charcoal)',
              border: 'var(--border-subtle)',
              padding: 'var(--space-xl)',
              position: 'sticky',
              top: '100px'
            }} className="cart-summary-sidebar">
              <h3 style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--fog)',
                marginBottom: 'var(--space-lg)',
                paddingBottom: 'var(--space-sm)',
                borderBottom: 'var(--border-subtle)'
              }}>
                Order Summary
              </h3>

              {/* Coupon Section */}
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--mist)',
                  marginBottom: 'var(--space-xs)'
                }}>
                  Promo Code
                </label>

                {appliedCoupon ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--gold-glow)',
                    border: '1px solid var(--gold)',
                    padding: 'var(--space-sm) var(--space-md)',
                    transition: 'all 0.3s'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: '600' }}>
                        {appliedCoupon.code}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--fog)', marginLeft: 'var(--space-xs)' }}>
                        ({appliedCoupon.label})
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--mist)',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter code"
                        style={{
                          flex: 1,
                          padding: 'var(--space-sm) var(--space-md)',
                          background: 'var(--slate)',
                          border: couponError ? '1px solid var(--burgundy)' : 'var(--border-subtle)',
                          color: 'var(--ivory)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon}
                        style={{
                          padding: 'var(--space-sm) var(--space-md)',
                          background: 'var(--slate)',
                          border: 'var(--border-light)',
                          color: 'var(--ivory)',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--burgundy)',
                        marginTop: 'var(--space-2xs)',
                        transition: 'all 0.2s'
                      }}>
                        {couponError}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Price Breakdown - NO SHIPPING LINE */}
              <div style={{ borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-xs)',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ color: 'var(--fog)' }}>Subtotal</span>
                  <span style={{ color: 'var(--mist)' }}>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-xs)',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ color: 'var(--fog)' }}>Discount</span>
                    <span style={{ color: 'var(--gold)' }}>−₹{calculateDiscount().toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div style={{
                borderTop: 'var(--border-light)',
                marginTop: 'var(--space-md)',
                paddingTop: 'var(--space-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--fog)'
                }}>
                  Total
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.75rem',
                  fontWeight: '400',
                  color: 'var(--gold)',
                  transition: 'all 0.3s'
                }}>
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: 'var(--space-lg)',
                  padding: 'var(--space-md)',
                  fontSize: '0.7rem'
                }}
              >
                <span>Proceed to Checkout</span>
              </button>

              {/* Continue Shopping */}
              <Link
                to="/"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: 'var(--space-md)',
                  fontSize: '0.7rem',
                  color: 'var(--fog)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mist)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fog)'}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 900px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
            gap: var(--space-2xl) !important;
          }
          .cart-summary-sidebar {
            position: relative !important;
            top: 0 !important;
          }
        }
        @media (max-width: 600px) {
          .cart-item-row {
            grid-template-columns: 80px 1fr !important;
            gap: var(--space-md) !important;
            min-height: auto;
          }
          .cart-item-image-link {
            width: 80px !important;
            height: 100px !important;
          }
        }
        .cart-item-image-link:hover img {
          transform: scale(1.05);
        }
        .quantity-wrapper:hover {
          border-color: var(--border-light) !important;
        }
      `}</style>
    </div>
  );
};

export default CartPage;
