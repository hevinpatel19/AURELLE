const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); // <--- ADDED: Necessary to clear the cart
const Coupon = require('../models/Coupon');

// 1. Create New Order (With Stock Deduction & Cart Clearing)
const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, isPaid, couponCode } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // A. Validate Stock & Deduct Quantity Atomically (Prevents Race Conditions)
    let calculatedSubtotal = 0;
    const deductedItems = [];

    try {
      for (const item of orderItems) {
        const existingProduct = await Product.findById(item.product);
        if (!existingProduct) {
          res.status(404);
          throw new Error(`Product not found: ${item.name}`);
        }

        let updatedProduct;

        if (existingProduct.hasVariations) {
          const variantValue = item.size;
          if (!variantValue) {
            res.status(400);
            throw new Error(`Please select a ${existingProduct.variationType} for ${item.name}`);
          }

          // Check if variant exists at all
          const variantExists = existingProduct.variants.some(v => v.value === variantValue);
          if (!variantExists) {
            res.status(400);
            throw new Error(`${existingProduct.variationType} '${variantValue}' not available for ${item.name}`);
          }

          // Atomically check stock >= item.qty and decrement stock in 1 query
          updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              variants: {
                $elemMatch: {
                  value: variantValue,
                  stock: { $gte: item.qty }
                }
              }
            },
            {
              $inc: {
                "variants.$.stock": -item.qty,
                "countInStock": -item.qty
              }
            },
            { new: true }
          );

          if (!updatedProduct) {
            res.status(400);
            throw new Error(`Not enough stock for ${item.name} (${existingProduct.variationType}: ${variantValue})`);
          }

          deductedItems.push({
            productId: item.product,
            hasVariations: true,
            variantValue: variantValue,
            qty: item.qty
          });
        } else {
          // Simple Product (No Variants) - Atomically check countInStock >= item.qty
          updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              countInStock: { $gte: item.qty }
            },
            {
              $inc: { countInStock: -item.qty }
            },
            { new: true }
          );

          if (!updatedProduct) {
            res.status(400);
            throw new Error(`Not enough stock for ${item.name}`);
          }

          deductedItems.push({
            productId: item.product,
            hasVariations: false,
            qty: item.qty
          });
        }

        // Recalculate subtotal using database price
        calculatedSubtotal += existingProduct.price * item.qty;
        item.price = existingProduct.price;
      }
    } catch (error) {
      // Rollback any stock already deducted in this loop if a subsequent item fails
      for (const rollbackItem of deductedItems) {
        if (rollbackItem.hasVariations) {
          await Product.updateOne(
            { _id: rollbackItem.productId, "variants.value": rollbackItem.variantValue },
            {
              $inc: {
                "variants.$.stock": rollbackItem.qty,
                "countInStock": rollbackItem.qty
              }
            }
          );
        } else {
          await Product.updateOne(
            { _id: rollbackItem.productId },
            { $inc: { countInStock: rollbackItem.qty } }
          );
        }
      }
      throw error;
    }

    // Recalculate discount based on coupon code
    let discountPercentage = 0;
    if (couponCode && typeof couponCode === 'string' && couponCode.trim() !== '') {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) {
        res.status(400);
        throw new Error('Invalid coupon code');
      }
      if (new Date() > coupon.expirationDate) {
        res.status(400);
        throw new Error('Coupon has expired');
      }
      if (coupon.isActive === false) {
        res.status(400);
        throw new Error('Coupon is inactive');
      }
      discountPercentage = coupon.discountPercentage;
    }

    const calculatedDiscount = Math.round(calculatedSubtotal * (discountPercentage / 100));
    const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);

    // Verify frontend-provided totalPrice (allowing ±1 tolerance due to potential rounding differences)
    if (Math.abs(totalPrice - calculatedTotal) > 1) {
      res.status(400);
      throw new Error(`Order total verification failed. Expected: ₹${calculatedTotal}, Received: ₹${totalPrice}`);
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
      totalPrice: calculatedTotal,
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
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. Get All Orders (Admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 4. Update Order Status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
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
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. CANCEL ORDER (WITH STOCK RESTORATION)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.status === 'Delivered' || order.status === 'Cancelled') {
        return res.status(400).json({ message: 'Cannot cancel an order that is delivered or already cancelled' });
      }
      
      // Re-increase stock for each item in the order
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          if (product.hasVariations && item.size) {
            const variant = product.variants.find(v => v.value === item.size);
            if (variant) {
              variant.stock += item.qty;
            }
            // countInStock will be recalculated by the pre-save middleware
          } else {
            product.countInStock += item.qty;
          }
          await product.save();
        }
      }

      order.status = 'Cancelled';
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 6. RETURN ORDER
const returnOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    const { reason, condition, comment } = req.body;

    if (order) {
      if (order.status !== 'Delivered') {
        return res.status(400).json({ message: 'Can only return delivered orders' });
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
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 7. APPROVE RETURN (Admin)
const approveReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Return Requested') {
      return res.status(400).json({ message: 'This order does not have a pending return request' });
    }

    // Re-increase stock for each item in the order
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.hasVariations && item.size) {
          const variant = product.variants.find(v => v.value === item.size);
          if (variant) {
            variant.stock += item.qty;
          }
          // countInStock will be recalculated by the pre-save middleware
        } else {
          product.countInStock += item.qty;
        }
        await product.save();
      }
    }

    order.status = 'Returned';
    order.returnInfo = {
      ...order.returnInfo.toObject(),
      adminAction: 'Approved'
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 8. REJECT RETURN (Admin)
const rejectReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    const { rejectionReason } = req.body;

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Return Requested') {
      return res.status(400).json({ message: 'This order does not have a pending return request' });
    }

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ message: 'Please provide a reason for rejection' });
    }

    order.status = 'Delivered';
    order.returnInfo = {
      ...order.returnInfo.toObject(),
      adminAction: 'Rejected',
      rejectionReason: rejectionReason.trim()
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
    addOrderItems, 
    getMyOrders, 
    getOrders, 
    updateOrderStatus, 
    cancelOrder, 
    returnOrder,
    approveReturn,
    rejectReturn 
};