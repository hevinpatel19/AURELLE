const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport'); // Make sure passport is imported
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const couponRoutes = require('./routes/couponRoutes');
// Configure environment variables
dotenv.config();

// Create the Express app
const app = express();
app.use(cors());
// This lets our server accept JSON data in the body
app.use(express.json());

app.use('/api/stats', require('./routes/statsRoutes'));

// Passport Middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// Define a port to run on
const PORT = process.env.PORT || 5000;

// --- API ROUTES ---
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the server! 👋' });
});

// "Plug in" our product routes
app.use('/api/products', require('./routes/productRoutes'));

// 
// VVVV THIS IS THE LINE YOU ARE MISSING VVVV
//
// "Plug in" our new auth routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/payment', require('./routes/paymentRoutes'));

app.use('/api/cart', require('./routes/cartRoutes'));

app.use('/api/categories', require('./routes/categoryRoutes'));

app.use('/api/users', userRoutes);

app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/coupons', couponRoutes); // <--- ADD THIS LINE

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});