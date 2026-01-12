import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, cart, user } = useContext(AuthContext);
  
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const searchRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get('http://localhost:5000/api/categories');
        setCategories(catRes.data);
        const prodRes = await axios.get('http://localhost:5000/api/products');
        setAllProducts(prodRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // FILTER LOGIC
  useEffect(() => {
    if (query.trim() === "") {
      setFilteredProducts([]);
    } else {
      const lowerQuery = query.toLowerCase();
      const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredProducts(results);
    }
  }, [query, allProducts]);

  // CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const handleResultClick = () => {
    setQuery("");
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      
      {/* LOGO */}
      <div className="navbar-logo">
        <Link to="/">AURELLÉ</Link>
      </div>
      
      {/* LINKS */}
      <div className="navbar-links">
        
        {/* CATEGORIES */}
        {categories.map((cat) => (
          <Link key={cat._id} to={`/category/${cat._id}`} className="nav-link">
            {cat.name.toUpperCase()}
          </Link>
        ))}
        
        {/* SEARCH */}
        <div className="search-container" ref={searchRef}>
           <button className="search-btn">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="11" cy="11" r="8"></circle>
               <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
             </svg>
           </button>
           
           <input 
             type="text" 
             className="search-input"
             placeholder="Search..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />

           {query && (
             <div className="search-dropdown">
               {filteredProducts.length > 0 ? (
                 filteredProducts.map((product) => (
                   <Link to={`/product/${product._id}`} key={product._id} className="search-result-item" onClick={handleResultClick}>
                     <img 
                        src={product.imageUrl || "https://via.placeholder.com/40"} 
                        alt={product.name} 
                        className="search-result-img" 
                     />
                     <div className="search-result-info">
                       <span className="search-result-name">{product.name}</span>
                       <span className="search-result-price">₹{product.price}</span>
                     </div>
                   </Link>
                 ))
               ) : (
                  <div style={{padding: '12px', textAlign: 'center', color: '#888', fontSize: '13px'}}>No products found</div>
               )}
             </div>
           )}
        </div>

        {/* --- WISHLIST LINK (NEW) --- */}
        {isAuthenticated && (
          <Link to="/wishlist" className="nav-link" title="My Wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </Link>
        )}

        {/* CART */}
        <Link to="/cart" className="nav-link" style={{position:'relative'}}>
          CART
          {cartItemCount > 0 && (
            <span style={{
              position: 'absolute', top: '-8px', right: '-12px',
              background: '#ef4444', color: 'white', borderRadius: '50%',
              width: '16px', height: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 'bold'
            }}>
              {cartItemCount}
            </span>
          )}
        </Link>
        
        {isAuthenticated && (
           <Link to="/orders" className="nav-link">ORDERS</Link>
        )}

        {isAuthenticated && user && user.role === 'admin' && (
           <Link to="/admin" className="nav-link" style={{color: '#d4af37'}}>ADMIN</Link>
        )}

        {/* PROFILE / AUTH */}
        {isAuthenticated ? (
          <Link to="/profile" title="My Profile" className="nav-link">
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
             </svg>
          </Link>
        ) : (
          <Link to="/login" className="nav-link">LOGIN</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;