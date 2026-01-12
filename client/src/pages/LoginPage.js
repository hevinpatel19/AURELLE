import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from "../api";

import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
     const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password }
    );

      login(data.token);
      navigate('/');
    } catch (err) { 
      alert(err.response?.data?.message || "Invalid Credentials"); 
    }
  };

  return (
    <div className="auth-container">
      {/* CSS Override to remove the dark line */}
      <style>{`
        .auth-visual { border-right: none !important; }
        .auth-form-wrapper { border-left: none !important; }
      `}</style>

      {/* 1. Visual Side */}
      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80" alt="Login Visual" />
      </div>

      {/* 2. Form Side */}
      <div className="auth-form-wrapper">
        <h1 className="auth-title">Welcome Back.</h1>
        <p style={{marginBottom:'2rem', color:'#666'}}>Please enter your details to sign in.</p>
        
        <form onSubmit={submitHandler}>
          <input 
            className="input-minimal" placeholder="Email Address" 
            type="email" value={email} onChange={e=>setEmail(e.target.value)} required
          />
          <input 
            className="input-minimal" placeholder="Password" 
            type="password" value={password} onChange={e=>setPassword(e.target.value)} required
          />
          
          <button className="btn-primary" style={{width:'100%', marginTop:'1rem', textAlign:'center'}}>
            SIGN IN
          </button>
        </form>
        
        <p style={{marginTop:'2rem', color:'#666', fontSize:'0.9rem'}}>
          Don't have an account? <Link to="/register" style={{color:'black', fontWeight:'bold', textDecoration:'underline'}}>Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;