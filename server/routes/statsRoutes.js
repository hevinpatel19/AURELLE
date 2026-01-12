const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @route   GET /api/stats
// @desc    Get Admin Dashboard Stats
router.get('/', async (req, res) => {
  try {
    // 1. Basic Counts
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    const usersCount = await User.countDocuments();

    // 2. Total Revenue
    const totalRevenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 3. Daily Sales & Orders (Last 30 Days)
    const dailyStats = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }, // Sort by Date (Ascending)
      { $limit: 30 } // Take last 30 entries
    ]);

    // Format for Recharts
    const chartData = dailyStats.map(item => ({
      date: item._id,
      sales: item.sales,
      orders: item.orders
    }));

    // 4. Top Selling Products (Top 5)
    const topProducts = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$orderItems" }, // Split orders into individual items
      {
        $group: {
          _id: "$orderItems.name",
          totalSold: { $sum: "$orderItems.qty" }
        }
      },
      { $sort: { totalSold: -1 } }, // Highest sold first
      { $limit: 5 } // Only top 5
    ]);

    res.json({
      counts: {
        products: productsCount,
        orders: ordersCount,
        users: usersCount,
        revenue: totalRevenue
      },
      chartData,
      topProducts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error Fetching Stats' });
  }
});

module.exports = router;