const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  price: { type: Number, required: true, default: 0 },
  
  // --- DYNAMIC VARIATIONS ---
  // 1. Do we have variants?
  hasVariations: { type: Boolean, default: true }, 

  // 2. What is the label? (e.g. "Size", "Color", "Storage", "Dimensions")
  variationType: { type: String, default: "Size" }, 

  // 3. The actual options
  variants: [
    {
      value: { type: String, required: true }, // e.g. "S", "UK 6", "128GB"
      stock: { type: Number, default: 0 }      // e.g. 15
    }
  ],
  // --------------------------

  // Total stock (calculated automatically for variants, or manual for simple items)
  countInStock: { type: Number, required: true, default: 0 },
  
  isFeatured: { type: Boolean, required: true, default: false },
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, { timestamps: true });

// Middleware: Auto-calculate stock
productSchema.pre('save', function(next) {
  if (this.hasVariations && this.variants && this.variants.length > 0) {
    this.countInStock = this.variants.reduce((acc, item) => acc + item.stock, 0);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;