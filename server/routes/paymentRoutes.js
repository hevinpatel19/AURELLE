const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/payment/create-payment-intent
// This route is protected. You must be logged in to pay.
router.post('/create-payment-intent', protect, createPaymentIntent);

module.exports = router;