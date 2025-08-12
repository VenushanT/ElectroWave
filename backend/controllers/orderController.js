const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

// @desc    Create order from cart (simulate payment)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, paymentDetails } = req.body;

  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let subtotal = 0;
  const orderItems = cart.items.map(item => {
    const itemPrice = item.product.price * item.quantity;
    subtotal += itemPrice;
    return {
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    };
  });

  const shipping = subtotal > 99 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const paymentStatus = 'Completed';

  const order = new Order({
    user: req.user.id,
    items: orderItems,
    totalAmount: total,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    orderStatus: 'Pending',
  });

  await order.save();

  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// @desc    Get user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate('items.product');
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('user', 'firstName lastName email phone');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized');
  }
  res.json(order);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('items.product')
    .populate('user', 'firstName lastName email phone');
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Public
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.orderStatus = status;
  await order.save();
  res.json(order);
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };