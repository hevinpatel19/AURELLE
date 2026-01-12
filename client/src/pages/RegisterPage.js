import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', formData);
      if (data.token) {
        login(data.token);
        navigate('/');
      }
    } catch (err) { 
      alert(err.response?.data?.message || 'Registration Failed'); 
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
        <img src="https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=1000&q=80" alt="Register Visual" />
      </div>

      {/* 2. Form Side */}
      <div className="auth-form-wrapper">
        <h1 className="auth-title">Create Account</h1>
        <p style={{marginBottom:'2rem', color:'#666'}}>Join us to start shopping today.</p>

        <form onSubmit={handleSubmit}>
          <input 
            className="input-minimal" placeholder="Full Name" required
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            className="input-minimal" placeholder="Email Address" type="email" required
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            className="input-minimal" placeholder="Password" type="password" required
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button className="btn-primary" style={{marginTop:'1rem', width:'100%', textAlign:'center'}}>
            Sign Up
          </button>
        </form>
        
        <p style={{marginTop:'1.5rem', color:'#666', fontSize:'0.9rem'}}>
          Already have an account? <Link to="/login" style={{fontWeight:'bold', textDecoration:'underline', color:'black'}}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;