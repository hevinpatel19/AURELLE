import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [productsRes, categoryRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/products/category/${categoryId}`),
          axios.get(`http://localhost:5000/api/categories`)
        ]);

        setProducts(productsRes.data);
        const cat = categoryRes.data.find(c => c._id === categoryId);
        setCategory(cat);
      } catch (error) {
        console.error('Error fetching category products:', error);
      }
      setLoading(false);
    };

    fetchProducts();
    window.scrollTo(0, 0);
  }, [categoryId]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--abyss)',
        color: 'var(--fog)'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--abyss)' }}>
      {/* Header */}
      <div style={{
        padding: '160px 4% 80px',
        textAlign: 'center',
        background: 'var(--midnight)',
        borderBottom: 'var(--border-subtle)'
      }}>
        <span className="section-eyebrow">Collection</span>
        <h1 className="display-lg" style={{ textTransform: 'capitalize' }}>
          {category?.name || 'Products'}
        </h1>
        <p style={{ color: 'var(--fog)', marginTop: 'var(--space-md)' }}>
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      {/* Products */}
      <section className="section">
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-4xl)' }}>
            <h2 className="display-md" style={{ marginBottom: 'var(--space-md)' }}>
              No products found
            </h2>
            <p style={{ color: 'var(--fog)', marginBottom: 'var(--space-2xl)' }}>
              This collection is currently empty.
            </p>
            <Link to="/" className="btn-primary">
              <span>Continue Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="product-grid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {products.map(product => (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="product-card"
              >
                <div className="product-card-image">
                  <img src={product.imageUrl} alt={product.name} />
                  {product.countInStock === 0 && (
                    <span style={{
                      position: 'absolute',
                      top: 'var(--space-md)',
                      left: 'var(--space-md)',
                      padding: 'var(--space-xs) var(--space-md)',
                      background: 'var(--abyss)',
                      color: 'var(--mist)',
                      fontSize: '0.6rem',
                      fontWeight: '600',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      border: 'var(--border-light)',
                      zIndex: '2'
                    }}>
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-price">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
