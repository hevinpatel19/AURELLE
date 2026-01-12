import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from "../api";

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
    if(!window.confirm("Delete this coupon?")) return;
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
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            color: #1a1a1a;
        }
        
        /* Form Styling */
        .coupon-form-container {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 8px;
            border: 1px solid #eee;
            margin-bottom: 3rem;
        }
        .form-row {
            display: flex;
            gap: 1.5rem;
            align-items: flex-end; /* Aligns button with inputs */
            flex-wrap: wrap;
        }
        .input-group {
            flex: 1;
            min-width: 200px;
        }
        .input-label {
            display: block;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 0.5rem;
        }
        .styled-input {
            width: 100%;
            height: 45px; /* Enforce height to match button */
            padding: 0 12px; /* Adjusted padding for height alignment */
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 0.95rem;
            transition: all 0.2s;
            outline: none;
            background: #fff;
            color: #333;
            font-family: inherit;
        }
        .styled-input:focus {
            border-color: #1a1a1a;
            box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
        }

        /* --- FIX: Date Input Specific Styling --- */
        input[type="date"].styled-input {
            appearance: none;
            -webkit-appearance: none;
            display: flex;
            align-items: center;
            color: #555;
            cursor: pointer;
        }
        /* Style the Calendar Icon */
        input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.5;
            transition: 0.2s;
            padding: 5px;
            margin-left: auto; /* Pushes icon to right */
            filter: invert(0); /* Ensures icon is dark */
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
            transform: scale(1.1);
        }
        /* ---------------------------------------- */

        .create-btn {
            background: #1a1a1a;
            color: white;
            border: none;
            padding: 0 30px;
            border-radius: 6px;
            font-weight: 700;
            text-transform: uppercase;
            cursor: pointer;
            height: 45px; /* Matches input height exactly */
            transition: background 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .create-btn:hover {
            background: #333;
        }

        /* Table Styling */
        .table-wrapper {
            background: white;
            border: 1px solid #eee;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            overflow-x: auto;
        }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { 
            background: #f8f9fa; 
            padding: 16px; 
            text-align: left; 
            font-size: 0.85rem; 
            color: #666; 
            border-bottom: 2px solid #eee; 
            text-transform: uppercase; 
            white-space: nowrap; 
        }
        td { 
            padding: 16px; 
            border-bottom: 1px solid #eee; 
            vertical-align: middle; 
            font-size: 1rem; 
            color: #1a1a1a; 
        }
        .code-pill {
            background: #ecfdf5;
            color: #047857;
            padding: 6px 12px;
            border-radius: 20px;
            font-family: monospace;
            font-weight: 700;
            border: 1px solid #a7f3d0;
        }
        .delete-btn {
            background: #fee2e2;
            color: #b91c1c;
            border: none;
            padding: 6px 14px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .delete-btn:hover {
            background: #fecaca;
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
          <div className="input-group" style={{ flex: '0 0 150px' }}> {/* Fixed narrower width */}
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
      <h3 className="coupon-section-title" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Active Coupons</h3>
      
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
                <td style={{ fontWeight: '600' }}>{coupon.discountPercentage}% OFF</td>
                <td style={{ color: '#666' }}>
                    {new Date(coupon.expirationDate).toLocaleDateString(undefined, { 
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
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
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                  No active coupons found. Create one above to get started!
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