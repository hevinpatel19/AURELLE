const Category = require('../models/categoryModel');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create and save the new category
    const category = new Category({ name });
    const createdCategory = await category.save();

    res.status(201).json(createdCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // 1. DELETE ALL PRODUCTS WITH THIS CATEGORY ID
    await Product.deleteMany({ category: categoryId }); 
    // (Note: ensure your Product model uses 'category' or 'categoryId' field name)

    // 2. DELETE THE CATEGORY ITSELF
    const category = await Category.findByIdAndDelete(categoryId);

    if (category) {
      res.json({ message: 'Category and associated products removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Export all functions
module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory
};