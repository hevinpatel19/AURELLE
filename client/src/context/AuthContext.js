import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import API_BASE_URL from "../api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // --- HELPER FUNCTIONS FOR INSTANT LOADING ---
  
  // 1. Get Token Immediately
  const getInitialToken = () => localStorage.getItem('token');

  // 2. Get User Immediately (Decode token instantly)
  const getInitialUser = () => {
    const token = getInitialToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.user;
    } catch (error) {
      console.error("Invalid token on startup", error);
      return null;
    }
  };

  // --- STATE INITIALIZATION ---
  const [token, setToken] = useState(getInitialToken);
  const [user, setUser] = useState(getInitialUser);
  const [cart, setCart] = useState([]);

  // --- IMMEDIATE SETUP ---
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // --- EFFECT: FETCH CART ON LOAD ---
  useEffect(() => {
    if (token) {
      const fetchCart = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/cart`);

          setCart(res.data);
        } catch (err) { 
          console.error('Error fetching cart:', err); 
        }
      };
      fetchCart();
    }
  }, [token]);

  // --- LOGIN FUNCTION ---
  const login = async (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    try {
      const decoded = jwtDecode(newToken);
      setUser(decoded.user);
    } catch (e) {
      setUser(null);
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/cart`);

      setCart(res.data);
    } catch (err) { console.error('Error fetching cart on login:', err); }
  };

  // --- LOGOUT FUNCTION ---
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
    delete axios.defaults.headers.common['Authorization'];
  };
  
// --- CART FUNCTIONS ---
  
  // 1. Add (FIXED: Removed the alert check)
  const addToCart = async (productId, quantity, size) => {
    // Validation is handled by the UI component (ProductPage), not here.
    try {
      const res = await axios.post(`${API_BASE_URL}/api/cart/add`, { productId, quantity, size });

      setCart(res.data);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // 2. Remove
  const removeFromCart = async (productId, size) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/cart/${productId}`, {

          data: { size } 
      });
      setCart(res.data);
    } catch (err) { console.error('Error removing from cart:', err); }
  };
  
  // 3. Update
  const updateCartQuantity = async (productId, newQuantity, size) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/cart/update`, { productId, newQuantity, size });

      setCart(res.data);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };
  
  // CLEAR CART
  const clearCart = () => {
      setCart([]);
  };

  const value = {
    token,
    isAuthenticated: !!token,
    user,
    cart,
    login,
    logout,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthContext, AuthProvider, useAuth };