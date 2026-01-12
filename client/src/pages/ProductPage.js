import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  
  // --- STATE: SELECTION ---
  const [selectedSize, setSelectedSize] = useState(''); 

  // --- STATE FOR UI INTERACTIVITY ---
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  // --- FETCH PRODUCT ---
  const fetchProductAndWishlist = async () => {
    try {
      setLoading(true); 
      const productPromise = axios.get(`http://localhost:5000/api/products/${id}`);
      const relatedPromise = axios.get(`http://localhost:5000/api/products/${id}/related`);
      
      let wishlistPromise = Promise.resolve({ data: [] });
      if (user) {
        const token = localStorage.getItem('token');
        wishlistPromise = axios.get('http://localhost:5000/api/users/wishlist', { headers: { Authorization: `Bearer ${token}` } });
      }

      const [res, relatedRes, wishRes] = await Promise.all([
          productPromise, 
          relatedPromise.catch(e => ({ data: [] })), 
          wishlistPromise.catch(e => ({ data: [] }))
      ]);

      setProduct(res.data);
      setRelatedProducts(relatedRes.data);

      if (user) {
        const found = wishRes.data.some(item => (item._id ? item._id.toString() : item.toString()) === id);
        setIsInWishlist(found);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Failed to load product");
    }
  };

  useEffect(() => {
    fetchProductAndWishlist();
    window.scrollTo(0, 0);
    setSelectedSize(''); 
    setQuantity(1); // Reset quantity logic
    // eslint-disable-next-line
  }, [id, user]);

  // --- HELPER: GET STRICT STOCK LIMIT ---
  const getMaxStock = () => {
      if (!product) return 0;
      if (product.hasVariations) {
          // If variants exist, user MUST select a size to see stock
          if (!selectedSize) return 0; 
          
          const variant = product.variants.find(v => v.value === selectedSize);
          return variant ? variant.stock : 0;
      }
      // If no variations (Accessory), use total count
      return product.countInStock; 
  };

  // --- HANDLER: INCREASE QTY ---
  const handleIncreaseQty = () => {
      const max = getMaxStock();
      
      // Only check size if product actually HAS variations
      if (product.hasVariations && !selectedSize) {
          toast.error(`Please select a ${product.variationType || 'size'} first`);
          return;
      }

      if (quantity >= max) {
          toast.error(`Only ${max} items available!`);
          return;
      }
      setQuantity(q => q + 1);
  };

  // --- ADD TO CART ---
  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    
    // Check if totally out of stock (For simple products)
    if (product.countInStock === 0 && !product.hasVariations) { 
        toast.error("Sorry, this item is out of stock."); return; 
    }
    
    // 1. Validate Selection (ONLY IF HAS VARIATIONS)
    if (product.hasVariations && !selectedSize) {
        toast.error(`Please select a ${product.variationType || 'option'}`);
        return;
    }

    // 2. Validate Specific Limit
    const max = getMaxStock();
    if (max === 0) {
        toast.error("Sorry, this option is out of stock.");
        return;
    }
    if (quantity > max) {
        toast.error(`Only ${max} items available.`);
        return;
    }

    // Pass null/empty string for size if it's an accessory
    await addToCart(product._id, quantity, selectedSize); 
    toast.success('Added to cart!');
  };

  // --- TOGGLE WISHLIST ---
  const handleToggleWishlist = async () => {
    if (!user) { toast.error("Please login to save items"); return; }
    const previousState = isInWishlist;
    setIsInWishlist(!previousState);
    try {
        const token = localStorage.getItem('token');
        if (previousState) {
            await axios.delete(`http://localhost:5000/api/users/wishlist/${product._id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Removed from Wishlist");
        } else {
            await axios.post('http://localhost:5000/api/users/wishlist', { productId: product._id }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Added to Wishlist ❤️");
        }
    } catch (error) { setIsInWishlist(previousState); toast.error("Error updating wishlist"); }
  };

  // --- REVIEW LOGIC ---
  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/products/${id}/reviews`, { rating, comment: reviewText }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Review Submitted!');
      const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(data);
      setReviewText(''); setRating(5);
    } catch (err) { toast.error(err.response?.data?.message || 'Error submitting review'); }
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({ title: 'Delete Review?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#1a1a1a', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/products/${id}/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
          toast.success('Deleted');
          const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
          setProduct(data);
      } catch (err) { toast.error("Failed to delete review"); }
    }
  };

  if (loading) return <div style={{paddingTop:'100px', textAlign:'center'}}>Loading...</div>;
  if (!product) return <div style={{paddingTop:'100px', textAlign:'center'}}>Product not found</div>;

  // General out of stock check (for UI overlay)
  const isOutOfStock = product.countInStock === 0 && !product.hasVariations;

  return (
    <>
    <style>{`
      .size-btn { width: auto; min-width: 45px; height: 45px; padding: 0 15px; border: 1px solid #ddd; background: white; color: #333; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
      .size-btn:hover { border-color: #000; }
      .size-btn.selected { background: #1a1a1a; color: white; border-color: #1a1a1a; }
      .size-btn.disabled { opacity: 0.5; cursor: not-allowed; background: #f9f9f9; text-decoration: line-through; color: #aaa; }
      
      .rp-card { cursor: pointer; text-align: center; transition: transform 0.3s ease, box-shadow 0.3s ease; background: #fff; padding-bottom: 10px; }
      .rp-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }
      .rp-img-container { background: #f4f4f5; margin-bottom: 1.5rem; overflow: hidden; aspect-ratio: 3/4; display: flex; align-items: center; justify-content: center; }
      .rp-img { width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; transition: transform 0.6s; }
      .rp-card:hover .rp-img { transform: scale(1.05); }
      .rp-view-btn { margin-top: 10px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #000; display: inline-block; border-bottom: 2px solid #C5A059; padding-bottom: 3px; opacity: 0; transform: translateY(15px); transition: all 0.3s ease; }
      .rp-card:hover .rp-view-btn { opacity: 1; transform: translateY(0); }
    `}</style>

    <div className="product-page-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', paddingTop: '60px' }}>
      
      {/* LEFT: IMAGE */}
      <div className="pp-image-side" style={{ background: 'var(--bg-panel)', height: 'calc(100vh - 60px)', position: 'sticky', top: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
        <img src={product.imageUrl} alt={product.name} style={{ width:'80%', maxHeight:'80vh', objectFit:'contain', mixBlendMode: 'multiply', opacity: isOutOfStock ? 0.5 : 1 }} />
        {isOutOfStock && <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', background:'rgba(255,255,255,0.9)', padding:'1rem 2rem', border:'2px solid #1a1a1a', fontSize:'1.5rem', fontWeight:'800', textTransform:'uppercase', color:'#1a1a1a' }}>Out of Stock</div>}
      </div>

      {/* RIGHT: INFO */}
      <div className="pp-info-side" style={{ padding: '5rem 6%', background: 'var(--white)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'calc(100vh - 60px)' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#C5A059', marginBottom: '1rem' }}>{product.category?.name || 'Exclusive'}</span>
        <h1 className="pp-title" style={{ fontSize: '3.5rem', fontWeight: '800', textTransform: 'uppercase', lineHeight: '1', marginBottom: '1rem', letterSpacing: '-1px' }}>{product.name}</h1>
        
        <div style={{ marginBottom: '2rem' }}>
            <span className="pp-price" style={{ fontSize: '1.5rem', color: '#595959', fontWeight: '500', marginRight:'1rem' }}>₹{product.price.toLocaleString()}</span>
        </div>
        
        <p className="pp-desc" style={{ lineHeight: '1.8', marginBottom: '3rem', color: '#444', fontSize: '1rem' }}>{product.description}</p>

        {/* --- DYNAMIC VARIANT SELECTOR --- */}
        {!isOutOfStock && product.hasVariations && product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', display: 'block', letterSpacing:'1px' }}>
                    Select {product.variationType}: {selectedSize && <span style={{color:'#C5A059'}}>{selectedSize}</span>}
                </span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {product.variants.map(variant => (
                        <button
                            key={variant.value}
                            disabled={variant.stock === 0}
                            className={`size-btn ${selectedSize === variant.value ? 'selected' : ''} ${variant.stock === 0 ? 'disabled' : ''}`}
                            onClick={() => { setSelectedSize(variant.value); setQuantity(1); }} // Reset qty on switch
                        >
                            {variant.value}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* --- ACTION BUTTONS --- */}
        <div style={{ marginBottom: '4rem', display:'flex', alignItems:'center', gap:'2rem' }}>
           
           {/* Quantity Selector */}
           <div style={{display:'flex', alignItems:'center', border:'1px solid #1a1a1a', opacity: isOutOfStock ? 0.5 : 1 }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} style={{ width:'50px', height:'50px', fontSize:'1.2rem', cursor:'pointer', background: 'transparent', border: 'none', borderRight: '1px solid #eee' }}>−</button>
              <span style={{width:'50px', textAlign:'center', fontWeight:'700', fontSize:'1.1rem'}}>{quantity}</span>
              <button 
                onClick={handleIncreaseQty} 
                style={{ width:'50px', height:'50px', fontSize:'1.2rem', cursor:'pointer', background: 'transparent', border: 'none', borderLeft: '1px solid #eee' }}
              >
                +
              </button>
           </div>

           {/* ADD BUTTON */}
           <button 
             onClick={handleAddToCart} 
             disabled={isOutOfStock}
             onMouseEnter={() => setIsBtnHovered(true)}
             onMouseLeave={() => setIsBtnHovered(false)}
             style={{ 
                 flex: 1, textAlign: 'center', padding: '16px',
                 backgroundColor: isOutOfStock ? '#ccc' : (isBtnHovered ? '#000000' : '#1a1a1a'),
                 color: '#ffffff', 
                 cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                 border: isOutOfStock ? 'none' : '1px solid #1a1a1a',
                 fontWeight: '700',
                 letterSpacing: '1px',
                 transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                 transform: isBtnHovered && !isOutOfStock ? 'translateY(-3px)' : 'none',
                 boxShadow: isBtnHovered && !isOutOfStock ? '0 10px 20px rgba(0,0,0,0.15)' : 'none'
             }}
           >
             {isOutOfStock ? 'OUT OF STOCK' : user ? 'ADD TO CART' : 'LOGIN TO BUY'}
           </button>

           {/* WISHLIST */}
           <button onClick={handleToggleWishlist} style={{ width: '50px', height: '50px', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isInWishlist ? '#e11d48' : '#ccc' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
           </button>
        </div>

        {/* DETAILS */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '2rem', marginBottom: '3rem' }}>
           <h4 style={{textTransform:'uppercase', fontWeight:'800', marginBottom:'1rem', fontSize:'0.9rem'}}>Product Details</h4>
           <p style={{color:'#666', fontSize:'0.9rem', lineHeight:'1.7', whiteSpace: 'pre-line'}}>{product.details}</p>
        </div>

        {/* REVIEWS */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '3rem' }}>
             <h3 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Reviews ({product.reviews?.length || 0})</h3>
             <div style={{ marginBottom: '3rem' }}>
               {product.reviews?.length > 0 ? product.reviews.map((rev, i) => (
                   <div key={rev._id || i} style={{ marginBottom: '1.5rem', paddingBottom:'1rem', borderBottom:'1px solid #f9f9f9' }}>
                       <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                           <div><strong style={{textTransform:'uppercase', fontSize:'0.85rem', marginRight:'10px'}}>{rev.name || 'User'}</strong><span style={{color:'#C5A059', fontSize:'0.9rem'}}>{"★".repeat(rev.rating)}</span></div>
                           {user && (rev.user === user._id || rev.user === user.id) && <button onClick={() => handleDeleteReview(rev._id)} style={{color:'#d63031', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.75rem', fontWeight:'700'}}>DELETE</button>}
                       </div>
                       <p style={{color:'#666', fontSize:'0.9rem'}}>{rev.comment}</p>
                   </div>
               )) : <p style={{color:'#999', fontStyle:'italic'}}>No reviews yet.</p>}
             </div>
             {user ? (
                <form onSubmit={submitReview} style={{ background: '#f8f8f8', padding: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem', textTransform:'uppercase', fontSize:'0.9rem' }}>Write a Review</h4>
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{padding:'10px', width:'100%', marginBottom:'1rem', border:'1px solid #ddd'}}><option value="5">5 - Excellent</option><option value="4">4 - Very Good</option><option value="3">3 - Good</option><option value="2">2 - Fair</option><option value="1">1 - Poor</option></select>
                  <textarea rows="3" value={reviewText} onChange={(e) => setReviewText(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'1rem', border:'1px solid #ddd'}} placeholder="Share your thoughts..." required />
                  <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.8rem', fontWeight: '700', background:'#1a1a1a', color:'white', border:'none' }}>SUBMIT REVIEW</button>
                </form>
             ) : <div style={{background:'#f0f0f0', padding:'1.5rem', textAlign:'center', fontSize:'0.9rem'}}>Please <span onClick={()=>navigate('/login')} style={{textDecoration:'underline', cursor:'pointer', fontWeight:'bold'}}>Login</span> to write a review.</div>}
        </div>
      </div>
    </div>
    
    {/* RELATED */}
    {relatedProducts.length > 0 && (
      <div style={{ padding: '5rem 6%', background: '#fff', borderTop: '1px solid #eee' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '3rem', textAlign: 'center', letterSpacing: '1px' }}>You May Also Like</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '3rem' }}>
          {relatedProducts.map((rp) => (
            <div key={rp._id} className="rp-card" onClick={() => navigate(`/product/${rp._id}`)}>
              <div className="rp-img-container"><img src={rp.imageUrl} alt={rp.name} className="rp-img" /></div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>{rp.name}</h4>
              <span style={{ fontSize: '1rem', color: '#666', fontWeight: '500', display:'block' }}>₹{rp.price.toLocaleString()}</span>
              <span className="rp-view-btn">VIEW DETAILS</span>
            </div>
          ))}
        </div>
      </div>
    )}
    </>
  );
};

export default ProductPage;