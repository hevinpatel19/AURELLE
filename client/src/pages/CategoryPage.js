import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [catName, setCatName] = useState('');
  const [loading, setLoading] = useState(true);

  /* ===== ADDED STATES ===== */
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sortOrder, setSortOrder] = useState('');
  const [renderCycle, setRenderCycle] = useState(0);

  const filterRef = useRef(null);

  // --- FETCH DATA ---
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/products/category/${categoryId}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    axios
      .get('http://localhost:5000/api/categories')
      .then(res => {
        const cat = res.data.find(c => c._id === categoryId);
        if (cat) setCatName(cat.name);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId]);

  /* ===== CLOSE FILTER ON OUTSIDE CLICK ===== */
  useEffect(() => {
    const handleClickOutside = e => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ===== FORCE RE-ANIMATION ON FILTER/SORT ===== */
  useEffect(() => {
    setRenderCycle(prev => prev + 1);
  }, [searchTerm, minPrice, maxPrice, sortOrder]);

  /* ===== FILTER + SEARCH + SORT ===== */
  const filteredProducts = products
    .filter(p => p.countInStock > 0)
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(p => p.price >= minPrice && p.price <= maxPrice)
    .sort((a, b) => {
      if (sortOrder === 'low') return a.price - b.price;
      if (sortOrder === 'high') return b.price - a.price;
      return 0;
    });

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingTop: '60px', paddingBottom: '4rem' }}>
      {/* --- CSS ANIMATIONS & STYLES (UNCHANGED) --- */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: #000;
          opacity: 0;
          transition: all 0.3s ease;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: rgba(0,0,0,0.1);
        }
        .card-img-box {
          width: 100%;
          aspect-ratio: 2/3;
          overflow: hidden;
          background: #f4f4f5;
          transition: all 0.4s ease;
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          mix-blend-mode: multiply;
        }
        .product-card:hover .card-img {
          transform: scale(1.08);
        }
        .pop-up-btn {
          margin-top: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid #C5A059;
          padding-bottom: 2px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
          display: inline-block;
          color: #000;
        }
        .product-card:hover .pop-up-btn {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* HEADER (UNCHANGED) */}
      <div style={{ textAlign:'center', marginBottom:'2rem', borderBottom:'1px solid #e5e5e5', padding:'1.3rem 0' }}>
        <h1 style={{ fontSize:'2.5rem', fontWeight:'900', textTransform:'uppercase', letterSpacing:'2px', animation:'fadeInUp 0.8s ease forwards' }}>
          {catName || 'COLLECTION'}
        </h1>
        <div style={{ width:'40px', height:'3px', background:'#000', margin:'0 auto', animation:'fadeInUp 0.8s ease 0.2s forwards', opacity:0 }} />
      </div>

      {/* SEARCH + FILTER */}
      <div style={{ maxWidth:'1400px', margin:'0 auto 2rem', padding:'0 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width:'220px', padding:'0.55rem 0.8rem', border:'1px solid #ddd', fontSize:'0.85rem' }}
        />

        <div ref={filterRef} style={{ position:'relative' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ padding:'0.55rem 1rem', border:'1px solid #000', background:'#000', color:'#fff', fontSize:'0.75rem', letterSpacing:'1px' }}
          >
            FILTERS
          </button>

          {showFilters && (
            <div style={{ position:'absolute', right:0, top:'110%', width:'260px', background:'#fff', border:'1px solid #e5e5e5', padding:'1rem', zIndex:10, boxShadow:'0 10px 30px rgba(0,0,0,0.08)' }}>
              {/* SORT */}
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:'0.75rem', letterSpacing:'1px' }}>SORT</label>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  style={{ width:'100%', marginTop:'6px', padding:'0.45rem', border:'1px solid #ddd', fontSize:'0.8rem' }}
                >
                  <option value="">Default</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>

              {/* PRICE RANGE (SCROLLBAR) */}
              <label style={{ fontSize:'0.75rem', letterSpacing:'1px' }}>PRICE</label>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', margin:'6px 0' }}>
                <span>₹ {minPrice}</span>
                <span>₹ {maxPrice}</span>
              </div>

              <input type="range" min="0" max="20000" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} style={{ width:'100%' }} />
              <input type="range" min="0" max="20000" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width:'100%' }} />
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT GRID (UNCHANGED STRUCTURE, FIXED KEY) */}
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 2rem' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'#999' }}>LOADING...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign:'center', color:'#888', marginTop:'2rem' }}>
            <h3>No items found.</h3>
            <Link to="/" style={{ textDecoration:'underline' }}>Back to Home</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'2rem' }}>
            {filteredProducts.map((p, index) => (
              <Link
                to={`/product/${p._id}`}
                key={`${renderCycle}-${p._id}`}
                className="product-card"
                style={{ animation:`fadeInUp 0.8s ease forwards ${index * 0.1}s` }}
              >
                <div className="card-img-box">
                  <img src={p.imageUrl} alt={p.name} className="card-img" />
                </div>

                <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', padding:'0.8rem 1rem', width:'100%' }}>
                  <h3 style={{ fontSize:'0.95rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 8px 0' }}>
                    {p.name}
                  </h3>
                  <p style={{ fontSize:'0.9rem', color:'#555', margin:0, fontWeight:'600' }}>
                    ₹{p.price.toLocaleString()}
                  </p>
                  <span className="pop-up-btn">View Details</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
