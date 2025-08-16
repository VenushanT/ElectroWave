// orderController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Create order from cart (simulate payment)
// @route   POST /api/orders
// @access  Private (with verifyToken)
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, paymentDetails } = req.body;

  // Validate input
  if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length === 0) {
    res.status(400);
    throw new Error('Shipping address is required');
  }
  if (!paymentMethod || !['card', 'paypal', 'apple', 'cod'].includes(paymentMethod)) {
    res.status(400);
    throw new Error('Valid payment method is required (card, paypal, apple, or cod)');
  }
  if (paymentMethod !== 'cod' && (!paymentDetails || typeof paymentDetails !== 'object')) {
    res.status(400);
    throw new Error('Payment details are required for non-COD payments');
  }

  // Fetch and validate cart
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'productName price stock images rating numReviews')
    .lean()
    .exec();
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Validate user
  const user = await User.findById(req.user.id).lean().exec();
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Calculate order items and totals
  let subtotal = 0;
  const orderItems = cart.items
    .filter((item) => item.product && item.product._id && item.quantity > 0)
    .map((item) => {
      const itemPrice = item.product.price * item.quantity;
      subtotal += itemPrice;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

  if (orderItems.length === 0) {
    res.status(400);
    throw new Error('No valid items in cart');
  }

  const shipping = subtotal > 99 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Set payment status based on payment method
  const paymentStatus = paymentMethod === 'cod' ? 'Pending' : 'Completed';

  // Start MongoDB transaction
  const session = await Order.startSession();
  session.startTransaction();

  try {
    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount: parseFloat(total.toFixed(2)),
      shippingAddress: shippingAddress.trim(),
      paymentMethod,
      paymentStatus,
      orderStatus: 'Pending',
    });

    await order.save({ session });

    // Update product stock
    for (const item of cart.items) {
      if (!item.product || !item.product._id) {
        throw new Error('Invalid product in cart');
      }
      const product = await Product.findById(item.product._id).session(session);
      if (!product) {
        throw new Error(`Product ${item.product._id} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}. Only ${product.stock} available.`);
      }
      product.stock -= item.quantity;
      await product.save({ session });
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] },
      { session }
    );

    await session.commitTransaction();

    // Fetch populated order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'productName price images rating numReviews')
      .populate('user', 'firstName lastName email phoneNumber')
      .lean()
      .exec();

    // Format response to ensure frontend compatibility
    const formattedOrder = {
      _id: populatedOrder._id,
      user: {
        _id: populatedOrder.user._id,
        firstName: populatedOrder.user.firstName,
        lastName: populatedOrder.user.lastName,
        email: populatedOrder.user.email,
        phoneNumber: populatedOrder.user.phoneNumber || '',
      },
      items: populatedOrder.items.map((item) => ({
        product: {
          _id: item.product?._id || null,
          productName: item.product?.productName || 'Unknown Product',
          price: item.product?.price || 0,
          images: item.product?.images || [],
          rating: Number(item.product?.rating) || 0,
          numReviews: Number(item.product?.numReviews) || 0,
        },
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: populatedOrder.totalAmount,
      shippingAddress: populatedOrder.shippingAddress,
      paymentMethod: populatedOrder.paymentMethod,
      paymentStatus: populatedOrder.paymentStatus,
      orderStatus: populatedOrder.orderStatus,
      createdAt: populatedOrder.createdAt,
      updatedAt: populatedOrder.updatedAt,
    };

    res.status(201).json(formattedOrder);
  } catch (error) {
    await session.abortTransaction();
    throw new Error(error.message || 'Failed to create order');
  } finally {
    session.endSession();
  }
});

// @desc    Get user's orders
// @route   GET /api/orders/myorders
// @access  Private (with verifyToken)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'productName price images rating numReviews')
    .lean()
    .exec();

  // Format orders and filter out invalid items
  const formattedOrders = orders
    .map((order) => {
      const validItems = order.items
        .filter((item) => item.product && item.product._id)
        .map((item) => ({
          product: {
            _id: item.product._id,
            productName: item.product.productName,
            price: item.product.price,
            images: item.product.images,
            rating: Number(item.product.rating) || 0,
            numReviews: Number(item.product.numReviews) || 0,
          },
          quantity: item.quantity,
          price: item.price,
        }));
      return validItems.length > 0 ? { 
        ...order, 
        items: validItems,
        user: {
          _id: order.user._id,
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          email: order.user.email,
          phoneNumber: order.user.phoneNumber || '',
        }
      } : null;
    })
    .filter((order) => order !== null);

  res.json(formattedOrders);
});

// @desc    Get user's orders count
// @route   GET /api/orders/count
// @access  Private (with verifyToken)
const getMyOrdersCount = asyncHandler(async (req, res) => {
  const count = await Order.countDocuments({ user: req.user.id });
  res.json({ count });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (with verifyToken)
const getOrderById = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400);
    throw new Error('Order ID is missing');
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error(`Invalid order ID: ${req.params.id}`);
  }

  const order = await Order.findById(req.params.id)
    .populate('items.product', 'productName price images rating numReviews')
    .populate('user', 'firstName lastName email phoneNumber')
    .lean()
    .exec();

  if (!order) {
    res.status(404);
    throw new Error(`Order not found with ID: ${req.params.id}`);
  }

  const formattedOrder = {
    _id: order._id,
    user: {
      _id: order.user._id,
      firstName: order.user.firstName,
      lastName: order.user.lastName,
      email: order.user.email,
      phoneNumber: order.user.phoneNumber || '',
    },
    items: order.items
      .filter((item) => item.product && item.product._id)
      .map((item) => ({
        product: {
          _id: item.product._id,
          productName: item.product.productName,
          price: item.product.price,
          images: item.product.images,
          rating: Number(item.product.rating) || 0,
          numReviews: Number(item.product.numReviews) || 0,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };

  if (formattedOrder.items.length === 0) {
    res.status(404);
    throw new Error('Order contains no valid items');
  }

  res.json(formattedOrder);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public (no verifyToken)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('items.product', 'productName price images rating numReviews')
    .populate('user', 'firstName lastName email phoneNumber')
    .lean()
    .exec();

  const formattedOrders = orders
    .map((order) => {
      const validItems = order.items
        .filter((item) => item.product && item.product._id)
        .map((item) => ({
          product: {
            _id: item.product._id,
            productName: item.product.productName,
            price: item.product.price,
            images: item.product.images,
            rating: Number(item.product.rating) || 0,
            numReviews: Number(item.product.numReviews) || 0,
          },
          quantity: item.quantity,
          price: item.price,
        }));
      return validItems.length > 0 ? { 
        ...order, 
        items: validItems,
        user: {
          _id: order.user._id,
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          email: order.user.email,
          phoneNumber: order.user.phoneNumber || '',
        }
      } : null;
    })
    .filter((order) => order !== null);

  res.json(formattedOrders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Public (no verifyToken)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // Match the frontend's 'status' key
  if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  // Update paymentStatus for COD orders when delivered
  if (order.paymentMethod === 'cod' && status === 'Delivered') {
    order.paymentStatus = 'Completed';
  }
  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate('items.product', 'productName price images rating numReviews')
    .populate('user', 'firstName lastName email phoneNumber')
    .lean()
    .exec();

  const formattedOrder = {
    _id: populatedOrder._id,
    user: {
      _id: populatedOrder.user._id,
      firstName: populatedOrder.user.firstName,
      lastName: populatedOrder.user.lastName,
      email: populatedOrder.user.email,
      phoneNumber: populatedOrder.user.phoneNumber || '',
    },
    items: populatedOrder.items
      .filter((item) => item.product && item.product._id)
      .map((item) => ({
        product: {
          _id: item.product._id,
          productName: item.product.productName,
          price: item.product.price,
          images: item.product.images,
          rating: Number(item.product.rating) || 0,
          numReviews: Number(item.product.numReviews) || 0,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    totalAmount: populatedOrder.totalAmount,
    shippingAddress: populatedOrder.shippingAddress,
    paymentMethod: populatedOrder.paymentMethod,
    paymentStatus: populatedOrder.paymentStatus,
    orderStatus: populatedOrder.orderStatus,
    createdAt: populatedOrder.createdAt,
    updatedAt: populatedOrder.updatedAt,
  };

  if (formattedOrder.items.length === 0) {
    res.status(404);
    throw new Error('Order contains no valid items');
  }

  res.json(formattedOrder); // Ensure full order is returned
});

// @desc    Cancel order and delete it
// @route   PUT /api/orders/:id/cancel
// @access  Private (with verifyToken)
const cancelOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You are not authorized to cancel this order');
  }

  if (order.orderStatus !== 'Pending') {
    res.status(400);
    throw new Error('Only pending orders can be cancelled');
  }

  // Start MongoDB transaction
  const session = await Order.startSession();
  session.startTransaction();

  try {
    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(req.params.id, { session });

    await session.commitTransaction();

    res.json({ message: 'Order cancelled and deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    throw new Error(error.message || 'Failed to cancel order');
  } finally {
    session.endSession();
  }
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getMyOrdersCount,
  cancelOrder,
};