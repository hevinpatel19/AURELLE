import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', formData);
      if (data.token) {
        login(data.token);
        toast.success('Welcome to NOIR');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Visual Side */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80"
          alt="Fashion"
        />
      </div>

      {/* Form Side */}
      <div className="auth-form-container">
        <h1 className="auth-title">Join the<br />Darkness</h1>
        <p className="auth-subtitle">Create your account</p>

        <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-2xl)', color: 'var(--fog)' }}>
          Already a member?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: '500' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;