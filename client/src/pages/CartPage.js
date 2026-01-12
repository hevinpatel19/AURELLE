import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from "../api";


const CartPage = () => {
  // These functions now accept (productId, ..., size)
  const { cart, removeFromCart, updateCartQuantity } = useAuth();
  const navigate = useNavigate();

  // --- COUPON STATE ---
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [appliedCodeName, setAppliedCodeName] = useState('');

  // --- CALCULATIONS ---
  const subtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = subtotal - discountAmount;

  // --- HANDLERS ---
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter a code");
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/coupons/validate`, { couponCode });

      setDiscountPercent(data.discountPercentage);
      setAppliedCodeName(data.code);
      setIsCouponApplied(true);
      toast.success(`Code ${data.code} applied!`);
    } catch (error) {
      setDiscountPercent(0);
      setIsCouponApplied(false);
      toast.error(error.response?.data?.message || "Invalid Coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setIsCouponApplied(false);
    setAppliedCodeName('');
    toast.success("Coupon removed");
  };

  const handleCheckoutClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      
      const { data } = await axios.get(`${API_BASE_URL}/api/users/profile`, {

        headers: { Authorization: `Bearer ${token}` }
      });

      if (!data.address || !data.city || !data.phone) {
        navigate('/profile', { state: { fromCart: true } });
      } else {
        navigate('/checkout', { 
            state: { discountPercent: discountPercent, couponCode: isCouponApplied ? appliedCodeName : null } 
        });
      }
    } catch (error) { navigate('/login'); }
  };

  return (
    <div className="cart-container">
      
      <style>{`
        /* PAGE LAYOUT */
        .cart-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 80px 50px; 
            font-family: 'Manrope', sans-serif;
        }

        /* HEADER */
        .page-title { 
            font-size: 2.5rem; 
            font-weight: 800;
            margin-top: 20px;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: -1px; 
            line-height: 1.1; } 
            
        .page-subtitle { 
            color: #666; 
            margin-top: 0;
            margin-bottom: 40px; 
            font-size: 1rem; } 
            
        /* TABLE HEADERS */ 
        .cart-header-row { 
            display: flex; 
            justify-content: space-between; 
            border-bottom: 1px solid #000; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
            font-weight: 700; 
            font-size: 0.8rem; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            color: #000; }

        /* CART ITEM ROW */
        .cart-row {
            display: flex;
            align-items: flex-start;
            padding: 30px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .product-image {
            width: 100px;
            aspect-ratio: 3/4;
            object-fit: cover;
            background: #f4f4f5;
            margin-right: 30px;
        }

        .product-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
        }

        .product-name {
            font-size: 1rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 15px;
            color: #000;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        /* SIZE BADGE STYLE */
        .size-badge {
            background: #f0f0f0;
            color: #333;
            font-size: 0.7rem;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-weight: 700;
        }

        /* QUANTITY BUTTONS */
        .qty-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .qty-btn {
            width: 35px;
            height: 35px;
            border: 1px solid #e5e5e5;
            background: #fff;
            color: #000;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .qty-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .qty-btn:not(:disabled):hover {
            background: #000;
            color: #fff;
            border-color: #000;
        }

        .qty-value {
            font-family: monospace;
            font-weight: 700;
            font-size: 1rem;
            min-width: 20px;
            text-align: center;
        }

        /* PRICE & REMOVE SECTION */
        .price-section {
            display: flex;
            align-items: center;
            gap: 20px;
            padding-top: 5px;
        }

        .price-text {
            font-family: monospace;
            font-weight: 700;
            font-size: 1.1rem;
            color: #000;
        }

        .remove-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #9ca3af;
            cursor: pointer;
            line-height: 1;
            padding: 0 5px;
            transition: color 0.2s;
        }
        .remove-btn:hover {
            color: #000;
        }

        /* SUMMARY & COUPON SECTION */
        .bottom-section {
            margin-top: 3rem;
            display: flex;
            justify-content: flex-end;
        }

        .summary-box {
            width: 100%;
            max-width: 400px;
        }

        .coupon-box {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #eee;
        }
        
        .coupon-label {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 10px;
            display: block;
        }

        .input-group {
            display: flex;
            gap: 10px;
        }
        
        .input-field {
            flex: 1;
            padding: 12px;
            border: 1px solid #e5e5e5;
            border-radius: 0;
            font-size: 0.9rem;
            outline: none;
        }
        
        /* APPLY BUTTON WITH ANIMATION */
        .apply-btn {
            background: #000;
            color: white;
            border: none;
            padding: 0 25px;
            font-weight: 700;
            font-size: 0.85rem;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .apply-btn:hover { 
            background: #000;
            transform: translateY(-2px); 
            box-shadow: 0 4px 10px rgba(0,0,0,0.15); 
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 0.9rem;
            color: #555;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 1.1rem;
            font-weight: 800;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* CHECKOUT BUTTON WITH ANIMATION */
        .checkout-btn {
            display: block;
            width: 100%;
            background: #000;
            color: white;
            padding: 18px;
            margin-top: 25px;
            border: none;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .checkout-btn:hover {
            background: #000;
            transform: translateY(-3px); 
            box-shadow: 0 10px 20px rgba(0,0,0,0.15); 
        }
      `}</style>

      {/* HEADER */}
      <h1 className="page-title">Shopping Bag</h1>
      <p className="page-subtitle">Check your items before proceeding.</p>
      
      {cart.length === 0 ? (
        <div style={{ textAlign:'center', padding:'6rem 2rem', background:'#f9f9f9', borderRadius:'8px' }}>
           <h3 style={{ textTransform:'uppercase', fontSize:'1.5rem', marginBottom:'1.5rem' }}>Your Bag is Empty</h3>
           <Link to="/" style={{ textDecoration:'underline', fontWeight:'700', color:'black' }}>
             Continue Shopping
           </Link>
        </div>
      ) : (
        <div>
          {/* TABLE HEADER */}
          <div className="cart-header-row">
            <span>Product Details</span>
            <span>Total</span>
          </div>

          {/* CART ITEMS */}
          {cart.map((item) => {
             if (!item.product) return null;
             
             const maxStock = item.product.countInStock || 0;
             // --- FIX: Create a unique key using ID + Size ---
             const uniqueKey = `${item.product._id}-${item.size}`;

             return (
              <div key={uniqueKey} className="cart-row">
                {/* Left: Image */}
                <img src={item.product.imageUrl} alt={item.product.name} className="product-image" />
                
                {/* Middle: Name, Size & Qty */}
                <div className="product-info">
                  <div className="product-name">
                    {item.product.name}
                    {/* --- FIX: Display Size --- */}
                    {item.size && <span className="size-badge">SIZE: {item.size}</span>}
                  </div>
                  
                  <div className="qty-wrapper">
                    <button 
                        className="qty-btn" 
                        // --- FIX: Pass item.size to update quantity ---
                        onClick={() => updateCartQuantity(item.product._id, item.quantity - 1, item.size)} 
                        disabled={item.quantity <= 1}
                    >
                        −
                    </button>
                    
                    <span className="qty-value">{item.quantity}</span>
                    
                    <button 
                        className="qty-btn" 
                        onClick={() => {
                            if (item.quantity >= maxStock) {
                                toast.error(`Only ${maxStock} items available in stock!`);
                            } else {
                                // --- FIX: Pass item.size to update quantity ---
                                updateCartQuantity(item.product._id, item.quantity + 1, item.size);
                            }
                        }}
                        disabled={item.quantity >= maxStock}
                    >
                        +
                    </button>
                  </div>
                </div>
                
                {/* Right: Price & X Button */}
                <div className="price-section">
                  <span className="price-text">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                  
                  {/* --- FIX: Pass item.size to remove item --- */}
                  <button className="remove-btn" onClick={() => removeFromCart(item.product._id, item.size)}>
                    &times;
                  </button>
                </div>
              </div>
             );
          })}

          {/* FOOTER SECTION */}
          <div className="bottom-section">
            <div className="summary-box">
                
                {/* COUPON AREA */}
                <div className="coupon-box">
                    <label className="coupon-label">Have a Coupon?</label>
                    {!isCouponApplied ? (
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="input-field"
                                value={couponCode} 
                                onChange={(e) => setCouponCode(e.target.value)} 
                                placeholder="Enter Code" 
                            />
                            <button className="apply-btn" onClick={handleApplyCoupon}>Apply</button>
                        </div>
                    ) : (
                        <div style={{ background:'#ecfdf5', padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #a7f3d0' }}>
                            <span style={{ color:'#047857', fontWeight:'bold', fontSize:'0.85rem', textTransform:'uppercase' }}>
                                {appliedCodeName} Applied!
                            </span>
                            <button onClick={handleRemoveCoupon} style={{ background:'none', border:'none', color:'#b91c1c', cursor:'pointer', fontSize:'1.2rem', lineHeight:1 }}>&times;</button>
                        </div>
                    )}
                </div>

                {/* TOTALS AREA */}
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span style={{ fontFamily:'monospace', fontWeight:'600' }}>₹{subtotal.toLocaleString()}</span>
                </div>

                {isCouponApplied && (
                    <div className="summary-row" style={{ color:'#047857' }}>
                        <span>Discount ({discountPercent}%)</span>
                        <span style={{ fontFamily:'monospace', fontWeight:'600' }}>- ₹{discountAmount.toLocaleString()}</span>
                    </div>
                )}

                <div className="total-row">
                    <span>Total</span>
                    <span style={{ fontFamily:'monospace' }}>₹{finalTotal.toLocaleString()}</span>
                </div>
                
                <button onClick={handleCheckoutClick} className="checkout-btn">
                    Checkout Now
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;