import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_BASE_URL from "../api";


// --- CONSTANTS & ASSETS ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80",
  men: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop",
  women: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop",
  footwear: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=800&auto=format&fit=crop"
};

const BRAND_FEATURES = [
  { icon: '🚀', title: 'Fast Shipping', desc: 'Express delivery worldwide.' },
  { icon: '💎', title: 'Authentic', desc: '100% Verified products.' },
  { icon: '🛡️', title: 'Secure', desc: 'Encrypted protection.' },
  { icon: '↺', title: 'Easy Returns', desc: '30-day hassle-free policy.' }
];

// --- INLINE STYLES ---
const textOverlayStyle = {
  position: 'absolute', bottom: '30px', left: '30px', color: '#F9F8F6',
  fontSize: '1.5rem', fontWeight: '800', textTransform: 'uppercase',
  letterSpacing: '2px', textShadow: '0 4px 12px rgba(0,0,0,0.4)', pointerEvents: 'none'
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // 1. Data Fetching
    const fetchData = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products/featured`),

          axios.get(`${API_BASE_URL}/api/categories`)

        ]);
        setProducts(featRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();

    // 2. Scroll Animation Listener
    const handleScroll = () => {
      document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
          el.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLink = (name) => {
    const cat = categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return cat ? `/category/${cat._id}` : '#';
  };

  return (
    <div>
      {/* INTERNAL CSS FOR ZOOM */}
      <style>{`
        .zoom-card { position: relative; overflow: hidden; display: block; }
        .zoom-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); filter: brightness(0.9); }
        .zoom-card:hover img { transform: scale(1.05); filter: brightness(1); }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="hero-wrapper">
        <div className="hero-text">
          <h1 className="hero-headline">Designed <br/> For The <br/> Bold.</h1>
          <p style={{ marginBottom: '2.5rem', color: '#595959', fontSize: '1.1rem', maxWidth: '450px', lineHeight: '1.8' }}>
            “Considered luxury shaped by craftsmanship and precision. Designed to transcend trends and define elegance.”
          </p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#collection" className="btn-primary">Shop Collection</a>
            <Link to="/register" style={{ fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a', fontSize: '0.85rem', letterSpacing: '1.5px', color: '#1a1a1a' }}>
              Join The Club
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <img src={IMAGES.hero} alt="Hero Visual" />
        </div>
      </section>

      {/* 2. BENTO GRID CATEGORIES */}
      <section id="collection" className="section" style={{ background: '#F9F8F6' }}>
        <h2 className="section-title" style={{ marginBottom: '2rem', color: '#1a1a1a' }}>Curated Collections</h2>
        
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gridTemplateRows: '1fr 1fr', gap: '20px', height: '600px', width: '100%' }}>
          
          {/* Men (Tall) */}
          <Link to={getLink('men')} className="zoom-card" style={{ gridRow: '1 / 3' }}>
             <img src={IMAGES.men} alt="Men" />
             <div style={textOverlayStyle}>Men's Collection</div>
          </Link>

          {/* Women */}
          <Link to={getLink('women')} className="zoom-card">
             <img src={IMAGES.women} alt="Women" />
             <div style={textOverlayStyle}>Women's Collection</div>
          </Link>

          {/* Footwear */}
          <Link to={getLink('footwear')} className="zoom-card">
             <img src={IMAGES.footwear} alt="Footwear" />
             <div style={textOverlayStyle}>Premium Footwear</div>
          </Link>
        </div>
      </section>

      {/* 3. VISUAL BREAK */}
      <section className="reveal" style={{ background: '#1a1a1a', color: '#F9F8F6', padding: '4rem 4%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-1px' }}>
          "QUALITY IS NOT AN ACT, <br/> IT IS A HABIT."
        </h2>
        <p style={{ opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>The new standard for modern living.</p>
      </section>

      {/* 4. FEATURED PRODUCTS (UPDATED WITH FILTER) */}
      <section className="section" style={{ background: '#F9F8F6'}}>
        <h2 className="section-title" style={{ color: '#1a1a1a' }}>Trending Now</h2>
        <div className="product-grid reveal">
          {products
            .filter(p => p.countInStock > 0) // <--- HIDES OUT OF STOCK ITEMS
            .map(p => (
            <Link to={`/product/${p._id}`} key={p._id} className="product-card">
              <div className="card-img-box">
                 <img src={p.imageUrl} alt={p.name} />
              </div>
              <div className="card-info-container">
                <h3 className="card-title">{p.name}</h3>
                <p className="card-price">₹{p.price.toLocaleString('en-IN')}</p>
                <div className="view-btn">View Details</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. BRAND VALUES */}
      <section className="section" style={{ padding: '3.5rem 3%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', textAlign: 'center' }}>
          {BRAND_FEATURES.map((feature, index) => (
            <div key={index}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#595959', fontSize: '0.9rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;