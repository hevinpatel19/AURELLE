import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_BASE_URL from "../api";


const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Wishlist
  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data } = await axios.get(`${API_BASE_URL}/api/users/wishlist`, {

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

  // Remove Item Function
  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/users/wishlist/${productId}`, {

        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Removed from wishlist");
      fetchWishlist(); // Refresh list
    } catch (error) {
      toast.error("Could not remove item");
    }
  };

  if (loading) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '100px', paddingBottom: '4rem', paddingLeft: '20px', paddingRight: '20px' }}>
      
      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* 1. Card Container */
        .wishlist-card {
           position: relative;
           display: flex;
           flex-direction: column;
           background: #fff;
           border: 1px solid #eee;
           text-decoration: none;
           color: inherit;
           transition: box-shadow 0.3s ease, border-color 0.3s ease; /* Only transitioning shadow/border */
        }
        
        /* HOVER: Shadow ONLY - NO LIFT */
        .wishlist-card:hover {
           box-shadow: 0 8px 25px rgba(0,0,0,0.06); 
           border-color: transparent;
           transform: none; /* Ensures the card stays strictly in place */
           z-index: 2;
        }
        
        /* Image Box */
        .card-img-box {
           width: 100%;
           aspect-ratio: 3/4;
           overflow: hidden; 
           background: #f4f4f5;
           position: relative;
        }

        /* Image Zoom Effect */
        .card-img {
           width: 100%;
           height: 100%;
           object-fit: cover;
           mix-blend-mode: multiply;
           transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .wishlist-card:hover .card-img {
           transform: scale(1.05); 
        }

        /* 2. "View Details" Text - Pop Up Logic */
        .pop-up-text {
           margin-top: 8px;
           font-size: 0.75rem;
           font-weight: 700;
           text-transform: uppercase;
           letter-spacing: 1px;
           color: #000;
           
           /* Underline styling - tight to text */
           border-bottom: 2px solid #C5A059;
           padding-bottom: 2px;
           display: inline-block; /* Essential: keeps the border exactly the width of the text */
           
           /* Hidden Initial State */
           opacity: 0;
           transform: translateY(10px); /* Pushed down initially */
           transition: all 0.3s ease;
        }

        /* Reveal on Card Hover */
        .wishlist-card:hover .pop-up-text {
           opacity: 1;
           transform: translateY(0); /* Slides up to natural position */
        }

        /* Close Button */
        .close-btn:hover {
           background: #fee2e2 !important;
           color: #ef4444 !important;
           border-color: #fecaca !important;
        }
      `}</style>

      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', textTransform: 'uppercase', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        My Wishlist <span style={{ fontSize: '1rem', color: '#666', verticalAlign: 'middle' }}>({wishlist.length})</span>
      </h1>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3>Your wishlist is empty.</h3>
          <Link to="/" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'underline', fontWeight: 'bold', color: '#1a1a1a' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
          {wishlist.map((product) => (
            <div key={product._id} className="wishlist-card">
              
              <button 
                className="close-btn"
                onClick={() => handleRemove(product._id)}
                style={{
                  position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                  background: 'white', border: '1px solid #ddd', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666',
                  transition: 'all 0.2s'
                }}
                title="Remove"
              >
                ✕
              </button>

              <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                <div className="card-img-box">
                  <img src={product.imageUrl} alt={product.name} className="card-img" />
                </div>
                
                <div style={{ padding: '1.2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 5px 0' }}>
                    {product.name}
                  </h3>
                  <p style={{ color: '#555', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                    ₹{product.price.toLocaleString()}
                  </p>
                  
                  {/* Text pop-up */}
                  <span className="pop-up-text">
                    View Details
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;