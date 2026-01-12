const Product = require('../models/Product');
const mongoose = require('mongoose');
const User = require('../models/User');

// --- 1. CREATE PRODUCT (UPDATED FOR DYNAMIC VARIANTS) ---
const createProduct = async (req, res) => {
  try {
    // Destructure ALL new fields
    const { 
        name, price, description, details, imageUrl, categoryId, isFeatured, 
        countInStock, hasVariations, variationType, variants 
    } = req.body; 
    
    const product = new Product({
      name, 
      price, 
      description, 
      details: details || "No details available", 
      imageUrl,
      category: categoryId,
      isFeatured: isFeatured,
      
      // --- NEW FIELDS MAPPING ---
      hasVariations: hasVariations || false,
      variationType: variationType || null,
      variants: variants || [],
      
      // If hasVariations is true, countInStock will be auto-calculated by the Model Middleware
      // If false (Simple Product), use the manual countInStock passed from frontend
      countInStock: hasVariations ? 0 : (countInStock || 0),
      
      user: req.user ? req.user._id : null, 
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error); 
    res.status(500).json({ message: 'Error creating product' });
  }
};

// --- 2. GET ALL PRODUCTS ---
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// --- 3. GET SINGLE PRODUCT ---
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- 4. REVIEW FUNCTION ---
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (product) {
      const review = {
        name: user.name, 
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.find({ category: id });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const review = product.reviews.find(
        (r) => r._id.toString() === req.params.reviewId.toString()
      );

      if (!review) {
        res.status(404);
        throw new Error('Review not found');
      }

      if (review.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this review');
      }

      product.reviews = product.reviews.filter(
        (r) => r._id.toString() !== req.params.reviewId.toString()
      );

      product.numReviews = product.reviews.length;
      
      product.rating =
        product.reviews.length > 0
          ? product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length
          : 0;

      await product.save();
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- 5. UPDATE STOCK FUNCTION (DYNAMIC) ---
const updateProductStock = async (req, res) => {
  // We expect: { variants: [{value: "S", stock: 10}, ...], countInStock: 50 (only if no variants) }
  const { variants, countInStock } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.hasVariations) {
          // Update variants and recalc total
          product.variants = variants;
          const totalStock = variants.reduce((acc, item) => acc + Number(item.stock), 0);
          product.countInStock = totalStock;
      } else {
          // Simple product, just update the total count
          product.countInStock = Number(countInStock);
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error("Stock Update Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// --- TEMPORARY: RUN THIS ONCE TO RESET STOCK ---
const resetAllStock = async (req, res) => {
  try {
    // Sets ALL products to have 15 stock
    await Product.updateMany({}, { $set: { countInStock: 15 } });
    res.json({ message: "All products stock reset to 15!" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting stock" });
  }
};

module.exports = { 
  createProduct, 
  getProducts, 
  getProductById, 
  createProductReview,
  getProductsByCategory,
  deleteProduct,
  deleteProductReview,
  getFeaturedProducts,
  updateProductStock,
  resetAllStock 
};