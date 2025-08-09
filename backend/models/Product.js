const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
  },
  category: {
    type: String,
    required: true,
    enum: ['Smartphones', 'Laptops', 'Audio', 'Cameras', 'Wearables', 'Gaming'],
  },
  brand: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [{
    type: String, // Store image filenames
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);