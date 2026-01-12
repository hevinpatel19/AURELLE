const User = require('../models/User');

const addToCart = async (req, res) => {
  const { productId, quantity, size } = req.body; // <--- 1. Get Size
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    
    // 2. Find if item with SAME Product ID AND SAME Size exists
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      // 3. Push new item WITH size
      user.cart.push({ 
          product: productId, 
          quantity: quantity || 1, 
          size: size 
      });
    }

    await user.save();
    const populatedUser = await user.populate('cart.product');
    res.json(populatedUser.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    
    // Clean up null products (if a product was deleted from DB)
    const activeItems = user.cart.filter((item) => item.product !== null);

    if (activeItems.length < user.cart.length) {
      user.cart = activeItems;
      await user.save();
    }

    res.json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const { size } = req.body; // <--- Expect size in body for precise deletion
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    
    // Filter out the item that matches BOTH Id and Size
    user.cart = user.cart.filter(
      (item) => !(item.product.toString() === productId && item.size === size)
    );

    await user.save();
    const populatedUser = await user.populate('cart.product');
    res.json(populatedUser.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateCartQuantity = async (req, res) => {
  const { productId, newQuantity, size } = req.body; // <--- Expect size
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    
    // Find exact variant
    const item = user.cart.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (item) {
      if (newQuantity <= 0) {
        // Remove if 0
        user.cart = user.cart.filter(
          (i) => !(i.product.toString() === productId && i.size === size)
        );
      } else {
        item.quantity = newQuantity;
      }
      
      await user.save();
      const populatedUser = await user.populate('cart.product');
      res.json(populatedUser.cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
  addToCart, 
  getCart, 
  removeFromCart,
  updateCartQuantity
};