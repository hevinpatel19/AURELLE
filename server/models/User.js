const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  role: {
    type: String,
    enum: ['user', 'admin'], 
    default: 'user',        
  },
  
  // --- NEW: ADDRESS BOOK ARRAY ---
  addresses: [
    {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
      isDefault: { type: Boolean, default: false } // To mark the primary address
    }
  ],
  // ------------------------------

// --- UPDATE THE CART SCHEMA HERE ---
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      // VVV ADD THIS FIELD VVV
      size: {
        type: String,
        required: false, 
        default: 'N/A' // Default fallback
      }
      // ^^^ ADD THIS FIELD ^^^
    },
  ],

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]

}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;