import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchOrders();
    }
    // eslint-disable-next-line
  }, [user, navigate, token]);

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B8976A',
      cancelButtonColor: '#722F37',
      confirmButtonText: 'Yes, cancel order',
      background: '#111111',
      color: '#E8E8E8'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Order cancelled");
        fetchOrders();
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not cancel order");
      }
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Processing': { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
      'Shipped': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
      'Delivered': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
      'Cancelled': { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' },
      'Returned': { bg: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' },
      'Return Requested': { bg: 'rgba(217, 119, 6, 0.15)', color: '#D97706' }
    };
    return styles[status] || styles['Processing'];
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--abyss)',
        color: 'var(--fog)'
      }}>
        Loading orders...
      </div>
    );
  }

  return (
    <>
      {/* Return Modal */}
      {showReturnModal && (
        <ReturnModal
          orderId={selectedOrderId}
          token={token}
          onClose={() => setShowReturnModal(false)}
          onSuccess={() => {
            setShowReturnModal(false);
            fetchOrders();
          }}
        />
      )}

      <div style={{ minHeight: '100vh', background: 'var(--abyss)', padding: '140px 4% 80px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            marginBottom: 'var(--space-3xl)',
            paddingBottom: 'var(--space-lg)',
            borderBottom: 'var(--border-light)'
          }}>
            <h1 className="display-md" style={{ fontStyle: 'italic' }}>My Orders</h1>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)' }}>
              <h2 className="display-md" style={{ marginBottom: 'var(--space-md)' }}>
                No orders yet
              </h2>
              <p style={{ color: 'var(--fog)', marginBottom: 'var(--space-2xl)' }}>
                Your order history will appear here.
              </p>
              <Link to="/" className="btn-primary">
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              {orders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    background: 'var(--charcoal)',
                    border: 'var(--border-subtle)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-lg) var(--space-xl)',
                    background: 'var(--slate)',
                    borderBottom: 'var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: 'var(--space-md)'
                  }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2xl)', flexWrap: 'wrap' }}>
                      <div>
                        <span className="label" style={{ display: 'block', marginBottom: '4px' }}>Order</span>
                        <span style={{ color: 'var(--ivory)', fontFamily: 'monospace' }}>
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="label" style={{ display: 'block', marginBottom: '4px' }}>Date</span>
                        <span style={{ color: 'var(--ivory)' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="label" style={{ display: 'block', marginBottom: '4px' }}>Total</span>
                        <span style={{ color: 'var(--gold)', fontWeight: '600' }}>
                          ₹{order.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      padding: 'var(--space-xs) var(--space-md)',
                      fontSize: '0.65rem',
                      fontWeight: '600',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: getStatusStyle(order.status).bg,
                      color: getStatusStyle(order.status).color
                    }}>
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: 'var(--space-xl)' }}>
                    {order.orderItems.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-lg)',
                          paddingBottom: 'var(--space-md)',
                          marginBottom: 'var(--space-md)',
                          borderBottom: index < order.orderItems.length - 1 ? 'var(--border-subtle)' : 'none'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '75px',
                          background: 'var(--slate)',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            color: 'var(--ivory)',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                          }}>
                            {item.name}
                          </p>
                          <p style={{ color: 'var(--fog)', fontSize: '0.85rem' }}>
                            Qty: {item.qty}
                          </p>
                        </div>
                        <span style={{ color: 'var(--mist)' }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}

                    {/* Actions */}
                    <div style={{
                      marginTop: 'var(--space-lg)',
                      paddingTop: 'var(--space-lg)',
                      borderTop: 'var(--border-subtle)',
                      display: 'flex',
                      gap: 'var(--space-md)',
                      justifyContent: 'flex-end'
                    }}>
                      {(order.status === 'Processing' || order.status === 'Shipped') && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="btn-outline"
                          style={{
                            padding: 'var(--space-sm) var(--space-lg)',
                            borderColor: 'var(--burgundy)',
                            color: 'var(--burgundy)'
                          }}
                        >
                          Cancel Order
                        </button>
                      )}

                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => { setSelectedOrderId(order._id); setShowReturnModal(true); }}
                          className="btn-primary"
                          style={{ padding: 'var(--space-sm) var(--space-lg)' }}
                        >
                          <span>Return Order</span>
                        </button>
                      )}

                      {order.status === 'Return Requested' && (
                        <span style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>
                          Return request pending
                        </span>
                      )}

                      {order.status === 'Returned' && (
                        <span style={{ color: '#8B5CF6', fontSize: '0.85rem' }}>
                          Return completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Return Modal Component
const ReturnModal = ({ orderId, token, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [condition, setCondition] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/return`,
        { reason, condition, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Return request submitted");
      onSuccess();
    } catch (error) {
      toast.error("Failed to submit return request");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 5, 5, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--charcoal)',
          border: 'var(--border-light)',
          padding: 'var(--space-2xl)',
          width: '100%',
          maxWidth: '450px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="display-md" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xl)' }}>
          Request Return
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <select
              className="form-select"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select reason...</option>
              <option value="Defective/Damaged">Defective / Damaged</option>
              <option value="Wrong Item">Wrong Item Received</option>
              <option value="Size Issue">Size / Fit Issue</option>
              <option value="Quality Issue">Quality Not as Expected</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Item Condition</label>
            <select
              className="form-select"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">Select condition...</option>
              <option value="Unopened">Unopened (Original Seal)</option>
              <option value="Opened">Opened (Unused)</option>
              <option value="Used">Used / Tested</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional..."
              rows="3"
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'var(--slate)',
                border: 'var(--border-light)',
                color: 'var(--ivory)',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              <span>{loading ? 'Submitting...' : 'Submit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderPage;