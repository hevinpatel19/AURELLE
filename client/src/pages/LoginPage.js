import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      login(data.token);
      toast.success('Welcome back');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Visual Side */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&q=80"
          alt="Fashion"
        />
      </div>

      {/* Form Side */}
      <div className="auth-form-container">
        <h1 className="auth-title">Welcome<br />Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={submitHandler} style={{ maxWidth: '400px' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-2xl)', color: 'var(--fog)' }}>
          New here?{' '}
          <Link to="/register" style={{ color: 'var(--gold)', fontWeight: '500' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;