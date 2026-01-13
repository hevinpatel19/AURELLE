import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DashboardAnalytics from '../components/DashboardAnalytics';
import CouponManager from '../components/CouponManager';

// =========================================================================
// NOIR ADMIN STYLES (Enhanced)
// =========================================================================
const styles = `
  .admin-page {
    min-height: 100vh;
    padding: 120px 4% 80px;
    background: var(--abyss);
    font-family: var(--font-body);
  }

  .admin-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .admin-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: var(--border-subtle);
  }

  .admin-header h1 {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400;
    font-style: italic;
    color: var(--ivory);
    margin-bottom: 1rem;
  }

  .admin-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .admin-tab {
    padding: 0.75rem 1.5rem;
    background: var(--charcoal);
    border: var(--border-subtle);
    color: var(--mist);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--ease-out-expo);
  }

  .admin-tab:hover {
    background: var(--slate);
    color: var(--ivory);
  }

  .admin-tab.active {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--abyss);
  }

  .admin-section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--ivory);
    margin-bottom: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .admin-table-wrapper {
    background: var(--charcoal);
    border: var(--border-subtle);
    overflow-x: auto;
    margin-bottom: 2rem;
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
  }

  .admin-table th {
    background: var(--slate);
    padding: 1rem;
    text-align: left;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    border-bottom: var(--border-light);
    white-space: nowrap;
  }

  .admin-table td {
    padding: 1rem;
    border-bottom: var(--border-subtle);
    color: var(--mist);
    font-size: 0.9rem;
    vertical-align: middle;
  }

  .admin-table tr:hover {
    background: var(--gold-glow);
  }

  .admin-input, .admin-select {
    width: 100%;
    padding: 0.75rem;
    background: var(--slate);
    border: var(--border-light);
    color: var(--ivory);
    font-size: 0.9rem;
    outline: none;
    transition: all 0.3s;
  }

  .admin-input:focus, .admin-select:focus {
    border-color: var(--gold);
  }

  .admin-btn {
    padding: 0.75rem 1.5rem;
    background: var(--gold);
    color: var(--abyss);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
  }

  .admin-btn:hover {
    background: var(--ivory);
    transform: translateY(-2px);
  }

  .admin-btn-outline {
    padding: 0.5rem 1rem;
    background: transparent;
    color: var(--mist);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: 1px solid var(--border-light);
    cursor: pointer;
    transition: all 0.3s;
  }

  .admin-btn-outline:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: var(--gold-glow);
  }

  .admin-btn-danger {
    padding: 0.5rem 1rem;
    background: var(--wine);
    color: var(--ivory);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .admin-btn-danger:hover {
    background: var(--burgundy);
  }

  .status-badge {
    padding: 0.35rem 0.75rem;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    border-radius: 2px;
  }

  /* Status Colors */
  .status-processing { background: rgba(245, 158, 11, 0.1); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
  .status-shipped { background: rgba(59, 130, 246, 0.1); color: #3B82F6; border: 1px solid rgba(59, 130, 246, 0.2); }
  .status-delivered { background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }
  .status-cancelled { background: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.2); }
  .status-returned { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; border: 1px solid rgba(139, 92, 246, 0.2); }
  .status-return-requested { background: rgba(217, 119, 6, 0.1); color: #D97706; border: 1px solid rgba(217, 119, 6, 0.2); }

  /* Dropdown Styles */
  .status-dropdown-container {
    position: relative;
    display: inline-block;
  }

  .status-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 160px;
    background: var(--charcoal);
    border: 1px solid var(--border-gold);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 100;
    margin-top: 4px;
    animation: slideDown 0.2s ease-out;
  }

  .status-dropdown-item {
    padding: 0.75rem 1rem;
    color: var(--mist);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .status-dropdown-item:hover {
    background: var(--gold-glow);
    color: var(--gold);
    padding-left: 1.25rem;
  }

  /* Modal Styles */
  .admin-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    animation: fadeIn 0.3s ease-out;
  }

  .admin-modal {
    background: var(--charcoal);
    border: 1px solid var(--border-light);
    padding: 0;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 50px rgba(0,0,0,0.7);
    animation: scaleIn 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .admin-modal-header {
    background: var(--slate);
    padding: 1.5rem 2rem;
    border-bottom: var(--border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .timeline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2rem;
    position: relative;
  }

  .timeline::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--border-subtle);
    z-index: 0;
  }

  .timeline-step {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .timeline-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--charcoal);
    border: 2px solid var(--fog);
    transition: all 0.3s;
  }

  .timeline-step.active .timeline-dot {
    background: var(--gold);
    border-color: var(--gold);
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  }

  .timeline-label {
    font-size: 0.7rem;
    color: var(--fog);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .timeline-step.active .timeline-label {
    color: var(--gold);
    font-weight: 600;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    padding: 0 2rem 2rem 2rem;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

  .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
  .admin-card { background: var(--charcoal); border: var(--border-subtle); padding: 2rem; }
  .admin-form-group { margin-bottom: 1.5rem; }
  .admin-label { display: block; font-size: 0.6rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fog); margin-bottom: 0.5rem; }
  .variant-box { background: var(--slate); padding: 1rem; border: var(--border-subtle); }
  .checkbox-group { display: flex; align-items: center; gap: 0.75rem; }
  .checkbox-group input { accent-color: var(--gold); }
`;

// =========================================================================
// HELPER COMPONENTS
// =========================================================================

// Custom Animated Dropdown
const StatusDropdown = ({ status, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'
  ];

  const getStatusClass = (s) => {
    const map = {
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled',
      'Returned': 'status-returned',
      'Return Requested': 'status-return-requested'
    };
    return map[s] || 'status-processing';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="status-dropdown-container" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`status-badge ${getStatusClass(status)}`}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <span>{status}</span>
        <svg
          width="12" height="12"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          style={{ marginLeft: '8px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <div className="status-dropdown-menu">
          {options.map(opt => (
            <div
              key={opt}
              className="status-dropdown-item"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Rich Order Details Modal
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  // Helpers
  const getColor = (s) => {
    if (s === 'Delivered' || s === 'Paid') return '#10B981';
    if (s === 'Cancelled' || s === 'Unpaid') return '#EF4444';
    if (s === 'Shipped') return '#3B82F6';
    return 'var(--gold)';
  };

  // Determine timeline progress
  const timelineSteps = [
    { label: 'Placed', date: order.createdAt, active: true },
    { label: 'Paid', date: order.paidAt, active: order.isPaid },
    { label: 'Shipped', date: order.shippedAt, active: ['Shipped', 'Delivered'].includes(order.status) },
    { label: 'Delivered', date: order.deliveredAt, active: order.status === 'Delivered' },
  ];

  // Calculate Subtotal (since backend only stores total)
  // Assuming total = subtotal - discount
  // If we had discount stored, we could reverse it. 
  // For now, we sum item totals for subtotal estimate.
  const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discount = subtotal - order.totalPrice; // Basic estimation if not stored

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <span style={{ color: 'var(--fog)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Order Details
            </span>
            <h2 style={{ color: 'var(--ivory)', fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>
              #{order._id.slice(-8).toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--mist)',
              fontSize: '2rem', cursor: 'pointer', lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Timeline */}
        {order.status !== 'Cancelled' && (
          <div className="timeline">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className={`timeline-step ${step.active ? 'active' : ''}`}>
                <div className="timeline-dot" />
                <span className="timeline-label">{step.label}</span>
                {step.date && step.active && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--stone)', marginTop: '4px' }}>
                    {new Date(step.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {order.status === 'Cancelled' && (
          <div style={{ margin: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', textAlign: 'center' }}>
            ⚠ THIS ORDER HAS BEEN CANCELLED
          </div>
        )}

        {/* Info Grid */}
        <div className="detail-grid">
          <div>
            <span className="admin-label">Customer</span>
            <p style={{ color: 'var(--ivory)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              {order.user?.name || 'Guest'}
            </p>
            <p style={{ color: 'var(--mist)', fontSize: '0.9rem' }}>
              {order.user?.email || 'No email'}
            </p>
          </div>
          <div>
            <span className="admin-label">Shipping Address</span>
            <p style={{ color: 'var(--mist)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
              {order.shippingAddress?.country}
            </p>
          </div>
          <div>
            <span className="admin-label">Payment Info</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--ivory)' }}>Method:</span>
              <span style={{ color: 'var(--gold)', fontWeight: '600' }}>{order.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--ivory)' }}>Status:</span>
              <span style={{
                color: order.isPaid ? '#10B981' : '#EF4444',
                fontWeight: '600',
                padding: '2px 6px',
                background: order.isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '2px',
                fontSize: '0.75rem'
              }}>
                {order.isPaid ? 'PAID' : 'PENDING'}
              </span>
            </div>
            {order.paidAt && (
              <p style={{ fontSize: '0.75rem', color: 'var(--stone)', marginTop: '0.5rem' }}>
                Paid on {new Date(order.paidAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Product List */}
        <div style={{ padding: '0 2rem 2rem' }}>
          <span className="admin-label" style={{ marginBottom: '1rem' }}>Order Items</span>
          <table className="admin-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 0, background: 'transparent' }}>Product</th>
                <th style={{ background: 'transparent' }}>Price</th>
                <th style={{ background: 'transparent' }}>Qty</th>
                <th style={{ background: 'transparent', textAlign: 'right', paddingRight: 0 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, idx) => (
                <tr key={idx} style={{ background: 'transparent', borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ paddingLeft: 0, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '64px', background: 'var(--slate)', flexShrink: 0 }}>
                        <img
                          src={item.image}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <p style={{ color: 'var(--ivory)', fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</p>
                        {/* Display Variant/Size if available */}
                        {(item.size || item.selectedSize) && (
                          <p style={{ color: 'var(--gold)', fontSize: '0.8rem', marginTop: '2px' }}>
                            Size: {item.size || item.selectedSize}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--mist)' }}>₹{item.price.toLocaleString('en-IN')}</td>
                  <td style={{ color: 'var(--ivory)' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', paddingRight: 0, color: 'var(--ivory)', fontWeight: '600' }}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div style={{
          background: 'var(--slate)',
          padding: '2rem',
          borderTop: 'var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--mist)' }}>Subtotal</span>
              <span style={{ color: 'var(--ivory)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--gold)' }}>Discount</span>
                <span style={{ color: 'var(--gold)' }}>- ₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)'
            }}>
              <span style={{ color: 'var(--ivory)', fontWeight: '600', fontSize: '1.2rem' }}>Total</span>
              <span style={{ color: 'var(--gold)', fontWeight: '600', fontSize: '1.2rem' }}>
                ₹{order.totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// =========================================================================
// 1. ORDER MANAGEMENT (Enhanced)
// =========================================================================
const OrderManagement = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => { fetchOrders(); }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order #${id.slice(-6).toUpperCase()} updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <h2 className="admin-section-title">Manage Orders</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    color: 'var(--ivory)',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ color: 'var(--ivory)', fontWeight: '500' }}>{order.user?.name || 'Deleted User'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--stone)' }}>{order.paymentMethod}</div>
                </td>
                <td style={{ color: 'var(--mist)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
                <td style={{ color: 'var(--gold)', fontWeight: '600' }}>
                  ₹{order.totalPrice.toLocaleString('en-IN')}
                </td>
                <td>
                  <StatusDropdown
                    status={order.status}
                    onChange={(newStatus) => handleStatusChange(order._id, newStatus)}
                  />
                </td>
                <td>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="admin-btn-outline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--stone)' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

// =========================================================================
// 2. ADD PRODUCTS & CATEGORIES
// =========================================================================
const AddComponents = ({ token, categories, fetchData }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [hasVariations, setHasVariations] = useState(true);
  const [variationType, setVariationType] = useState('Size');
  const [dynamicVariants, setDynamicVariants] = useState([{ id: Date.now(), value: '', stock: 0 }]);
  const [simpleStock, setSimpleStock] = useState(0);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const addVariantRow = () => setDynamicVariants([...dynamicVariants, { id: Date.now(), value: '', stock: 0 }]);
  const removeVariantRow = (id) => setDynamicVariants(dynamicVariants.filter(v => v.id !== id));
  const updateVariantRow = (id, field, val) => {
    setDynamicVariants(dynamicVariants.map(v => v.id === id ? { ...v, [field]: val } : v));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/categories', { name: newCategoryName }, authHeader);
      toast.success('Category created');
      setNewCategoryName('');
      fetchData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: 'This will delete all products in this category!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B8976A',
      cancelButtonColor: '#722F37',
      confirmButtonText: 'Delete',
      background: '#111111',
      color: '#E8E8E8'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${categoryId}`, authHeader);
        toast.success('Deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed');
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!productCategory) return toast.error('Select a category');

    const finalVariants = dynamicVariants
      .filter(v => v.value.trim() !== '')
      .map(v => ({ value: v.value, stock: Number(v.stock) }));

    if (hasVariations && finalVariants.length === 0) {
      return toast.error(`Add at least one ${variationType}`);
    }

    try {
      await axios.post('http://localhost:5000/api/products', {
        name: productName,
        price: Number(price),
        description,
        details,
        categoryId: productCategory,
        imageUrl,
        isFeatured,
        hasVariations,
        variationType: hasVariations ? variationType : null,
        variants: hasVariations ? finalVariants : [],
        countInStock: hasVariations ? 0 : Number(simpleStock)
      }, authHeader);

      toast.success('Product created');
      setProductName(''); setPrice(''); setDescription(''); setDetails('');
      setImageUrl(''); setIsFeatured(false);
      setDynamicVariants([{ id: Date.now(), value: '', stock: 0 }]);
      setSimpleStock(0);
      fetchData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  return (
    <div className="admin-grid">
      {/* Categories */}
      <div>
        <h2 className="admin-section-title">Categories</h2>
        <form onSubmit={handleCreateCategory} className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-form-group">
            <label className="admin-label">New Category</label>
            <input
              className="admin-input"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              placeholder="e.g. Footwear"
            />
          </div>
          <button type="submit" className="admin-btn">Add Category</button>
        </form>

        <div className="admin-card">
          <span className="admin-label">Existing Categories</span>
          {categories?.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {categories.map(cat => (
                <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--ivory)' }}>{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat._id)} className="admin-btn-danger">Delete</button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--stone)', marginTop: '1rem' }}>No categories yet</p>
          )}
        </div>
      </div>

      {/* Create Product */}
      <div>
        <h2 className="admin-section-title">Create Product</h2>
        <form onSubmit={handleCreateProduct} className="admin-card">
          <div className="admin-form-group">
            <label className="admin-label">Name</label>
            <input className="admin-input" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="admin-form-group">
              <label className="admin-label">Price (₹)</label>
              <input type="number" className="admin-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Category</label>
              <select className="admin-select" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} required>
                <option value="">Select...</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Variations */}
          <div className="variant-box" style={{ marginBottom: '1.5rem' }}>
            <div className="checkbox-group" style={{ marginBottom: '1rem' }}>
              <input type="checkbox" checked={hasVariations} onChange={(e) => setHasVariations(e.target.checked)} id="hasVar" />
              <label htmlFor="hasVar" style={{ color: 'var(--ivory)', fontSize: '0.85rem' }}>Has options (size, color, etc.)</label>
            </div>

            {hasVariations ? (
              <>
                <div className="admin-form-group">
                  <label className="admin-label">Option Type</label>
                  <input className="admin-input" value={variationType} onChange={(e) => setVariationType(e.target.value)} placeholder="Size" />
                </div>

                {dynamicVariants.map((v) => (
                  <div key={v.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      className="admin-input"
                      placeholder={variationType}
                      value={v.value}
                      onChange={(e) => updateVariantRow(v.id, 'value', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      className="admin-input"
                      placeholder="Qty"
                      value={v.stock}
                      onChange={(e) => updateVariantRow(v.id, 'stock', e.target.value)}
                      style={{ width: '80px' }}
                    />
                    {dynamicVariants.length > 1 && (
                      <button type="button" onClick={() => removeVariantRow(v.id)} style={{ color: 'var(--burgundy)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addVariantRow} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>+ Add Option</button>
              </>
            ) : (
              <div className="admin-form-group">
                <label className="admin-label">Stock Quantity</label>
                <input type="number" className="admin-input" value={simpleStock} onChange={(e) => setSimpleStock(e.target.value)} />
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea className="admin-input" value={description} onChange={(e) => setDescription(e.target.value)} required rows="2" style={{ resize: 'vertical' }} />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Details</label>
            <textarea className="admin-input" value={details} onChange={(e) => setDetails(e.target.value)} rows="3" style={{ resize: 'vertical' }} />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Image URL</label>
            <input className="admin-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required placeholder="https://..." />
          </div>

          <div className="checkbox-group" style={{ marginBottom: '1.5rem' }}>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            <label style={{ color: 'var(--mist)' }}>Feature on home page</label>
          </div>

          <button type="submit" className="admin-btn" style={{ width: '100%' }}>Create Product</button>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// 3. INVENTORY VIEW
// =========================================================================
const InventoryView = ({ token, products, categories, fetchData }) => {
  const [filterCat, setFilterCat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editVariants, setEditVariants] = useState([]);
  const [editSimpleStock, setEditSimpleStock] = useState(0);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B8976A',
      cancelButtonColor: '#722F37',
      confirmButtonText: 'Delete',
      background: '#111111',
      color: '#E8E8E8'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`, authHeader);
        toast.success('Deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed');
      }
    }
  };

  const startEditing = (product) => {
    setEditingProductId(product._id);
    if (product.hasVariations) {
      let vars = product.variants || [];
      if (vars.length === 0) vars = [{ value: 'Option', stock: 0 }];
      setEditVariants(JSON.parse(JSON.stringify(vars)));
    } else {
      setEditSimpleStock(product.countInStock);
    }
  };

  const saveStock = async (product) => {
    try {
      const payload = product.hasVariations
        ? { variants: editVariants }
        : { countInStock: editSimpleStock };
      await axios.put(`http://localhost:5000/api/products/${product._id}/stock`, payload, authHeader);
      toast.success('Stock updated');
      setEditingProductId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const updateEditVariantStock = (val, newStock) => {
    setEditVariants(editVariants.map(v => v.value === val ? { ...v, stock: Number(newStock) } : v));
  };

  const displayedProducts = products.filter(p => {
    const matchesCategory = filterCat ? p.category?._id === filterCat : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <h2 className="admin-section-title">Inventory</h2>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="admin-label">Category</label>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="admin-select">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="admin-label">Search</label>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Product name..." className="admin-input" style={{ borderBottom: '1px solid var(--iron)' }} />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {displayedProducts.map((product) => (
              <tr key={product._id}>
                <td><img src={product.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover' }} /></td>
                <td style={{ color: 'var(--ivory)', fontWeight: '500' }}>{product.name}</td>
                <td>{product.category?.name || <span style={{ color: 'var(--burgundy)' }}>None</span>}</td>
                <td style={{ color: 'var(--gold)' }}>₹{product.price}</td>
                <td>
                  {editingProductId === product._id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {product.hasVariations ? (
                        editVariants.map(v => (
                          <div key={v.value} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--fog)' }}>{v.value}</div>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => updateEditVariantStock(v.value, e.target.value)}
                              style={{ width: '40px', padding: '4px', background: 'var(--slate)', border: '1px solid var(--gold)', color: 'var(--ivory)', textAlign: 'center' }}
                            />
                          </div>
                        ))
                      ) : (
                        <input
                          type="number"
                          value={editSimpleStock}
                          onChange={(e) => setEditSimpleStock(e.target.value)}
                          style={{ width: '60px', padding: '5px', background: 'var(--slate)', border: '1px solid var(--gold)', color: 'var(--ivory)' }}
                        />
                      )}
                      <button onClick={() => saveStock(product)} style={{ background: '#10B981', color: 'white', border: 'none', padding: '6px', cursor: 'pointer' }}>✓</button>
                      <button onClick={() => setEditingProductId(null)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {product.hasVariations && product.variants ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {product.variants.map(v => (
                            <span key={v.value} style={{
                              fontSize: '0.75rem',
                              padding: '2px 6px',
                              background: v.stock < 5 ? 'rgba(239, 68, 68, 0.15)' : 'var(--slate)',
                              color: v.stock < 5 ? '#EF4444' : 'var(--mist)',
                              border: 'var(--border-subtle)'
                            }}>
                              <b>{v.value}:</b> {v.stock}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--ivory)' }}>Total: {product.countInStock}</span>
                      )}
                      <button onClick={() => startEditing(product)} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Edit</button>
                    </div>
                  )}
                </td>
                <td><button onClick={() => handleDeleteProduct(product._id)} className="admin-btn-danger">Delete</button></td>
              </tr>
            ))}
            {displayedProducts.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--stone)' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =========================================================================
// MAIN ADMIN PAGE
// =========================================================================
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const { token } = useAuth();

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/products')
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <div className="admin-tabs">
              {[
                { id: 'analytics', label: '📊 Analytics' },
                { id: 'orders', label: '📦 Orders' },
                { id: 'create', label: '➕ Add Products' },
                { id: 'inventory', label: '🏷️ Inventory' },
                { id: 'coupons', label: '🎟️ Coupons' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'analytics' && <DashboardAnalytics />}
          {activeTab === 'orders' && <OrderManagement token={token} />}
          {activeTab === 'create' && <AddComponents token={token} categories={categories} fetchData={fetchData} />}
          {activeTab === 'inventory' && <InventoryView token={token} products={products} categories={categories} fetchData={fetchData} />}
          {activeTab === 'coupons' && <CouponManager />}
        </div>
      </div>
    </>
  );
};

export default AdminPage;