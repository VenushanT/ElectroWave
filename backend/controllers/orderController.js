const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');

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

  const paymentStatus = 'Completed'; // This would typically be set by a payment gateway

  const session = await Order.startSession();
  session.startTransaction();

  try {
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount: total,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      orderStatus: 'Pending',
    });

    await order.save({ session });

    // Reduce stock for each product
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        throw new Error(`Product ${item.product._id} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}`);
      }
      product.stock -= item.quantity;
      await product.save({ session });
    }

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    throw new Error(error.message || 'Failed to create order');
  } finally {
    session.endSession();
  }
});

// @desc    Get user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  let orders = await Order.find({ user: req.user.id }).populate('items.product');

  // Filter out items with null products and remove orders with no valid items
  orders = orders
    .map((order) => {
      const validItems = order.items.filter((item) => item.product !== null);
      return { ...order._doc, items: validItems };
    })
    .filter((order) => order.items.length > 0);

  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('user', 'firstName lastName email phoneNumber');
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
  let orders = await Order.find()
    .populate('items.product')
    .populate('user', 'firstName lastName email phoneNumber');

  // Filter out items with null products and remove orders with no valid items
  orders = orders
    .map((order) => {
      const validItems = order.items.filter((item) => item.product !== null);
      return { ...order._doc, items: validItems };
    })
    .filter((order) => order.items.length > 0);

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