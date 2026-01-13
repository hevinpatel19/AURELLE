import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          axios.get(`${API_BASE_URL}/api/categories`)
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // Limit Season's Edit to 4 products for curated feel
  const featuredProducts = products.slice(0, 4);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80"
            alt="Editorial Fashion"
          />
        </div>
        <div className="hero-content">
          <span className="hero-tagline">Winter 2026</span>
          <h1 className="hero-title">
            The Art of<br />Darkness
          </h1>
          <p className="hero-subtitle">
            Where shadows meet sophistication. A curation for those who
            understand that true luxury whispers.
          </p>
          <Link to="/category/men" className="btn-primary">
            <span>Explore Collection</span>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CURATED CATEGORIES — New "Editorial Banner" Design
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: 'var(--space-5xl) 0',
        background: 'var(--abyss)',
        borderBottom: 'var(--border-subtle)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
          <span className="section-eyebrow">Explore</span>
          <h2 className="section-title">Shop by Category</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2px', // Thin grid gap for premium editorial look
          background: 'var(--border-subtle)', // Creates the line effect
          maxWidth: '1600px',
          margin: '0 auto',
          borderTop: '2px solid var(--border-subtle)',
          borderBottom: '2px solid var(--border-subtle)'
        }}>
          {categories.slice(0, 4).map((cat, index) => (
            <Link
              key={cat._id}
              to={`/category/${cat._id}`}
              style={{
                position: 'relative',
                height: '500px',
                overflow: 'hidden',
                display: 'block',
                background: 'var(--charcoal)'
              }}
              className="category-tile"
            >
              {/* Background Image */}
              <img
                src={[
                  "/images/cat_men.png",
                  "/images/cat_women.png",
                  "/images/cat_acc.png",
                  "/images/cat_shoes.png"
                ][index]}
                alt={cat.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 1.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s',
                  opacity: 0.6,
                  filter: 'brightness(1.1) contrast(1.02)' // Visual Polish
                }}
                className="category-img"
              />

              {/* Overlay Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, var(--abyss) 0%, rgba(5,5,5,0.4) 60%, transparent 100%)',
                opacity: 0.8
              }} />

              {/* Content */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: 'var(--space-2xl) var(--space-xl)',
                textAlign: 'center',
                transform: 'translateY(10px)',
                transition: 'transform 0.5s var(--ease-out-expo)'
              }} className="category-content">
                <span style={{
                  display: 'block',
                  color: 'var(--gold)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-md)',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: 'all 0.5s 0.1s'
                }} className="category-eyebrow">
                  Collection
                </span>

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.5rem',
                  fontWeight: '400',
                  color: 'var(--ivory)',
                  marginBottom: 'var(--space-lg)',
                  transition: 'color 0.3s'
                }}>
                  {cat.name}
                </h3>

                <span style={{
                  display: 'inline-block',
                  border: '1px solid var(--ivory)',
                  padding: '12px 24px',
                  color: 'var(--ivory)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: 'all 0.5s 0.2s'
                }} className="category-btn">
                  Explore
                </span>
              </div>

              {/* CSS for hover effects */}
              <style>{`
                .category-tile:hover .category-img {
                  transform: scale(1.05);
                  opacity: 0.8;
                }
                .category-tile:hover .category-content {
                  transform: translateY(0);
                }
                .category-tile:hover .category-eyebrow {
                  opacity: 1;
                  transform: translateY(0);
                }
                .category-tile:hover .category-btn {
                  opacity: 1;
                  transform: translateY(0);
                }
              `}</style>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SIGNATURE STRIP
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: 'var(--space-4xl) 4%',
        background: 'var(--charcoal)',
        textAlign: 'center',
        borderTop: 'var(--border-subtle)',
        borderBottom: 'var(--border-subtle)'
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.25rem, 3vw, 2rem)',
          fontWeight: '400',
          fontStyle: 'italic',
          color: 'var(--mist)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          "True elegance is not about being noticed,
          it's about being remembered."
        </p>
        <div className="divider" style={{ marginTop: 'var(--space-xl)' }}></div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURED PRODUCTS — Curated to 4 Items
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section section-dark">
        <div className="section-header">
          <span className="section-eyebrow">Curated Selection</span>
          <h2 className="section-title">This Season's Edit</h2>
          <p className="section-subtitle">
            Pieces that define the contemporary wardrobe
          </p>
        </div>

        <div className="product-grid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {featuredProducts.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="product-card"
            >
              <div className="product-card-image">
                <img src={product.imageUrl} alt={product.name} />
                {product.countInStock === 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 'var(--space-md)',
                    left: 'var(--space-md)',
                    padding: 'var(--space-xs) var(--space-md)',
                    background: 'var(--abyss)',
                    color: 'var(--mist)',
                    fontSize: '0.6rem',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: 'var(--border-light)',
                    zIndex: '2'
                  }}>
                    Sold Out
                  </span>
                )}
              </div>
              <div className="product-card-body">
                <h3 className="product-card-name">{product.name}</h3>
                <p className="product-card-price">₹{product.price.toLocaleString('en-IN')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          ATELIER INFO
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section section-gradient" style={{ textAlign: 'center' }}>
        <span className="section-eyebrow">The Atelier</span>
        <h2 className="section-title" style={{ marginBottom: 'var(--space-xl)' }}>
          Crafted With Intent
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-3xl)',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { number: "01", title: "Handpicked Materials", desc: "Every fabric sourced from the world's finest mills" },
            { number: "02", title: "Meticulous Construction", desc: "Crafted with precision by master artisans" },
            { number: "03", title: "Timeless Design", desc: "Pieces that transcend seasons and trends" }
          ].map((item) => (
            <div key={item.number} style={{ textAlign: 'center' }}>
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: '3rem',
                fontWeight: '300',
                color: 'var(--gold)',
                marginBottom: 'var(--space-md)',
                opacity: '0.5'
              }}>
                {item.number}
              </span>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '500',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ivory)',
                marginBottom: 'var(--space-sm)'
              }}>
                {item.title}
              </h4>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--fog)',
                lineHeight: '1.7'
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          NEWSLETTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: 'var(--space-5xl) 4%',
        background: 'var(--charcoal)',
        textAlign: 'center'
      }}>
        <span className="section-eyebrow" style={{ marginBottom: 'var(--space-md)', display: 'block' }}>
          Join Us
        </span>
        <h2 className="display-md" style={{ marginBottom: 'var(--space-md)' }}>
          Be the First to Know
        </h2>
        <p style={{
          color: 'var(--fog)',
          marginBottom: 'var(--space-2xl)',
          maxWidth: '400px',
          margin: '0 auto var(--space-2xl)'
        }}>
          Exclusive access to new arrivals and private offers
        </p>

        <form
          style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            maxWidth: '450px',
            margin: '0 auto'
          }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="form-input"
            style={{
              flex: 1,
              padding: 'var(--space-md) var(--space-lg)',
              background: 'var(--slate)',
              border: 'var(--border-light)',
              borderRadius: '0'
            }}
          />
          <button type="submit" className="btn-primary">
            <span>Subscribe</span>
          </button>
        </form>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">NOIR</div>
            <p className="footer-desc">
              A dark luxury experience for those who understand that
              true sophistication lies in the shadows.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              {categories.map(cat => (
                <li key={cat._id}>
                  <Link to={`/category/${cat._id}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><Link to="/">About</Link></li>
              <li><Link to="/">Sustainability</Link></li>
              <li><Link to="/">Careers</Link></li>
              <li><Link to="/">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><Link to="/">Contact Us</Link></li>
              <li><Link to="/">Shipping</Link></li>
              <li><Link to="/">Returns</Link></li>
              <li><Link to="/">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 NOIR. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default HomePage;