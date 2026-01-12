const express = require('express');
const router = express.Router();

// 1. Import your controller functions
const { 
  getAllCategories, 
  createCategory,
  deleteCategory // <--- You'll need this for your delete button
} = require('../controllers/categoryController');

// 2. Import your middleware
const { protect, isAdmin } = require('../middleware/authMiddleware');

// 3. Define your routes
router.get('/', getAllCategories); // <-- This route already works
router.post('/', protect, isAdmin, createCategory); // <-- This is the new route
router.delete('/:id', protect, isAdmin, deleteCategory); // <-- This is for your delete button

module.exports = router;