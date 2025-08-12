const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'paypal', 'apple'],
  },
  paymentStatus: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Completed', 'Failed'],
  },
  orderStatus: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);