import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country, State, City } from 'country-state-city';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const ProfilePage = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [userProfile, setUserProfile] = useState({ name: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState([]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address: '', city: '', state: '', country: '', postalCode: '', phone: '', isDefault: false
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
      setUserProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error(error);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/users/profile',
        { name: userProfile.name, phone: userProfile.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Error updating profile");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address || !newAddress.city || !newAddress.country) {
      return toast.error("Please fill required fields");
    }
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:5000/api/users/address', newAddress,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(data);
      setIsAddingNew(false);
      setNewAddress({ address: '', city: '', state: '', country: '', postalCode: '', phone: '', isDefault: false });
      setSelectedCountryCode('');
      setSelectedStateCode('');
      toast.success("Address added");
      if (location.state?.fromCart) setTimeout(() => navigate('/cart'), 1500);
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`http://localhost:5000/api/users/address/${id}/default`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(data);
      toast.success("Default updated");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDeleteAddress = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Address?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B8976A',
      cancelButtonColor: '#722F37',
      confirmButtonText: 'Yes, delete',
      background: '#111111',
      color: '#E8E8E8'
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.delete(`http://localhost:5000/api/users/address/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddresses(data);
        toast.success("Deleted");
      } catch (error) {
        toast.error("Failed");
      }
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B8976A',
      cancelButtonColor: '#722F37',
      confirmButtonText: 'Yes, sign out',
      background: '#111111',
      color: '#E8E8E8'
    });
    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--abyss)', padding: '140px 4% 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-3xl)',
          paddingBottom: 'var(--space-lg)',
          borderBottom: 'var(--border-light)',
          flexWrap: 'wrap',
          gap: 'var(--space-lg)'
        }}>
          <div>
            <h1 className="display-md" style={{ fontStyle: 'italic', marginBottom: 'var(--space-xs)' }}>
              My Account
            </h1>
            <p style={{ color: 'var(--fog)' }}>Manage your profile and addresses</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            <Link to="/orders" className="btn-ghost">Orders →</Link>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'var(--gold)',
              color: 'var(--abyss)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: '500'
            }}>
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <form onSubmit={handleProfileUpdate} style={{ marginBottom: 'var(--space-3xl)' }}>
          <span className="label" style={{ color: 'var(--gold)', marginBottom: 'var(--space-lg)', display: 'block' }}>
            Personal Information
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={userProfile.email}
                disabled
                style={{ opacity: 0.5 }}
              />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="submit" className="btn-primary">
              <span>Update</span>
            </button>
          </div>
        </form>

        {/* Address Book */}
        <div style={{ marginBottom: 'var(--space-3xl)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-xl)'
          }}>
            <span className="label" style={{ color: 'var(--gold)' }}>Address Book</span>
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="btn-outline"
              style={{ padding: 'var(--space-xs) var(--space-lg)' }}
            >
              {isAddingNew ? 'Cancel' : '+ Add New'}
            </button>
          </div>

          {!isAddingNew && (
            <div>
              {addresses.length === 0 ? (
                <div style={{
                  padding: 'var(--space-2xl)',
                  textAlign: 'center',
                  background: 'var(--charcoal)',
                  border: 'var(--border-subtle)'
                }}>
                  <p style={{ color: 'var(--fog)', fontStyle: 'italic' }}>No addresses saved yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      style={{
                        padding: 'var(--space-xl)',
                        background: 'var(--charcoal)',
                        border: 'var(--border-subtle)',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <div style={{ marginBottom: 'var(--space-sm)' }}>
                        {addr.isDefault ? (
                          <span style={{
                            display: 'inline-block',
                            padding: 'var(--space-2xs) var(--space-sm)',
                            background: 'var(--gold-glow)',
                            color: 'var(--gold)',
                            fontSize: '0.6rem',
                            fontWeight: '600',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            border: 'var(--border-gold)'
                          }}>
                            Default
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            style={{
                              padding: 'var(--space-2xs) var(--space-sm)',
                              background: 'transparent',
                              border: 'var(--border-light)',
                              color: 'var(--fog)',
                              fontSize: '0.6rem',
                              fontWeight: '500',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              cursor: 'pointer'
                            }}
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                      <p style={{ color: 'var(--ivory)', marginBottom: '4px', fontWeight: '500' }}>
                        {addr.address}
                      </p>
                      <p style={{ color: 'var(--fog)', lineHeight: '1.6', marginBottom: 'var(--space-md)' }}>
                        {addr.city}, {addr.state} — {addr.postalCode}<br />
                        {addr.country} • {addr.phone}
                      </p>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        style={{
                          color: 'var(--burgundy)',
                          fontSize: '0.75rem',
                          textDecoration: 'underline',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAddingNew && (
            <form
              onSubmit={handleAddAddress}
              style={{
                background: 'var(--charcoal)',
                padding: 'var(--space-2xl)',
                border: 'var(--border-subtle)'
              }}
            >
              <h3 className="display-md" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-xl)' }}>
                New Address
              </h3>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="House No, Street, Landmark"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    value={selectedCountryCode}
                    onChange={(e) => {
                      const c = Country.getAllCountries().find(x => x.isoCode === e.target.value);
                      setSelectedCountryCode(e.target.value);
                      setSelectedStateCode('');
                      setNewAddress({ ...newAddress, country: c?.name || '', state: '', city: '' });
                    }}
                  >
                    <option value="">Select</option>
                    {Country.getAllCountries().map(c => (
                      <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <select
                    className="form-select"
                    value={selectedStateCode}
                    disabled={!selectedCountryCode}
                    onChange={(e) => {
                      const s = State.getStatesOfCountry(selectedCountryCode).find(x => x.isoCode === e.target.value);
                      setSelectedStateCode(e.target.value);
                      setNewAddress({ ...newAddress, state: s?.name || '', city: '' });
                    }}
                  >
                    <option value="">Select</option>
                    {State.getStatesOfCountry(selectedCountryCode).map(s => (
                      <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select
                    className="form-select"
                    value={newAddress.city}
                    disabled={!selectedStateCode}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  >
                    <option value="">Select</option>
                    {City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    required
                    style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-md)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <PhoneInput
                  country={'in'}
                  value={newAddress.phone}
                  onChange={phone => setNewAddress({ ...newAddress, phone })}
                  inputStyle={{
                    width: '100%',
                    height: '50px',
                    background: 'var(--slate)',
                    border: 'var(--border-light)',
                    color: 'var(--ivory)',
                    borderRadius: '0'
                  }}
                  buttonStyle={{
                    background: 'var(--slate)',
                    border: 'var(--border-light)',
                    borderRadius: '0'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-xl)'
              }}>
                <input
                  type="checkbox"
                  id="setDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  style={{ accentColor: 'var(--gold)' }}
                />
                <label htmlFor="setDefault" style={{ color: 'var(--mist)' }}>Set as default</label>
              </div>

              <button type="submit" className="submit-btn">
                Save Address
              </button>
            </form>
          )}
        </div>

        {/* Logout */}
        <div style={{ paddingTop: 'var(--space-xl)', borderTop: 'var(--border-light)' }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              color: 'var(--burgundy)',
              fontSize: '0.75rem',
              fontWeight: '500',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              paddingBottom: '4px'
            }}
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;