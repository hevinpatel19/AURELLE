import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // State for Return Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
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
      text: "Are you sure you want to cancel this order?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Order Cancelled");
        fetchOrders();
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not cancel order");
      }
    }
  };

  const openReturnModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowReturnModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#10b981'; 
      case 'Shipped': return '#3b82f6';   
      case 'Cancelled': return '#ef4444'; 
      case 'Returned': return '#8b5cf6';
      case 'Return Requested': return '#d97706'; 
      default: return '#f59e0b';          
    }
  };

  if (token && !user) {
      return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '100px auto', padding: '2rem', fontFamily: '"Manrope", sans-serif' }}>
      
      {/* --- RETURN FORM MODAL COMPONENT --- */}
      {showReturnModal && (
        <ReturnRequestForm 
          orderId={selectedOrderId} 
          token={token}
          onClose={() => setShowReturnModal(false)}
          onSuccess={() => {
             setShowReturnModal(false);
             fetchOrders();
          }}
        />
      )}

      <h1 className="section-title" style={{ marginBottom: '2rem', fontSize: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>My Orders</h1>
      
      {orders.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>You haven't placed any orders yet.</p>
         </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              
              {/* HEADER */}
              <div style={{ background: '#f8f9fa', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '1rem' }}>
                 <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>Order Placed</span>
                        <span style={{ fontSize: '0.9rem', color: '#374151' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>Total Amount</span>
                        <span style={{ fontSize: '0.9rem', color: '#374151', fontFamily: 'monospace', fontWeight: '700' }}>₹{order.totalPrice.toLocaleString()}</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>Order ID</span>
                        <span style={{ fontSize: '0.9rem', color: '#374151', fontFamily: 'monospace' }}>#{order._id.slice(-6).toUpperCase()}</span>
                    </div>
                 </div>
                 
                 <div style={{ 
                    padding: '6px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700',
                    color: 'white', backgroundColor: getStatusColor(order.status), textTransform: 'uppercase'
                 }}>
                    {order.status}
                 </div>
              </div>

              {/* BODY */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0' }}>
                <div style={{ padding: '1.5rem', borderRight: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', color: '#374151' }}>Items</h4>
                  {order.orderItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #eee', marginRight: '1rem' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 4px 0', color: '#111', textTransform: 'uppercase' }}>{item.name}</p>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Quantity: {item.qty}</p>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#374151' }}>₹{item.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '1.5rem', background: '#fafafa', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                   <div>
                       <div style={{ marginBottom: '2rem' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', color: '#6b7280' }}>Delivery Address</h4>
                          {order.shippingAddress ? (
                              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#374151', margin: 0 }}>
                                {order.shippingAddress.address}<br/>
                                {order.shippingAddress.city} {order.shippingAddress.postalCode && `- ${order.shippingAddress.postalCode}`}<br/>
                                {order.shippingAddress.country}
                              </p>
                          ) : (
                              <p style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic' }}>Address not available</p>
                          )}
                       </div>

                       {/* --- PAYMENT STATUS SECTION (FIXED) --- */}
                       <div style={{ marginBottom: '2rem' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', color: '#6b7280' }}>Payment Information</h4>
                          
                          <div style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{fontWeight:'700'}}>Method:</span> {order.paymentMethod}
                          </div>

                          {/* PAYMENT STATUS CHECK */}
                          {order.isPaid ? (
                             <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '700' }}>
                               ✅ Paid
                             </div>
                          ) : (
                             <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', fontWeight: '700' }}>
                               ⏳ Payment Pending
                             </div>
                          )}

                          {/* SHOW AMOUNT TO PAY IF NOT PAID (E.G. COD) */}
                          {!order.isPaid && (
                             <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ccc' }}>
                                <span style={{ fontSize: '0.85rem', color:'#666' }}>Amount to be paid:</span><br/>
                                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#c2410c' }}>₹{order.totalPrice.toLocaleString()}</span>
                             </div>
                          )}
                       </div>
                   </div>

                   {/* BUTTONS */}
                   <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                      {(order.status === 'Processing' || order.status === 'Shipped') && (
                          <button 
                            onClick={() => handleCancelOrder(order._id)}
                            style={{ width: '100%', padding: '10px', background: 'white', border: '1px solid #ef4444', color: '#ef4444', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }}
                          >
                            CANCEL ORDER
                          </button>
                      )}

                      {order.status === 'Delivered' && (
                          <button 
                            onClick={() => openReturnModal(order._id)}
                            style={{ width: '100%', padding: '10px', background: '#1a1a1a', border: 'none', color: 'white', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            RETURN ORDER
                          </button>
                      )}
                      
                      {order.status === 'Return Requested' && (
                          <div style={{ textAlign:'center', color:'#d97706', fontSize:'0.9rem', fontWeight:'600' }}>
                              Return Request Sent ⏳
                          </div>
                      )}
                      
                      {order.status === 'Returned' && (
                          <div style={{ textAlign:'center', color:'#8b5cf6', fontSize:'0.9rem', fontWeight:'600' }}>
                              Return Approved ✅
                          </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- INTERNAL COMPONENT: RETURN FORM ---
const ReturnRequestForm = ({ orderId, token, onClose, onSuccess }) => {
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
      toast.success("Return Request Submitted!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to submit return request");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '12px',
        width: '90%', maxWidth: '500px', position: 'relative'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '800' }}>Request Return</h2>
        
        <form onSubmit={handleSubmit}>
           <div style={{ marginBottom: '1rem' }}>
              <label style={{ display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem' }}>Reason for Return</label>
              <select required value={reason} onChange={(e)=>setReason(e.target.value)} style={{ width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd' }}>
                 <option value="">Select a reason...</option>
                 <option value="Defective/Damaged">Defective / Damaged</option>
                 <option value="Wrong Item">Wrong Item Received</option>
                 <option value="Size Issue">Size / Fit Issue</option>
                 <option value="Quality Issue">Quality Not as Expected</option>
                 <option value="Other">Other</option>
              </select>
           </div>

           <div style={{ marginBottom: '1rem' }}>
              <label style={{ display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem' }}>Item Condition</label>
              <select required value={condition} onChange={(e)=>setCondition(e.target.value)} style={{ width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd' }}>
                 <option value="">Select condition...</option>
                 <option value="Unopened">Unopened (Original Seal)</option>
                 <option value="Opened">Opened (Unused)</option>
                 <option value="Used">Used / Tested</option>
                 <option value="Damaged">Damaged</option>
              </select>
           </div>

           <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem' }}>
                Additional Comments <span style={{fontWeight:'400', color:'#888'}}>(Optional)</span>
              </label>
              <textarea 
                value={comment} 
                onChange={(e)=>setComment(e.target.value)}
                placeholder="Please describe the issue..."
                rows="4"
                style={{ width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd', fontFamily:'inherit' }}
              />
           </div>

           <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={onClose} style={{ flex:1, padding:'12px', background:'#f3f4f6', border:'none', borderRadius:'6px', fontWeight:'600', cursor:'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex:1, padding:'12px', background:'#1a1a1a', color:'white', border:'none', borderRadius:'6px', fontWeight:'600', cursor:'pointer' }}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default OrderPage;