import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom'; 
import toast from 'react-hot-toast';

// Replace with your actual Publishable Key
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

  // --- GET DISCOUNT DATA FROM CART PAGE ---
  const { discountPercent = 0, couponCode = null } = location.state || {};

  // --- UPI STATES ---
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
           const { data } = await axios.get('http://localhost:5000/api/users/profile', {
              headers: { Authorization: `Bearer ${token}` }
           });
           setProfileData(data);
        }
      } catch (error) {
        console.error("Could not fetch profile address", error);
      }
    };
    fetchLatestProfile();
  }, []);

  // --- UPDATED CALCULATION LOGIC ---
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.round(subtotal - discountAmount); 

  // --- VERIFY UPI MOCK ---
  const handleVerifyUpi = () => {
    if (!upiId.includes('@')) {
        toast.error("Invalid UPI ID format (must contain '@')");
        return;
    }
    setVerifyingUpi(true);
    setTimeout(() => {
        setVerifyingUpi(false);
        setIsUpiVerified(true);
        toast.success("UPI ID Verified Successfully!");
    }, 1500);
  };

  // --- PLACE ORDER LOGIC (FIXED) ---
  const placeOrder = async (methodType, isPaidStatus) => {
      try {
          const token = localStorage.getItem('token');
          const shippingSource = profileData || user || {};

          const orderData = {
            orderItems: cart.map(item => ({
              name: item.product.name,
              qty: item.quantity,
              image: item.product.imageUrl,
              price: item.product.price,
              product: item.product._id,
              size: item.size // <--- CRITICAL FIX: INCLUDE SIZE HERE
            })),
            shippingAddress: {
              address: shippingSource.address || "No Address Provided", 
              city: shippingSource.city || "No City",
              postalCode: shippingSource.postalCode || "000000",
              country: shippingSource.country || "India"
            },
            paymentMethod: methodType,
            totalPrice: finalTotal, 
            isPaid: isPaidStatus 
          };

          await axios.post('http://localhost:5000/api/orders', orderData, {
            headers: { Authorization: `Bearer ${token}` }
          });

          toast.success("Order Placed Successfully!");
          if (clearCart) clearCart();
          setTimeout(() => navigate('/orders'), 2000);

      } catch (error) {
          console.error("Order Save Error:", error);
          toast.error("Failed to save order.");
      }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (paymentMethod === 'card') {
        if (!stripe || !elements) return;
        try {
            const { data: { clientSecret } } = await axios.post(
                'http://localhost:5000/api/payment/create-payment-intent', 
                { amount: finalTotal * 100 } 
            );
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: { name: user?.name || 'Customer' },
                },
            });
            if (result.error) {
                toast.error(result.error.message);
            } else if (result.paymentIntent.status === 'succeeded') {
                await placeOrder("Card", true);
            }
        } catch (error) {
            toast.error("Card Payment Failed");
        }
    } 
    else if (paymentMethod === 'cod') {
        await placeOrder("COD", false);
    }
    else if (paymentMethod === 'upi') {
        if (isUpiVerified) {
            await placeOrder("UPI", true);
        } else {
            toast.error("Please verify your UPI ID first");
        }
    }
    setLoading(false);
  };

  // --- STYLES ---
  const optionStyle = (isActive) => ({
    border: `1px solid ${isActive ? '#1a1a1a' : '#eee'}`,
    background: isActive ? '#fafafa' : 'white',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column'
  });

  const radioHeaderStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: '600' };
  
  return (
    <form onSubmit={handleSubmit}>
      
      <div style={{ marginBottom: '2rem', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h4 style={{fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px', color: '#555', textTransform:'uppercase'}}>Shipping To:</h4>
          {profileData ? (
             <p style={{fontSize: '0.95rem', margin: 0, color: '#333'}}>
                {profileData.address || "No address set"}<br/>
                {profileData.city || "No city"} - {profileData.postalCode || "000000"}
             </p>
          ) : (
             <p style={{fontSize: '0.8rem', color: '#888'}}>Loading address...</p>
          )}
      </div>

      <h3 style={{fontSize: '1.1rem', fontWeight:'800', marginBottom:'1rem', textTransform:'uppercase'}}>Select Payment Method</h3>

      {/* --- OPTION 1: CARD --- */}
      <div style={optionStyle(paymentMethod === 'card')} onClick={() => setPaymentMethod('card')}>
         <div style={radioHeaderStyle}>
            <input type="radio" checked={paymentMethod === 'card'} readOnly />
            Credit / Debit Card
         </div>
         {paymentMethod === 'card' && (
            <div style={{ marginTop: '1rem', paddingLeft: '1.8rem', animation: 'fadeIn 0.3s' }}>
                <div className="stripe-box" style={{ padding: '10px', background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <CardElement options={{
                        style: {
                            base: { fontSize: '16px', color: '#0f172a', fontFamily: '"Manrope", sans-serif', '::placeholder': { color: '#aab7c4' } },
                            invalid: { color: '#ef4444' },
                        },
                    }} />
                </div>
            </div>
         )}
      </div>

      {/* --- OPTION 2: UPI --- */}
      <div style={optionStyle(paymentMethod === 'upi')} onClick={() => setPaymentMethod('upi')}>
         <div style={radioHeaderStyle}>
            <input type="radio" checked={paymentMethod === 'upi'} readOnly />
            UPI / NetBanking
         </div>
         {paymentMethod === 'upi' && (
            <div style={{ marginTop: '1rem', paddingLeft: '1.8rem', animation: 'fadeIn 0.3s' }}>
               <p style={{ fontSize: '0.9rem', color: '#666', marginBottom:'0.5rem' }}>Enter your Virtual Payment Address (VPA):</p>
               <div style={{ display: 'flex', gap: '10px' }}>
                   <input 
                      type="text" 
                      placeholder="e.g. user@oksbi" 
                      value={upiId}
                      onChange={(e) => {
                          setUpiId(e.target.value);
                          setIsUpiVerified(false);
                      }}
                      style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' }}
                   />
                   <button 
                      type="button" 
                      onClick={handleVerifyUpi}
                      disabled={verifyingUpi || isUpiVerified}
                      style={{ 
                          background: isUpiVerified ? '#166534' : '#1a1a1a', 
                          color: 'white', border: 'none', padding: '0 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
                      }}
                   >
                      {verifyingUpi ? '...' : isUpiVerified ? 'Verified ✓' : 'Verify'}
                   </button>
               </div>
               {isUpiVerified && <p style={{ color: '#166534', fontSize: '0.8rem', marginTop: '5px' }}><strong>Note:</strong> This is a simulation. No real money will be deducted.</p>}
            </div>
         )}
      </div>

      {/* --- OPTION 3: COD --- */}
      <div style={optionStyle(paymentMethod === 'cod')} onClick={() => setPaymentMethod('cod')}>
         <div style={radioHeaderStyle}>
            <input type="radio" checked={paymentMethod === 'cod'} readOnly />
            Cash on Delivery
         </div>
         {paymentMethod === 'cod' && (
            <div style={{ marginTop: '1rem', paddingLeft: '1.8rem', animation: 'fadeIn 0.3s' }}>
               <div style={{ background: '#ecfdf5', padding: '15px', borderRadius: '6px', border: '1px solid #a7f3d0', color: '#065f46', display:'flex', gap:'12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🚚</span>
                  <div>
                      <strong style={{ display:'block', marginBottom:'4px' }}>Pay upon delivery</strong>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                         You can pay via Cash or UPI when the delivery agent arrives at your doorstep.
                      </div>
                  </div>
               </div>
               <ul style={{ marginTop: '1rem', color: '#666', fontSize: '0.85rem', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                  <li>Please keep exact change handy to avoid inconvenience.</li>
                  <li>We do not accept old notes or foreign currency.</li>
               </ul>
            </div>
         )}
      </div>

      {/* SUBMIT BUTTON */}
      <button 
        type="submit" 
        disabled={
            loading || 
            (paymentMethod === 'card' && (!stripe || !elements)) ||
            (paymentMethod === 'upi' && !isUpiVerified)
        } 
        className="btn-pay" 
        style={{ marginTop: '1rem', opacity: (paymentMethod === 'upi' && !isUpiVerified) ? 0.6 : 1 }}
      >
        {loading ? "Processing..." : paymentMethod === 'cod' ? "Place Order (COD)" : `Pay ₹${finalTotal.toLocaleString()}`}
      </button>
      
      {/* SHOW COUPON INFO IF APPLIED */}
      {discountPercent > 0 && (
          <div style={{ textAlign:'center', marginTop:'10px', color:'#166534', fontSize:'0.9rem', fontWeight:'bold' }}>
              🎉 Coupon "{couponCode}" applied! You saved {discountPercent}%
          </div>
      )}
      
      {paymentMethod === 'card' && (
          <div style={{textAlign:'center', marginTop:'1rem', fontSize:'0.8rem', color:'#888'}}>
            🔒 Secured by Stripe 256-bit encryption
          </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </form>
  );
};

const CheckoutPage = () => {
  return (
    <div className="checkout-wrapper">
      <div className="checkout-card">
        <h1 className="checkout-header">Secure Checkout</h1>
        <p className="checkout-sub">Complete your purchase safely.</p>
        
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default CheckoutPage;