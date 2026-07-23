const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Coupon = require('../models/Coupon');

// @desc    Create a payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Protected
const createPaymentIntent = async (req, res) => {
  try {
    const { couponCode } = req.body;

    // 1. Get the user
    const user = await User.findById(req.user._id).populate('cart.product');
    
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // 2. Calculate the total price
    const totalAmount = user.cart.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);
    
    if (totalAmount === 0) {
      return res.status(400).json({ message: 'No valid products in cart.' });
    }

    // Recalculate discount based on coupon code
    let discountPercentage = 0;
    if (couponCode && typeof couponCode === 'string' && couponCode.trim() !== '') {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }
      if (new Date() > coupon.expirationDate) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }
      if (coupon.isActive === false) {
        return res.status(400).json({ message: 'Coupon is inactive' });
      }
      discountPercentage = coupon.discountPercentage;
    }

    const calculatedDiscount = Math.round(totalAmount * (discountPercentage / 100));
    const finalAmount = Math.max(0, totalAmount - calculatedDiscount);
    const totalInCents = Math.round(finalAmount * 100);

    // 3. Create the Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalInCents,
      currency: 'inr', 
      // VVVV --- THIS IS THE FIX --- VVVV
      // Stripe crashes if this is not a string. Add .toString()
      metadata: { userId: req.user._id.toString() }, 
      // ^^^^ --- THIS IS THE FIX --- ^^^^
    });

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500).json({ message: 'Server error creating payment', error: error.message });
  }
};

module.exports = { createPaymentIntent };