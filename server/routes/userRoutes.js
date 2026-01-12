const express = require('express');
const router = express.Router();
const passport = require('passport');

const { 
  getUserProfile, 
  updateUserProfile,
  addAddress,       // NEW
  deleteAddress,    // NEW
  getWishlist, 
  addToWishlist, 
  setAddressAsDefault,
  removeFromWishlist 
} = require('../controllers/userController');

const protect = passport.authenticate('jwt', { session: false });

// --- PROFILE ROUTES ---
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// --- ADDRESS BOOK ROUTES (NEW) ---
router.post('/address', protect, addAddress);       // Add new address
router.delete('/address/:id', protect, deleteAddress); // Delete address by ID
router.put('/address/:id/default', protect, setAddressAsDefault);

// --- WISHLIST ROUTES ---
router.get('/wishlist', protect, getWishlist);       
router.post('/wishlist', protect, addToWishlist);    
router.delete('/wishlist/:id', protect, removeFromWishlist);

module.exports = router;