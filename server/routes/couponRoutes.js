const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// 1. CREATE Coupon (Admin)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { code, discountPercentage, expirationDate } = req.body;

    // Check if it already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountPercentage,
      expirationDate
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. GET ALL Coupons (Admin)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. DELETE Coupon (Admin)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 4. VALIDATE Coupon (User at Checkout)
router.post('/validate', async (req, res) => {
  const { couponCode } = req.body;

  if (!couponCode || typeof couponCode !== 'string') {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  try {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) return res.status(404).json({ message: 'Invalid Code' });
    if (new Date() > coupon.expirationDate) return res.status(400).json({ message: 'Coupon Expired' });

    res.json({
      message: 'Coupon Applied',
      discountPercentage: coupon.discountPercentage,
      code: coupon.code
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;