import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, cart, user } = useContext(AuthContext);
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchRef = useRef(null);

  // Close menu and search on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/products')
        ]);
        setCategories(catRes.data);
        setAllProducts(prodRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredProducts([]);
    } else {
      const results = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setFilteredProducts(results);
    }
  }, [query, allProducts]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        // Only clear if not in mobile mode or handle differently
        // For now, keeping original behavior for desktop dropdown logic
        if (window.innerWidth > 900) {
          setQuery("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    // On mobile, toggle the overlay state
    if (window.innerWidth <= 900) {
      setIsMobileSearchOpen(!isMobileSearchOpen);
    }
    // On desktop, the input focuses automatically via CSS/markup or user action
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>

        {/* 1. LEFT: HAMBURGER (Mobile) OR LOGO (Desktop) */}
        <div className="nav-left">
          {/* Mobile Hamburger */}
          <button
            className="hamburger-btn mobile-only"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Desktop Logo */}
          <div className="navbar-logo desktop-only">
            <Link to="/">NOIR</Link>
          </div>
        </div>

        {/* 2. CENTER: LOGO (Mobile Only) */}
        <div className="nav-center mobile-only">
          <Link to="/" className="mobile-logo">NOIR</Link>
        </div>

        {/* 3. RIGHT: ACTIONS & HAMBURGER (Desktop) */}
        <div className="nav-right">

          {/* SEARCH */}
          <div className="search-container" ref={searchRef}>
            <button
              className="nav-icon-btn"
              aria-label="Search"
              onClick={handleSearchClick}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {/* Desktop Input (Hidden on Mobile via CSS) */}
            <input
              type="text"
              className="search-input desktop-only-input"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {/* Shared Dropdown (Positioned differently on mobile if needed, or simplified) */}
            {query && !isMobileSearchOpen && (
              <div className="search-dropdown desktop-dropdown">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <Link
                      to={`/product/${product._id}`}
                      key={product._id}
                      className="search-result-item"
                      onClick={() => setQuery("")}
                    >
                      <img src={product.imageUrl} alt={product.name} className="search-result-img" />
                      <div className="search-result-info">
                        <span className="search-result-name">{product.name}</span>
                        <span className="search-result-price">₹{product.price.toLocaleString('en-IN')}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="no-results">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* WISHLIST */}
          <Link to="/wishlist" className="nav-icon-btn" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Link>

          {/* CART */}
          <Link to="/cart" className="nav-icon-btn cart-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>

          {/* PROFILE (OR LOGIN) */}
          {isAuthenticated ? (
            <Link to="/profile" className="nav-icon-btn" aria-label="Profile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 10-16 0" />
              </svg>
            </Link>
          ) : (
            <Link to="/login" className="nav-icon-btn" aria-label="Login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          )}

          {/* DESKTOP MENU TRIGGER */}
          <button
            className="hamburger-btn desktop-only"
            onClick={() => setIsMenuOpen(true)}
            style={{ marginLeft: 'var(--space-sm)' }}
          >
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '8px' }}>Menu</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* MOBILE SEARCH OVERLAY (Absolute Positioned below navbar) */}
        <div className={`mobile-search-overlay ${isMobileSearchOpen ? 'open' : ''}`}>
          <input
            type="text"
            className="mobile-search-input"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={isMobileSearchOpen}
          />
          {/* Mobile Dropdown Results */}
          {query && isMobileSearchOpen && (
            <div className="mobile-search-results">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Link
                    to={`/product/${product._id}`}
                    key={product._id}
                    className="search-result-item"
                    onClick={() => {
                      setQuery("");
                      setIsMobileSearchOpen(false);
                    }}
                  >
                    <img src={product.imageUrl} alt={product.name} className="search-result-img" />
                    <div className="search-result-info">
                      <span className="search-result-name">{product.name}</span>
                      <span className="search-result-price">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="no-results">No results found</div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          SLIDE-IN MENU OVERLAY
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className="menu-panel" onClick={(e) => e.stopPropagation()}>

          {/* CLOSE BTN */}
          <button className="menu-close-btn" onClick={() => setIsMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="menu-content">
            <span className="menu-eyebrow">Collections</span>
            <ul className="menu-list">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link to={`/category/${cat._id}`} className="menu-link">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="menu-divider"></div>

            <span className="menu-eyebrow">Account</span>
            <ul className="menu-list secondary">
              {isAuthenticated ? (
                <>
                  <li><Link to="/profile">My Profile</Link></li>
                  <li><Link to="/orders">My Orders</Link></li>
                  <li><Link to="/wishlist">Wishlist</Link></li>
                  {user?.role === 'admin' && (
                    <li style={{ color: 'var(--gold)' }}><Link to="/admin">Admin Dashboard</Link></li>
                  )}
                </>
              ) : (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Register</Link></li>
                </>
              )}
            </ul>
          </div>

          <div className="menu-footer">
            <p>© 2026 NOIR</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;