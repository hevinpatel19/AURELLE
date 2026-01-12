const mongoose = require('mongoose');

// Define the structure (schema) for a category
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // No two categories can have the same name
    trim: true,     // Removes whitespace from the beginning and end
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});

// Create the model
const Category = mongoose.model('Category', categorySchema);

// Export the model so other files can use it
module.exports = Category;