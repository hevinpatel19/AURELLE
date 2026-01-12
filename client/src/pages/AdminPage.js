import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DashboardAnalytics from '../components/DashboardAnalytics'; 
import CouponManager from '../components/CouponManager';
import API_BASE_URL from "../api";


// =========================================================================
// 1. ORDER MANAGEMENT COMPONENT
// =========================================================================
const OrderManagement = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders`, {

        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${id}/status`, 

        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders(); 
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Cancelled': return { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
      case 'Returned': return { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' };
      case 'Delivered': return { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
      case 'Shipped': return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
      case 'Return Requested': return { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' };
      default: return { background: 'white', color: '#374151', border: '1px solid #ddd' };
    }
  };

  const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="modal-close-btn">×</button>
          <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Order Details <span style={{fontSize:'1rem', color:'#666', fontWeight:'normal'}}>#{order._id.slice(-6).toUpperCase()}</span>
          </h2>
          {order.returnInfo && order.returnInfo.reason && (
            <div className="return-alert">
              <h4 style={{ color: '#c2410c', margin: '0 0 0.5rem 0', display:'flex', alignItems:'center', gap:'8px', textTransform:'uppercase', fontSize:'0.9rem', fontWeight:'800' }}>⚠️ Return Requested</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.95rem', marginBottom:'0.5rem' }}>
                 <div><strong style={{color:'#ea580c'}}>Reason:</strong> {order.returnInfo.reason}</div>
                 <div><strong style={{color:'#ea580c'}}>Condition:</strong> {order.returnInfo.condition}</div>
              </div>
              {order.returnInfo.comment && <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#444', background:'rgba(255,255,255,0.6)', padding:'8px', borderRadius:'4px' }}>" {order.returnInfo.comment} "</div>}
            </div>
          )}
          <div className="modal-grid">
             <div><h4 className="modal-label">Shipping To</h4><div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '1rem' }}>{order.user?.name || 'Guest User'}</div><div style={{ lineHeight: '1.6', color: '#444', fontSize: '0.95rem' }}>{order.shippingAddress?.address}<br/>{order.shippingAddress?.city} - {order.shippingAddress?.postalCode}<br/>{order.shippingAddress?.country}</div></div>
             <div><h4 className="modal-label">Payment Info</h4><div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Method: <strong>{order.paymentMethod}</strong></div><div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Status: <span style={{ color: order.isPaid ? 'green' : 'red', fontWeight: 'bold' }}>{order.isPaid ? 'PAID' : 'NOT PAID'}</span></div><div>Total: <strong style={{ fontSize: '1.1rem' }}>₹{order.totalPrice.toLocaleString()}</strong></div></div>
          </div>
          <h4 className="modal-label">Ordered Items</h4>
          <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
             {order.orderItems.map((item, idx) => (
               <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: idx === order.orderItems.length - 1 ? 'none' : '1px solid #eee' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '1rem' }} />
                  <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          Qty: {item.qty} {item.size && <span style={{fontWeight:'700', marginLeft:'5px', color:'#000'}}>| Size: {item.size}</span>}
                      </div>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '1rem' }}>₹{item.price.toLocaleString()}</div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', marginTop: '0', textTransform: 'uppercase' }}>Manage Orders</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Order ID</th><th>User</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td data-label="Order ID" style={{ fontFamily:'monospace', fontWeight: '700' }}>#{order._id.slice(-6).toUpperCase()}</td>
                <td data-label="User" style={{ fontWeight:'600' }}>{order.user?.name || 'Deleted User'}</td>
                <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td data-label="Total" style={{ fontFamily:'monospace' }}>₹{order.totalPrice.toLocaleString()}</td>
                <td data-label="Status">
                  <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} style={{ ...getStatusStyle(order.status), padding: '8px', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem', width: '100%', maxWidth: '160px', cursor:'pointer' }}>
                    <option value="Processing">Processing</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option><option value="Return Requested">Return Requested</option><option value="Returned">Returned</option>
                  </select>
                </td>
                <td data-label=""><button onClick={() => setSelectedOrder(order)} className="view-details-btn">View Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

// =========================================================================
// 2. ADD PRODUCTS & CATEGORIES (FIXED UI & PLACEHOLDERS)
// =========================================================================
const AddComponents = ({ token, categories, fetchData }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Product Form
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState(''); 
  const [productCategory, setProductCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // --- DYNAMIC VARIATION STATE ---
  const [hasVariations, setHasVariations] = useState(true);
  const [variationType, setVariationType] = useState('Size'); 
  const [dynamicVariants, setDynamicVariants] = useState([
      { id: Date.now(), value: '', stock: 0 }
  ]);
  const [simpleStock, setSimpleStock] = useState(0); 

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Helper: Add/Remove/Update Rows
  const addVariantRow = () => setDynamicVariants([...dynamicVariants, { id: Date.now(), value: '', stock: 0 }]);
  const removeVariantRow = (id) => setDynamicVariants(dynamicVariants.filter(v => v.id !== id));
  const updateVariantRow = (id, field, val) => {
      const updated = dynamicVariants.map(v => v.id === id ? { ...v, [field]: val } : v);
      setDynamicVariants(updated);
  };

  const handleCreateCategory = async (e) => { 
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/categories`, { name: newCategoryName }, authHeader);

      toast.success('Category created!');
      setNewCategoryName('');
      fetchData(); 
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
  };

  const handleDeleteCategory = async (categoryId) => { 
    const result = await Swal.fire({ title: 'Delete Category?', text: "This will also delete all products in this category!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#1a1a1a', cancelButtonColor: '#dc2626', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try { await axios.delete(`${API_BASE_URL}/api/categories/${categoryId}`, authHeader);
     toast.success('Deleted'); fetchData(); } 
      catch (error) { toast.error('Error deleting'); }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!productCategory) return toast.error('Select a category');
    
    const finalVariants = dynamicVariants
        .filter(v => v.value.trim() !== '')
        .map(v => ({ value: v.value, stock: Number(v.stock) }));

    if (hasVariations && finalVariants.length === 0) {
        return toast.error(`Please add at least one ${variationType}`);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/products`, {

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
      
      toast.success('Product created!');
      setProductName(''); setPrice(''); setDescription(''); setDetails(''); setImageUrl(''); setIsFeatured(false);
      setDynamicVariants([{ id: Date.now(), value: '', stock: 0 }]);
      setSimpleStock(0);
      fetchData(); 
    } catch (error) { toast.error('Error creating product'); }
  };

  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' };
  const labelStyle = { fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#666', marginBottom: '0.5rem', display: 'block' };
  const sectionTitle = { fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', textTransform: 'uppercase' }; 

  return (
    <div className="fade-in">
       <div style={gridStyle}>
         {/* LEFT: CATEGORIES */}
         <div>
           <h2 style={sectionTitle}>Manage Categories</h2>
           <form onSubmit={handleCreateCategory} style={{ marginBottom: '2rem' }}>
             <label style={labelStyle}>New Category Name</label>
             <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
               <input className="input-minimal" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required placeholder="e.g. Electronics" style={{ flex: 1, marginBottom: 0 }} />
               <button type="submit" className="btn-primary" style={{ padding: '10px 30px', height:'fit-content', marginBottom:'5px' }}>ADD</button>
             </div>
           </form>
           
           {/* EXISTING CATEGORIES LIST */}
           <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
             <h3 style={{ ...labelStyle, marginBottom: '1rem' }}>Existing Categories</h3>
             <ul style={{ listStyle: 'none', padding: 0 }}>
               {categories && categories.length > 0 ? categories.map(cat => (
                 <li key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
                   <span style={{ fontWeight: '600' }}>{cat.name}</span>
                   <button onClick={() => handleDeleteCategory(cat._id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}>DELETE</button>
                 </li>
               )) : <p style={{color:'#999', fontSize:'0.9rem'}}>No categories found.</p>}
             </ul>
           </div>
         </div>

         {/* RIGHT: CREATE PRODUCT */}
         <div>
           <h2 style={sectionTitle}>Create New Product</h2>
           <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div>
                <label style={labelStyle}>Product Name</label>
                <input className="input-minimal" value={productName} onChange={(e) => setProductName(e.target.value)} required  />
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div>
                   <label style={labelStyle}>Price (₹)</label>
                   <input type="number" className="input-minimal" value={price} onChange={(e) => setPrice(e.target.value)} required  />
               </div>
               <div>
                 <label style={labelStyle}>Category</label>
                 <select className="input-minimal" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} required style={{ background: 'white' }}>
                   <option value="">Select...</option>
                   {categories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                 </select>
               </div>
             </div>

             {/* DYNAMIC VARIATION BUILDER */}
             <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' }}>
                    <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                        <input type="checkbox" checked={hasVariations} onChange={(e) => setHasVariations(e.target.checked)} id="hasVar" />
                        <label htmlFor="hasVar" style={{...labelStyle, marginBottom:0, cursor:'pointer', color:'black'}}>This product has options</label>
                    </div>
                </div>

                {hasVariations ? (
                    <>
                        <div style={{ marginBottom:'15px' }}>
                            <label style={labelStyle}>Option Name (e.g. Size, Color, Capacity)</label>
                            <input className="input-minimal" value={variationType} onChange={(e) => setVariationType(e.target.value)} placeholder="Size" />
                        </div>

                        <label style={labelStyle}>Add Options & Stock</label>
                        {dynamicVariants.map((v) => (
                            <div key={v.id} style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
                                <input 
                                    className="input-minimal" 
                                    placeholder={variationType || "Option"} 
                                    value={v.value}
                                    onChange={(e) => updateVariantRow(v.id, 'value', e.target.value)}
                                    style={{ flex: 1, marginBottom:0 }}
                                />
                                <input 
                                    type="number" 
                                    className="input-minimal" 
                                    placeholder="Qty" 
                                    value={v.stock}
                                    onChange={(e) => updateVariantRow(v.id, 'stock', e.target.value)}
                                    style={{ width:'80px', marginBottom:0 }}
                                />
                                {dynamicVariants.length > 1 && (
                                    <button type="button" onClick={() => removeVariantRow(v.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer', fontSize:'1.2rem'}}>×</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addVariantRow} style={{ fontSize:'0.85rem', fontWeight:'700', textDecoration:'underline', background:'none', border:'none', cursor:'pointer', color:'#166534' }}>+ Add Another Option</button>
                    </>
                ) : (
                    <div>
                        <label style={labelStyle}>Total Inventory Stock</label>
                        <input type="number" className="input-minimal" value={simpleStock} onChange={(e) => setSimpleStock(e.target.value)} placeholder="e.g. 100" />
                    </div>
                )}
             </div>

             <div><label style={labelStyle}>Description</label><textarea className="input-minimal" value={description} onChange={(e) => setDescription(e.target.value)} required rows="2" placeholder="Short description for product card" /></div>
             <div><label style={labelStyle}>Details</label><textarea className="input-minimal" value={details} onChange={(e) => setDetails(e.target.value)} required rows="4" placeholder="Full product details, materials, care..." /></div>
             <div><label style={labelStyle}>Image URL</label><input className="input-minimal" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required placeholder="https://..." /></div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
               <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Feature on Home Page?</label>
             </div>
             
             <button type="submit" className="btn-primary">Create Product</button>
           </form>
         </div>
       </div>
    </div>
  );
};

// =========================================================================
// 3. INVENTORY VIEW COMPONENT (FIXED FOR LEGACY PRODUCTS)
// =========================================================================
const InventoryView = ({ token, products, categories, fetchData }) => {
  const [filterCat, setFilterCat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Editing
  const [editingProductId, setEditingProductId] = useState(null);
  const [editVariants, setEditVariants] = useState([]); // Array of variant objects
  const [editSimpleStock, setEditSimpleStock] = useState(0);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({ title: 'Delete Product?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#1a1a1a', cancelButtonColor: '#dc2626', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try { await axios.delete(`${API_BASE_URL}/api/products/${productId}`, authHeader);
 toast.success('Deleted'); fetchData(); } 
      catch (error) { toast.error('Error deleting'); }
    }
  };

// --- UPDATED START EDITING ---
  const startEditing = (product) => {
    setEditingProductId(product._id);
    
    if (product.hasVariations) {
        // If variants exist, copy them. 
        // IF EMPTY (The Bug), create a default 'Option' so the input appears.
        let vars = product.variants || [];
        if (vars.length === 0) {
            vars = [{ value: 'Option', stock: 0 }];
        }
        setEditVariants(JSON.parse(JSON.stringify(vars)));
    } else {
        setEditSimpleStock(product.countInStock);
    }
  };
// --- UPDATED SAVE STOCK ---
  const saveStock = async (product) => {
    try {
        const payload = product.hasVariations 
            ? { variants: editVariants } 
            : { countInStock: editSimpleStock };

        // If we just added a default "Option" to a broken product, 
        // we might want to ensure 'hasVariations' is set to true in the backend too, just in case.
        // But the current PUT /stock endpoint handles variants/countInStock updates fine.

        await axios.put(`${API_BASE_URL}/api/products/${product._id}/stock`, payload, authHeader);

        toast.success("Stock Updated");
        setEditingProductId(null);
        fetchData(); 
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update stock");
    }
  };

  const updateEditVariantStock = (val, newStock) => {
      const updated = editVariants.map(v => v.value === val ? { ...v, stock: Number(newStock) } : v);
      setEditVariants(updated);
  };

  const displayedProducts = products.filter(p => {
      const matchesCategory = filterCat ? p.category?._id === filterCat : true;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  const sectionTitle = { fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', textTransform: 'uppercase' }; 
  const labelStyle = { fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#666', marginBottom: '0.5rem', display: 'block' };

  return (
    <div className="fade-in">
       <h2 style={sectionTitle}>Check Inventory</h2>
       <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', maxWidth: '800px', flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>Select Category</label>
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-minimal" style={{ background: 'white' }}>
                 <option value="">-- View All Categories --</option>
                 {categories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
              </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>Search Product</label>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type name to search..." className="input-minimal" />
          </div>
       </div>

       <div className="table-wrapper">
         <table>
           <thead>
             <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock Breakdown</th><th>Action</th></tr>
           </thead>
           <tbody>
             {displayedProducts.map((product) => (
               <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                 <td style={{ padding: '15px' }}><img src={product.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                 <td style={{ padding: '15px', fontWeight: '600' }}>{product.name}</td>
                 <td style={{ padding: '15px', color: '#666' }}>{product.category?.name || <span style={{color:'red'}}>Uncategorized</span>}</td>
                 <td style={{ padding: '15px' }}>₹{product.price}</td>
                 
                 {/* STOCK COLUMN */}
                 <td style={{ padding: '15px' }}>
                    {editingProductId === product._id ? (
                        product.hasVariations ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap:'wrap' }}>
                                {editVariants.map(v => (
                                    <div key={v.value} style={{ textAlign: 'center' }}>
                                        <div style={{fontSize:'0.6rem', fontWeight:'bold'}}>{v.value}</div>
                                        <input 
                                            type="number" 
                                            value={v.stock} 
                                            onChange={(e) => updateEditVariantStock(v.value, e.target.value)}
                                            style={{ width: '40px', padding: '4px', border: '1px solid #000', borderRadius:'4px', textAlign:'center' }}
                                        />
                                    </div>
                                ))}
                                <button onClick={() => saveStock(product)} style={{ background:'#166534', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' }}>✓</button>
                                <button onClick={() => setEditingProductId(null)} style={{ background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' }}>✕</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input type="number" value={editSimpleStock} onChange={(e) => setEditSimpleStock(e.target.value)} style={{ width:'60px', padding:'5px', border:'1px solid #000' }} />
                                <button onClick={() => saveStock(product)} style={{ background:'#166534', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' }}>✓</button>
                                <button onClick={() => setEditingProductId(null)} style={{ background:'#ef4444', color:'white', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer' }}>✕</button>
                            </div>
                        )
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {product.hasVariations && product.variants ? (
                                <div style={{ display: 'flex', gap: '8px', flexWrap:'wrap' }}>
                                    {product.variants.map(v => (
                                        <span key={v.value} style={{ fontSize: '0.8rem', background: v.stock < 5 ? '#fee2e2' : '#f3f4f6', padding: '2px 6px', borderRadius: '4px', border: v.stock < 5 ? '1px solid #fca5a5' : '1px solid #e5e7eb', color: v.stock < 5 ? '#b91c1c' : '#374151' }}>
                                            <b>{v.value}:</b> {v.stock}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span style={{ fontWeight:'700', fontSize:'0.9rem' }}>Total: {product.countInStock}</span>
                            )}
                            <button onClick={() => startEditing(product)} style={{ background:'transparent', border:'none', color:'#666', cursor:'pointer', fontSize:'0.8rem', textDecoration:'underline' }}>Edit</button>
                        </div>
                    )}
                 </td>

                 <td style={{ padding: '15px' }}>
                   <button onClick={() => handleDeleteProduct(product._id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>DELETE</button>
                 </td>
               </tr>
             ))}
             {displayedProducts.length === 0 && <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>No products found.</td></tr>}
           </tbody>
         </table>
       </div>
    </div>
  );
};

// =========================================================================
// MAIN PAGE COMPONENT (CONTAINER)
// =========================================================================
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('analytics'); 
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const { token } = useAuth();

  const fetchData = async () => {
    try {
      const catRes = await axios.get(`${API_BASE_URL}/api/categories`);

      setCategories(catRes.data);
      const prodRes = await axios.get(`${API_BASE_URL}/api/products`);

      setProducts(prodRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };
  
  useEffect(() => { fetchData(); }, []);

  const containerStyle = { maxWidth: '1200px', margin: '85px auto', padding: '2rem', fontFamily: '"Manrope", sans-serif' };

  return (
    <div style={containerStyle}>
      {/* GLOBAL CSS */}
      <style>{`
        .table-wrapper { background: white; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { background: #f8f9fa; padding: 16px; text-align: left; font-size: 0.85rem; color: #666; border-bottom: 2px solid #eee; text-transform: uppercase; white-space: nowrap; }
        td { padding: 16px; border-bottom: 1px solid #eee; vertical-align: middle; font-size: 1rem; color: #1a1a1a; }
        .view-details-btn { background: #1a1a1a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 700; transition: all 0.3s ease; }
        .view-details-btn:hover { background: #333; transform: translateY(-2px); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.6); z-index: 1000; display: flex; justify-content: center; alignItems: center; padding: 20px; animation: fadeIn 0.2s ease-out; }
        .modal-content { background: white; width: 100%; max-width: 700px; max-height: 90vh; border-radius: 12px; padding: 2rem; overflow-y: auto; position: relative; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: slideUp 0.3s ease-out; }
        .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 2rem; cursor: pointer; color: #666; line-height: 1; }
        .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
        .modal-label { text-transform: uppercase; font-size: 0.85rem; color: #888; margin-bottom: 0.5rem; font-weight: 700; }
        .return-alert { background: #fff7ed; border: 1px solid #fdba74; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
        .fade-in { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        /* --- INPUT MINIMAL STYLE --- */
        .input-minimal {
            width: 100%;
            padding: 10px 0;
            border: none;
            border-bottom: 1px solid #ddd;
            font-family: 'Manrope', sans-serif;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s;
            background: transparent;
        }
        .input-minimal:focus {
            border-bottom-color: #000;
        }
        .input-minimal::placeholder {
            color: #ccc;
        }

        .admin-tab-btn {
          padding: 12px 24px;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .admin-tab-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .admin-tab-btn.active {
          background: #1a1a1a;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .admin-tab-btn.inactive {
          background: #f3f4f6;
          color: #666;
        }

        @media (max-width: 768px) {
           .modal-grid { grid-template-columns: 1fr; gap: 1rem; }
           div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* HEADER & TABS */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
         <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Admin Dashboard</h1>
         
         <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('analytics')} className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : 'inactive'}`}>📊 Analytics</button>
            <button onClick={() => setActiveTab('orders')} className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : 'inactive'}`}>📦 Manage Orders</button>
            <button onClick={() => setActiveTab('create')} className={`admin-tab-btn ${activeTab === 'create' ? 'active' : 'inactive'}`}>➕ Add Product & Category</button>
            <button onClick={() => setActiveTab('inventory')} className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : 'inactive'}`}>🏷️ Inventory</button>
            <button onClick={() => setActiveTab('coupons')} className={`admin-tab-btn ${activeTab === 'coupons' ? 'active' : 'inactive'}`}>🎟️ Manage Coupons</button>
         </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'analytics' && <DashboardAnalytics />}
      {activeTab === 'orders' && <OrderManagement token={token} />}
      {activeTab === 'create' && <AddComponents token={token} categories={categories} fetchData={fetchData} />}
      {activeTab === 'inventory' && <InventoryView token={token} products={products} categories={categories} fetchData={fetchData} />}
      {activeTab === 'coupons' && <CouponManager />}
    </div>
  );
};

export default AdminPage;