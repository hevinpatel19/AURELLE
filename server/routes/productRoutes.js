const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const {
  createProduct,
  getProducts,
  getProductById,
  createProductReview,
  getProductsByCategory,
  deleteProduct,
  deleteProductReview,
  getFeaturedProducts,
  updateProductStock, // <--- 1. ADDED THIS IMPORT
  resetAllStock
} = require('../controllers/productController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/reset-stock-fix', resetAllStock);
router.get('/:id', getProductById);
router.get('/category/:id', getProductsByCategory);

// Protected routes
router.post('/:id/reviews', protect, createProductReview);

// --- 2. FIXED TYPO BELOW (changed 'admin' to 'isAdmin') ---
router.put('/:id/stock', protect, isAdmin, updateProductStock);

// Admin-only routes
router.post('/', protect, isAdmin, createProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);
router.route('/:id/reviews/:reviewId').delete(protect, deleteProductReview);

// @route   GET /api/products/:id/related
// @desc    Get random related products (same category)
router.get('/:id/related', async (req, res) => {
  try {
    // 1. Find the original product to retrieve its category ID
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Safety Check: If no category, return empty list
    if (!product.category) {
        return res.json([]); 
    }

    // 2. Use AGGREGATION to get random products
    const relatedProducts = await Product.aggregate([
      { 
        $match: { 
          category: product.category, // Match same category
          _id: { $ne: product._id }   // Exclude current product
        } 
      },
      { $sample: { size: 4 } }        // Randomly select 4 items
    ]);

    res.json(relatedProducts);

  } catch (error) {
    console.error("Related Products API Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;