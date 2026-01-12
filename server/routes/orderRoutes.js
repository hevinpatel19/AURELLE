const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
  addOrderItems, 
  getMyOrders, 
  getOrders, 
  updateOrderStatus, 
  cancelOrder, 
  returnOrder  
} = require('../controllers/orderController');

const protect = passport.authenticate('jwt', { session: false });

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// General Order Routes
router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

// User History Route
router.route('/myorders')
  .get(protect, getMyOrders);

// Admin Status Update
router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

// User Actions (Cancel & Return)
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/return').put(protect, returnOrder);

module.exports = router;