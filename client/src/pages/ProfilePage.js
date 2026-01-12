import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Libraries
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css'; 
import { Country, State, City } from 'country-state-city';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const ProfilePage = () => {
  const { logout } = useContext(AuthContext); 
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // --- STATES ---
  const [userProfile, setUserProfile] = useState({ name: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState([]); 
  const [orders, setOrders] = useState([]); 
  
  // --- MODAL STATES ---
  const [showOrderList, setShowOrderList] = useState(false); 
  const [viewOrder, setViewOrder] = useState(null); 

  // --- ADDRESS FORM STATES ---
  const [isAddingNew, setIsAddingNew] = useState(false); 
  const [newAddress, setNewAddress] = useState({
    address: '', city: '', state: '', country: '', postalCode: '', phone: '', isDefault: false
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  // --- 1. SCROLL LOCK EFFECT ---
  useEffect(() => {
    if (showOrderList || viewOrder) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset';  
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showOrderList, viewOrder]);

  // --- FETCH DATA ---
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
      setUserProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      setAddresses(data.addresses || []);

      const orderRes = await axios.get('http://localhost:5000/api/orders/myorders', config);
      setOrders(orderRes.data);

    } catch (error) { console.error(error); navigate('/login'); }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [navigate]);

  // --- HANDLERS ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/users/profile', { name: userProfile.name, phone: userProfile.phone }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Profile Updated!");
    } catch (error) { toast.error("Error updating profile"); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if(!newAddress.address || !newAddress.city || !newAddress.country) return toast.error("Fill required fields");
    try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post('http://localhost:5000/api/users/address', newAddress, { headers: { Authorization: `Bearer ${token}` } });
        setAddresses(data); setIsAddingNew(false); 
        setNewAddress({ address: '', city: '', state: '', country: '', postalCode: '', phone: '', isDefault: false }); 
        toast.success("Address Added!");
        if (location.state?.fromCart) setTimeout(() => navigate('/cart'), 1500); 
    } catch (error) { toast.error("Failed to add address"); }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const { data } = await axios.put(`http://localhost:5000/api/users/address/${id}/default`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setAddresses(data); toast.success("Default Updated");
    } catch (error) { toast.error("Failed update"); }
  };

  const handleDeleteAddress = async (id) => {
      const result = await Swal.fire({ title: 'Delete Address?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes' });
      if (result.isConfirmed) {
          try {
              const token = localStorage.getItem('token');
              const { data } = await axios.delete(`http://localhost:5000/api/users/address/${id}`, { headers: { Authorization: `Bearer ${token}` } });
              setAddresses(data); toast.success("Deleted");
          } catch (error) { toast.error("Failed"); }
      }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({ title: 'Log Out?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#1a1a1a', cancelButtonColor: '#d33', confirmButtonText: 'Yes' });
    if (result.isConfirmed) { logout(); navigate('/login'); }
  };

  // --- HELPERS ---
  const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimelineStep = (status) => {
      switch(status) {
          case 'Processing': return 1;
          case 'Shipped': return 2;
          case 'Delivered': return 3;
          default: return 0; // Placed
      }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: 'var(--bg-panel)', display: 'flex', justifyContent: 'center' }}>
      
      <style>{`
          .btn-logout { color: #d63031; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; background: transparent; border: none; cursor: pointer; position: relative; padding-bottom: 4px; transition: all 0.3s ease; }
          .btn-logout::after { content: ''; position: absolute; width: 0; height: 2px; bottom: 0; left: 0; background-color: #d63031; transition: width 0.3s ease; }
          .btn-logout:hover::after { width: 100%; }
          .btn-logout:hover { transform: scale(1.05); }

          /* ANIMATED HISTORY BUTTON */
          .btn-history { background: #1a1a1a; color: white; border: none; padding: 12px 24px; border-radius: 30px; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.5px; cursor: pointer; display: flex; alignItems: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
          .btn-history:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 20px rgba(0,0,0,0.2); background: #000; }
          .btn-history:active { transform: translateY(-1px); }

          .address-card { border: 1px solid #eee; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; position: relative; background: #fff; transition: all 0.2s; }
          .address-card:hover { border-color: #000; }
          .badge-default { background: #ecfdf5; color: #047857; font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 8px; display: inline-block; }
          .btn-make-default { background: none; border: 1px solid #ddd; padding: 4px 10px; font-size: 0.7rem; font-weight: 600; cursor: pointer; border-radius: 4px; color: #555; margin-bottom: 8px; display: inline-block; transition: all 0.2s; }
          .btn-make-default:hover { border-color: #000; color: #000; }
          .btn-text-danger { color: #dc2626; font-size: 0.8rem; font-weight: 700; background: none; border: none; cursor: pointer; text-decoration: underline; }

          /* --- LEFT FLOATING MODAL CSS --- */
          .modal-backdrop { 
              position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
              background: rgba(0,0,0,0.5); z-index: 1000; 
              display: flex; justify-content: flex-start; align-items: center; 
              padding-left: 2rem; /* Space from left edge */
              padding-top: 2rem; padding-bottom: 5rem;
              opacity: 0; animation: fadeIn 0.3s forwards;
              will-change: opacity;
          }
          
          @media (max-width: 768px) {
              .modal-backdrop { justify-content: center; padding: 1rem; }
          }

          /* OUTER SHELL - HANDLES SHAPE & MASKING */
          .modal-content { 
              background: white; 
              width: 100%; 
              max-width: 650px; /* --- INCREASED WIDTH --- */
              height: 100%; max-height: 90vh; 
              border-radius: 24px; /* --- ROUNDED CORNERS --- */
              overflow: hidden;    /* --- CLIPS CHILDREN (CRITICAL FIX) --- */
              position: relative; 
              box-shadow: 0 10px 40px rgba(0,0,0,0.25); 
              display: flex; flex-direction: column;
              
              /* Slide Animation */
              transform: translateX(-50px);
              opacity: 0; 
              animation: slideFloating 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              will-change: transform, opacity;
          }

          /* INNER SCROLL AREA - HANDLES SCROLLING & PADDING */
          .modal-scroll-area {
              flex: 1;
              overflow-y: auto;
              padding: 2.5rem;
          }

          /* Custom Scrollbar to look nice inside the rounded box */
          .modal-scroll-area::-webkit-scrollbar { width: 6px; }
          .modal-scroll-area::-webkit-scrollbar-track { background: transparent; }
          .modal-scroll-area::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 20px; }
          .modal-scroll-area::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.3); }
          
          /* TIMELINE */
          .timeline { display: flex; justify-content: space-between; position: relative; margin: 3rem 0; }
          .timeline::before { content: ''; position: absolute; top: 14px; left: 0; width: 100%; height: 2px; background: #e5e5e5; z-index: 0; }
          .timeline-progress { position: absolute; top: 14px; left: 0; height: 2px; background: #10b981; z-index: 1; transition: width 0.5s ease; }
          
          .timeline-step { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; width: 25%; text-align: center; }
          
          .t-circle { width: 30px; height: 30px; border-radius: 50%; background: white; border: 3px solid #e5e5e5; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: #ccc; transition: all 0.3s ease; }
          .timeline-step.active .t-circle { border-color: #10b981; background: #10b981; color: white; }
          .t-icon { width: 14px; height: 14px; fill: currentColor; }

          .t-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 4px; }
          .t-date { font-size: 0.7rem; color: #555; font-weight: 600; white-space: nowrap; }
          .timeline-step.active .t-label { color: #10b981; }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideFloating { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      <div className="checkout-card" style={{ maxWidth: '850px', width: '90%' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <div>
                <h1 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>My Profile</h1>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Manage your account details</p>
            </div>
            
            <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                <button onClick={() => setShowOrderList(true)} className="btn-history">
                    <span>📦</span> Order History
                </button>

                <div style={{
                    width: '50px', height: '50px', background: 'var(--black)', color: 'var(--white)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: '700'
                }}>
                    {userProfile.name.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>

        {/* 1. PERSONAL INFO FORM */}
        <form onSubmit={handleProfileUpdate} style={{ marginBottom: '3rem' }}>
          <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '1.5rem', letterSpacing: '1px' }}>
              Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
              <div>
                <label style={{display:'block', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>Full Name</label>
                <input type="text" className="input-minimal" value={userProfile.name} onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} />
              </div>
              <div>
                <label style={{display:'block', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>Email</label>
                <input type="email" className="input-minimal" value={userProfile.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
          </div>
          <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>Update Info</button>
          </div>
        </form>

        {/* 2. ADDRESS BOOK SECTION */}
        <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)', letterSpacing: '1px', margin: 0 }}>
                    Address Book
                </h3>
                <button type="button" onClick={() => setIsAddingNew(!isAddingNew)} style={{ background: '#1a1a1a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isAddingNew ? "Cancel" : "+ Add New Address"}
                </button>
            </div>

            {!isAddingNew && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {addresses.length === 0 ? <p style={{ color: '#999', fontStyle: 'italic' }}>No addresses saved yet.</p> : (
                        addresses.map((addr) => (
                            <div key={addr._id} className="address-card">
                                <div style={{ marginBottom: '8px' }}>
                                    {addr.isDefault ? <span className="badge-default">Default Address</span> : <button onClick={() => handleSetDefaultAddress(addr._id)} className="btn-make-default">Set as Default</button>}
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{addr.address}</div>
                                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>{addr.city}, {addr.state} - {addr.postalCode}</div>
                                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>{addr.country} • Phone: {addr.phone}</div>
                                <button onClick={() => handleDeleteAddress(addr._id)} className="btn-text-danger">Delete</button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {isAddingNew && (
                <form onSubmit={handleAddAddress} style={{ background: '#f9fafb', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '700' }}>Enter New Address</h4>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{display:'block', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>Street Address</label>
                        <input type="text" className="input-minimal" placeholder="House No, Society, Landmark" value={newAddress.address} onChange={(e)=>setNewAddress({...newAddress, address: e.target.value})} required />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{display:'block', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>Country</label>
                            <select className="input-minimal" value={selectedCountryCode} onChange={(e) => { const c = Country.getAllCountries().find(x => x.isoCode === e.target.value); setSelectedCountryCode(e.target.value); setNewAddress({...newAddress, country: c.name}); }}><option>Select</option>{Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}</select>
                        </div>
                        <div>
                            <label style={{display:'block', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>State</label>
                            <select className="input-minimal" value={selectedStateCode} disabled={!selectedCountryCode} onChange={(e) => { const s = State.getStatesOfCountry(selectedCountryCode).find(x => x.isoCode === e.target.value); setSelectedStateCode(e.target.value); setNewAddress({...newAddress, state: s.name}); }}><option>Select</option>{State.getStatesOfCountry(selectedCountryCode).map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}</select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{display:'block', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>City</label>
                            <select className="input-minimal" value={newAddress.city} disabled={!selectedStateCode} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}><option>Select</option>{City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                        </div>
                        <div>
                            <label style={{display:'block', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>Postal Code</label>
                            <input type="text" className="input-minimal" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} required />
                        </div>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{display:'block', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>Phone Number</label>
                        <PhoneInput country={'in'} value={newAddress.phone} onChange={phone => setNewAddress({ ...newAddress, phone })} inputStyle={{ width: '100%', height: '45px', fontSize: '1rem', border: 'none', borderBottom: '1px solid #d1d1d1', background: 'transparent' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} style={{ marginRight: '10px' }} />
                        <label style={{ fontSize: '0.9rem' }}>Set as default</label>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>Save Address</button>
                </form>
            )}
        </div>

        {/* LOGOUT BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <button type="button" onClick={handleLogout} className="btn-logout">Log Out</button>
        </div>

        {/* ========================================================
            LEFT FLOATING MODAL: ORDER HISTORY LIST
           ======================================================== */}
        {showOrderList && !viewOrder && (
            <div className="modal-backdrop" onClick={() => setShowOrderList(false)}>
                {/* 1. OUTER SHELL: ROUNDED + HIDDEN OVERFLOW */}
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    
                    {/* 2. INNER SCROLL AREA */}
                    <div className="modal-scroll-area">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom:'1rem', borderBottom:'1px solid #eee' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>My Orders</h2>
                            <button onClick={() => setShowOrderList(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        
                        {orders.length === 0 ? <p style={{color:'#888', textAlign:'center'}}>No orders found.</p> : (
                            <div style={{display:'grid', gap:'1rem'}}>
                                {orders.map(order => (
                                    <div 
                                        key={order._id} 
                                        onClick={() => setViewOrder(order)}
                                        style={{ border:'1px solid #eee', padding:'1rem', borderRadius:'8px', cursor:'pointer', transition:'all 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#000'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                                    >
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                                            <div>
                                                <div style={{fontWeight:'700'}}>#{order._id.slice(-6).toUpperCase()}</div>
                                                <div style={{fontSize:'0.8rem', color:'#666'}}>{formatDate(order.createdAt)}</div>
                                            </div>
                                            <div style={{textAlign:'right'}}>
                                                <div style={{fontWeight:'700'}}>₹{order.totalPrice.toLocaleString()}</div>
                                                <span style={{fontSize:'0.7rem', textTransform:'uppercase', fontWeight:'800', color: order.status==='Delivered'?'green':'orange'}}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* --- ORDER IMAGES PREVIEW --- */}
                                        <div style={{display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'5px'}}>
                                            {order.orderItems.map((item, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={item.image} 
                                                    alt="" 
                                                    style={{width:'40px', height:'50px', objectFit:'cover', borderRadius:'4px', border:'1px solid #f0f0f0', flexShrink:0}} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* ========================================================
            LEFT FLOATING MODAL: ORDER DETAILS
           ======================================================== */}
        {viewOrder && (
            <div className="modal-backdrop" onClick={() => setViewOrder(null)}>
                {/* 1. OUTER SHELL */}
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    
                    {/* 2. INNER SCROLL AREA */}
                    <div className="modal-scroll-area">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', margin: 0, display:'flex', alignItems:'center', gap:'10px' }}>
                                <button onClick={() => setViewOrder(null)} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}}>←</button>
                                Order #{viewOrder._id.slice(-6).toUpperCase()}
                            </h3>
                            <button onClick={() => { setViewOrder(null); setShowOrderList(false); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* TIMELINE */}
                        {viewOrder.status !== 'Cancelled' && viewOrder.status !== 'Returned' && (
                            <div className="timeline">
                                <div className="timeline-progress" style={{width: `${(getTimelineStep(viewOrder.status)/3)*100}%`}}></div>
                                
                                {[
                                    { label: 'Placed', date: viewOrder.createdAt },
                                    { label: 'Processing', date: viewOrder.createdAt },
                                    { label: 'Shipped', date: viewOrder.shippedAt },
                                    { label: 'Delivered', date: viewOrder.deliveredAt }
                                ].map((step, index) => (
                                    <div key={step.label} className={`timeline-step ${getTimelineStep(viewOrder.status) >= index ? 'active' : ''}`}>
                                        <div className="t-circle">
                                            {getTimelineStep(viewOrder.status) >= index ? (
                                                <svg className="t-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                            ) : (
                                                <span style={{fontSize:'0.8rem', fontWeight:'bold'}}>{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="t-label">{step.label}</div>
                                        <div className="t-date">{formatDate(step.date)}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(viewOrder.status === 'Cancelled' || viewOrder.status === 'Returned') && (
                            <div style={{background:'#fef2f2', color:'#dc2626', padding:'1rem', borderRadius:'8px', textAlign:'center', fontWeight:'bold', marginBottom:'2rem'}}>
                                This order was {viewOrder.status}
                            </div>
                        )}

                        {/* ITEMS LIST */}
                        <div style={{ borderTop:'1px solid #eee', paddingTop:'1.5rem' }}>
                            {viewOrder.orderItems.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '65px', objectFit: 'cover', marginRight: '15px', borderRadius:'4px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Qty: {item.qty}</div>
                                    </div>
                                    <div style={{ fontWeight: '600' }}>₹{item.price.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;