const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); // <--- ADDED: Necessary to clear the cart

// 1. Create New Order (With Stock Deduction & Cart Clearing)
const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, isPaid } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // A. Validate Stock & Deduct Quantity
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }

      // Check for Variations (Size/Color) vs Simple Product
      if (product.hasVariations) {
          // Item MUST have a 'size' (variant value)
          const variantValue = item.size; 
          
          if (!variantValue) {
              res.status(400);
              throw new Error(`Please select a ${product.variationType} for ${item.name}`);
          }

          // Find specific variant (e.g. "S", "Red")
          const variant = product.variants.find(v => v.value === variantValue);

          if (!variant) {
              res.status(400);
              throw new Error(`${product.variationType} '${variantValue}' not available for ${item.name}`);
          }
          if (variant.stock < item.qty) {
            res.status(400);
            throw new Error(`Not enough stock for ${item.name} (${product.variationType}: ${variantValue})`);
          }

          // Deduct Stock
          variant.stock -= item.qty;
          product.countInStock -= item.qty;
      } else {
          // Simple Product (No Variants)
          if (product.countInStock < item.qty) {
             res.status(400);
             throw new Error(`Not enough stock for ${item.name}`);
          }
          product.countInStock -= item.qty;
      }
      
      await product.save();
    }

    // B. Create the Order
    const order = new Order({
      orderItems: orderItems.map(item => ({
          ...item,
          size: item.size || null 
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: isPaid || false, 
      paidAt: isPaid ? Date.now() : null, 
      status: 'Processing' 
    });

    const createdOrder = await order.save();

    // C. --- CRITICAL FIX: CLEAR THE USER'S CART ---
    // This finds the user and empties the 'cart' array in the database
    const user = await User.findById(req.user._id);
    if (user) {
        user.cart = []; 
        await user.save();
    }
    // ---------------------------------------------

    res.status(201).json(createdOrder);
  }
};

// 2. Get Logged In User Orders
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// 3. Get All Orders (Admin)
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.json(orders);
};

// 4. Update Order Status (Admin)
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    
    if (order.status === 'Shipped') {
        order.shippedAt = Date.now();
    }
    if (order.status === 'Delivered') {
        order.deliveredAt = Date.now();
    }

    if (order.paymentMethod === 'COD' && order.status === 'Delivered') {
        order.isPaid = true;
        order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// 5. CANCEL ORDER
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      res.status(400);
      throw new Error('Cannot cancel an order that is delivered or already cancelled');
    }
    
    // Optional: Add logic here to re-increase stock if an order is cancelled

    order.status = 'Cancelled';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// 6. RETURN ORDER
const returnOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  const { reason, condition, comment } = req.body;

  if (order) {
    if (order.status !== 'Delivered') {
      res.status(400);
      throw new Error('Can only return delivered orders');
    }

    order.status = 'Return Requested';
    order.returnInfo = {
      reason,
      condition,
      comment,
      requestedAt: Date.now()
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

module.exports = { 
    addOrderItems, 
    getMyOrders, 
    getOrders, 
    updateOrderStatus, 
    cancelOrder, 
    returnOrder 
};