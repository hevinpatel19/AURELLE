import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_51STyR8IkuLiRZrCBt3MgxdMfWISebWu7LDSTUYarsLWYdkGZ4eluBnbUB7UP8BG8hYaVinhDDcJ7nGUhTsScaaZq00rw102IfK');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, user, clearCart } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // UPI
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Coupon from CartPage
  const appliedCoupon = location.state?.appliedCoupon || null;
  const discountedTotal = location.state?.discountedTotal || null;

  // Safe cart array
  const cartItems = Array.isArray(cart) ? cart : [];

  // Safe price getter - reads from item.product (populated from API)
  const getItemPrice = (item) => {
    if (!item?.product) return 0;
    const price = item.product.price ?? 0;
    return typeof price === 'number' ? price : 0;
  };

  // Calculate subtotal safely
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = getItemPrice(item);
      const quantity = item?.quantity ?? 0;
      return acc + (price * quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Ensure finalTotal is always a valid number
  const finalTotal = (() => {
    if (discountedTotal !== null && typeof discountedTotal === 'number' && !isNaN(discountedTotal)) {
      return discountedTotal;
    }
    return subtotal;
  })();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  const defaultAddress = profileData?.addresses?.find(addr => addr.isDefault) || profileData?.addresses?.[0];

  const createOrder = async (paymentResult, isPaid) => {
    const token = localStorage.getItem('token');
    const orderItems = cartItems.map(item => ({
      name: item?.product?.name || 'Product',
      qty: item?.quantity || 1,
      price: getItemPrice(item),
      image: item?.product?.imageUrl || '',
      product: item?.product?._id,
      size: item?.size || null // Fix: backend expects 'size' not 'selectedSize'
    }));

    const { data } = await axios.post('http://localhost:5000/api/orders', {
      orderItems,
      shippingAddress: defaultAddress,
      paymentMethod,
      totalPrice: finalTotal,
      isPaid,
      paymentResult,
      couponCode: appliedCoupon?.code || null
    }, { headers: { Authorization: `Bearer ${token}` } });

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!defaultAddress) {
      toast.error('Please add a shipping address in your profile');
      setLoading(false);
      return navigate('/profile', { state: { fromCart: true } });
    }

    try {
      if (paymentMethod === 'card') {
        if (!stripe || !elements) return;

        const { data: { clientSecret } } = await axios.post(
          'http://localhost:5000/api/payment/create-payment-intent',
          { amount: Math.round(finalTotal * 100) }
        );

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name: user?.name || 'Customer' }
          }
        });

        if (result.error) {
          toast.error(result.error.message);
        } else if (result.paymentIntent.status === 'succeeded') {
          await createOrder({ id: result.paymentIntent.id, status: 'succeeded' }, true);
          clearCart();
          toast.success('Order placed successfully');
          navigate('/orders');
        }
      } else if (paymentMethod === 'upi') {
        if (!upiVerified) {
          toast.error('Please verify your UPI ID first');
          setLoading(false);
          return;
        }
        await createOrder({ id: `UPI-${Date.now()}`, status: 'pending_verification' }, false);
        clearCart();
        toast.success('Order placed! UPI payment pending.');
        navigate('/orders');
      } else {
        // COD
        await createOrder({ id: `COD-${Date.now()}`, status: 'cod' }, false);
        clearCart();
        toast.success('Order placed! Pay on delivery.');
        navigate('/orders');
      }
    } catch (error) {
      toast.error('Order failed. Please try again.');
    }

    setLoading(false);
  };

  const cardStyle = {
    base: {
      fontSize: '16px',
      color: '#E8E8E8',
      fontFamily: 'Archivo, sans-serif',
      '::placeholder': { color: '#555555' }
    },
    invalid: { color: '#722F37' }
  };

  // Format total safely
  const formatTotal = (value) => {
    const num = typeof value === 'number' && !isNaN(value) ? value : 0;
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Complete your order</p>

        {/* Order Summary */}
        <div style={{
          background: 'var(--slate)',
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-2xl)',
          border: 'var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <span style={{ color: 'var(--fog)' }}>Subtotal</span>
            <span style={{ color: 'var(--ivory)' }}>₹{formatTotal(subtotal)}</span>
          </div>
          {appliedCoupon && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
              <span style={{ color: 'var(--gold)' }}>Discount ({appliedCoupon.code})</span>
              <span style={{ color: 'var(--gold)' }}>-₹{formatTotal(subtotal - finalTotal)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-md)',
            borderTop: 'var(--border-subtle)',
            marginTop: 'var(--space-sm)'
          }}>
            <span style={{ color: 'var(--ivory)', fontWeight: '600' }}>Total</span>
            <span style={{ color: 'var(--gold)', fontSize: '1.25rem', fontWeight: '600' }}>
              ₹{formatTotal(finalTotal)}
            </span>
          </div>
        </div>

        {/* Shipping */}
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <span className="label" style={{ display: 'block', marginBottom: 'var(--space-md)', color: 'var(--gold)' }}>
            Shipping Address
          </span>
          {defaultAddress ? (
            <div style={{ color: 'var(--fog)', lineHeight: '1.8' }}>
              <p>{defaultAddress.address}</p>
              <p>{defaultAddress.city}, {defaultAddress.state} — {defaultAddress.postalCode}</p>
              <p>{defaultAddress.country}</p>
            </div>
          ) : (
            <button
              onClick={() => navigate('/profile', { state: { fromCart: true } })}
              className="btn-ghost"
            >
              Add address →
            </button>
          )}
        </div>

        {/* Payment Method */}
        <form onSubmit={handleSubmit}>
          <span className="label" style={{ display: 'block', marginBottom: 'var(--space-lg)', color: 'var(--gold)' }}>
            Payment Method
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
            {[
              { id: 'card', label: 'Credit / Debit Card' },
              { id: 'upi', label: 'UPI' },
              { id: 'cod', label: 'Cash on Delivery' }
            ].map(method => (
              <label
                key={method.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  background: paymentMethod === method.id ? 'var(--gold-glow)' : 'var(--slate)',
                  border: paymentMethod === method.id ? 'var(--border-gold)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: 'var(--gold)' }}
                />
                <span style={{ color: 'var(--ivory)' }}>{method.label}</span>
              </label>
            ))}
          </div>

          {/* Card Input */}
          {paymentMethod === 'card' && (
            <div style={{
              padding: 'var(--space-lg)',
              background: 'var(--slate)',
              border: 'var(--border-subtle)',
              marginBottom: 'var(--space-xl)'
            }}>
              <CardElement options={{ style: cardStyle, hidePostalCode: true }} />
            </div>
          )}

          {/* UPI Input */}
          {paymentMethod === 'upi' && (
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <input
                  type="text"
                  placeholder="username@upi"
                  className="form-input"
                  value={upiId}
                  onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }}
                  style={{
                    flex: 1,
                    padding: 'var(--space-md)',
                    background: 'var(--slate)',
                    border: 'var(--border-light)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (upiId.includes('@')) {
                      setUpiVerified(true);
                      toast.success('UPI verified');
                    } else {
                      toast.error('Invalid UPI ID');
                    }
                  }}
                  className="btn-outline"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Verify
                </button>
              </div>
              {upiVerified && (
                <p style={{ marginTop: 'var(--space-sm)', color: 'var(--gold)', fontSize: '0.85rem' }}>
                  ✓ UPI ID verified
                </p>
              )}
            </div>
          )}

          {/* COD Info */}
          {paymentMethod === 'cod' && (
            <div style={{
              padding: 'var(--space-lg)',
              background: 'var(--wine)',
              border: '1px solid var(--burgundy)',
              marginBottom: 'var(--space-xl)',
              color: 'var(--mist)',
              fontSize: '0.9rem'
            }}>
              Pay ₹{formatTotal(finalTotal)} when your order arrives.
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !defaultAddress}
          >
            {loading ? 'Processing...' : `Pay ₹${formatTotal(finalTotal)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutPage;