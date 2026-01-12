const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// @desc    Create a payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Protected
const createPaymentIntent = async (req, res) => {
  try {
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

    const totalInCents = Math.round(totalAmount * 100);

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