const express = require('express');
const router = express.Router();
const { 
  addToCart, 
  getCart, 
  removeFromCart,
  updateCartQuantity // <-- Import the new function
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/cart/add
router.post('/add', protect, addToCart);

// VVVV --- THIS IS THE NEW ROUTE --- VVVV
// @route   POST /api/cart/update
router.post('/update', protect, updateCartQuantity);
// ^^^^ --- THIS IS THE NEW ROUTE --- ^^^^

// @route   GET /api/cart
router.get('/', protect, getCart);

// @route   DELETE /api/cart/:productId
router.delete('/:productId', protect, removeFromCart);

module.exports = router;