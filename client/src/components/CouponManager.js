import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import toast from 'react-hot-toast';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiry, setExpiry] = useState('');

  // 1. Fetch Coupons
  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/coupons`);
      setCoupons(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load coupons");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 2. Create Coupon
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/coupons`, {
        code,
        discountPercentage: Number(discount),
        expirationDate: expiry
      });
      toast.success('Coupon Created Successfully!');
      setCode(''); setDiscount(''); setExpiry('');
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  // 3. Delete Coupon
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/coupons/${id}`);
      toast.success('Coupon Deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="fade-in">
      <style>{`
        .coupon-section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--ivory);
        }
        
        /* Form Styling */
        .coupon-form-container {
            background: var(--charcoal);
            padding: 2rem;
            border-radius: 4px;
            border: var(--border-subtle);
            margin-bottom: 3rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .form-row {
            display: flex;
            gap: 1.5rem;
            align-items: flex-end;
            flex-wrap: wrap;
        }
        .input-group {
            flex: 1;
            min-width: 200px;
        }
        .input-label {
            display: block;
            font-size: 0.6rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--fog);
            margin-bottom: 0.5rem;
        }
        .styled-input {
            width: 100%;
            height: 45px;
            padding: 0 12px;
            border: var(--border-light);
            background: var(--slate);
            color: var(--ivory);
            border-radius: 0;
            font-size: 0.9rem;
            transition: all 0.2s;
            outline: none;
            font-family: var(--font-body);
        }
        .styled-input:focus {
            border-color: var(--gold);
        }
        .styled-input::placeholder {
            color: var(--stone);
        }

        /* --- FIX: Date Input Specific Styling --- */
        input[type="date"].styled-input {
            appearance: none;
            -webkit-appearance: none;
            display: flex;
            align-items: center;
            color: var(--mist);
            cursor: pointer;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.5;
            transition: 0.2s;
            padding: 5px;
            margin-left: auto;
            filter: invert(1);
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
            transform: scale(1.1);
        }
        
        .create-btn {
            background: var(--gold);
            color: var(--abyss);
            border: none;
            padding: 0 30px;
            border-radius: 0;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
            height: 45px;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
        }
        .create-btn:hover {
            background: var(--ivory);
            transform: translateY(-2px);
        }

        /* Table Styling */
        .table-wrapper {
            background: var(--charcoal);
            border: var(--border-subtle);
            border-radius: 4px;
            overflow-x: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { 
            background: var(--slate); 
            padding: 1rem; 
            text-align: left; 
            font-size: 0.65rem; 
            font-weight: 600;
            letter-spacing: 0.1em;
            color: var(--gold); 
            border-bottom: var(--border-light); 
            text-transform: uppercase; 
            white-space: nowrap; 
        }
        td { 
            padding: 1rem; 
            border-bottom: var(--border-subtle); 
            vertical-align: middle; 
            font-size: 0.9rem; 
            color: var(--mist); 
        }
        tr:hover td {
            background: var(--gold-glow);
            color: var(--ivory);
        }
        .code-pill {
            background: rgba(184, 151, 106, 0.1);
            color: var(--gold);
            padding: 4px 10px;
            border: 1px solid rgba(184, 151, 106, 0.3);
            font-family: monospace;
            font-weight: 500;
            font-size: 0.85rem;
            letter-spacing: 0.05em;
        }
        .delete-btn {
            background: var(--wine);
            color: var(--ivory);
            border: none;
            padding: 6px 12px;
            border-radius: 0;
            font-weight: 600;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.2s;
        }
        .delete-btn:hover {
            background: var(--burgundy);
        }
      `}</style>

      {/* --- 1. CREATE SECTION --- */}
      <h2 className="coupon-section-title">Manage Coupons</h2>

      <div className="coupon-form-container">
        <form onSubmit={handleCreate} className="form-row">
          {/* Code Input */}
          <div className="input-group">
            <label className="input-label">Code Name</label>
            <input
              type="text"
              placeholder="e.g. SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="styled-input"
            />
          </div>

          {/* Discount Input */}
          <div className="input-group" style={{ flex: '0 0 150px' }}>
            <label className="input-label">Discount (%)</label>
            <input
              type="number"
              placeholder="20"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
              min="1"
              max="100"
              className="styled-input"
            />
          </div>

          {/* Date Input */}
          <div className="input-group">
            <label className="input-label">Expiry Date</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              required
              className="styled-input"
            />
          </div>

          <button type="submit" className="create-btn">
            Create Coupon
          </button>
        </form>
      </div>

      {/* --- 2. LIST SECTION --- */}
      <h3 className="coupon-section-title" style={{ fontSize: '1rem', marginTop: '2rem' }}>Active Coupons</h3>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Code</th>
              <th style={{ width: '20%' }}>Discount</th>
              <th style={{ width: '30%' }}>Expires On</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>
                  <span className="code-pill">{coupon.code}</span>
                </td>
                <td style={{ fontWeight: '500', color: 'var(--ivory)' }}>{coupon.discountPercentage}% OFF</td>
                <td style={{ color: 'var(--stone)' }}>
                  {new Date(coupon.expirationDate).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {coupons.length === 0 && !loading && (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--stone)', fontStyle: 'italic' }}>
                  No active coupons found. Create one above to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponManager;