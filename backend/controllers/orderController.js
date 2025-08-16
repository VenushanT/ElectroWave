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

  // CORRECTED PAYMENT LOGIC:
  // - Card/PayPal/Apple: Payment processed immediately (Completed) and earnings counted immediately
  // - COD: Payment pending until delivery, earnings counted only on delivery
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
      orderStatus: 'Pending', // Always starts as Pending regardless of payment method
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

  // Store previous status for logging/tracking
  const previousStatus = order.orderStatus;
  
  // Update order status
  order.orderStatus = status;
  
  // CRITICAL BUSINESS LOGIC: Update payment status for COD orders when delivered
  // This is when COD orders should be counted in earnings
  if (order.paymentMethod === 'cod' && status === 'Delivered') {
    order.paymentStatus = 'Completed';
  }
  
  // If order is cancelled, we might want to handle refunds for card payments
  if (status === 'Cancelled' && order.paymentMethod !== 'cod') {
    // For card/paypal/apple payments that were already processed,
    // you might want to initiate a refund process here
    // order.paymentStatus = 'Refunded'; // Optional: track refund status
  }
  
  await order.save();

  // Log the status change for audit trail (optional)
  console.log(`Order ${order._id} status changed from ${previousStatus} to ${status}`);

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

    // For card payments, you might want to initiate refund process here
    if (order.paymentMethod !== 'cod') {
      console.log(`Initiating refund for order ${order._id} - Payment Method: ${order.paymentMethod}`);
      // Add refund logic here if needed
    }

    // Delete the order
    await Order.findByIdAndDelete(req.params.id, { session });

    await session.commitTransaction();

    res.json({ 
      message: 'Order cancelled and deleted successfully',
      refundRequired: order.paymentMethod !== 'cod' // Indicate if refund is needed
    });
  } catch (error) {
    await session.abortTransaction();
    throw new Error(error.message || 'Failed to cancel order');
  } finally {
    session.endSession();
  }
});

// CORRECTED: Helper function to determine if order should count towards earnings
const shouldCountInEarnings = (order) => {
  // Card/PayPal/Apple payments: Count immediately when order is placed (even if Pending status)
  if (['card', 'paypal', 'apple'].includes(order.paymentMethod)) {
    return order.paymentStatus === 'Completed'; // This is set immediately for these payment methods
  }
  
  // COD payments: Only count when delivered (payment status changes to Completed on delivery)
  if (order.paymentMethod === 'cod') {
    return order.orderStatus === 'Delivered' && order.paymentStatus === 'Completed';
  }
  
  return false;
};

// @desc    Get sales analytics (CORRECTED: Proper earnings calculation by payment method)
// @route   GET /api/orders/analytics/sales
// @access  Public
// @desc    Get sales analytics (CORRECTED: Proper earnings calculation by payment method)
// @route   GET /api/orders/analytics/sales
// @access  Public
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Get all orders
  const allOrders = await Order.find().lean();

  // Filter orders that should count in earnings based on payment method
  const earningsEligibleOrders = allOrders.filter(shouldCountInEarnings);

  const dailySales = earningsEligibleOrders
    .filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === today)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const yesterdaySales = earningsEligibleOrders
    .filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === yesterday)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const monthlySales = earningsEligibleOrders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalRevenue = earningsEligibleOrders
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const salesGrowth = yesterdaySales > 0 ? ((dailySales - yesterdaySales) / yesterdaySales * 100) : 0;

  // Additional metrics for transparency
  const todaysCardOrders = allOrders.filter(o => 
    o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === today && 
    ['card', 'paypal', 'apple'].includes(o.paymentMethod)
  ).length;

  const todaysCODDelivered = allOrders.filter(o => 
    o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === today && 
    o.paymentMethod === 'cod' && o.orderStatus === 'Delivered'
  ).length;

  // Breakdown by payment method for better insights
  const cardOrdersEarnings = earningsEligibleOrders
    .filter(o => ['card', 'paypal', 'apple'].includes(o.paymentMethod))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const codOrdersEarnings = earningsEligibleOrders
    .filter(o => o.paymentMethod === 'cod')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  res.json({
    dailySales,
    yesterdaySales,
    monthlySales,
    totalRevenue,
    salesGrowth,
    earningsEligibleOrdersCount: earningsEligibleOrders.length,
    todaysCardOrders,
    todaysCODDelivered,
    totalOrders: allOrders.length,
    cardOrdersEarnings,
    codOrdersEarnings,
    // Helper data for frontend
    paymentMethodBreakdown: {
      cardPayments: {
        count: allOrders.filter(o => ['card', 'paypal', 'apple'].includes(o.paymentMethod)).length,
        earnings: cardOrdersEarnings
      },
      codPayments: {
        count: allOrders.filter(o => o.paymentMethod === 'cod').length,
        earnings: codOrdersEarnings,
        deliveredCount: allOrders.filter(o => o.paymentMethod === 'cod' && o.orderStatus === 'Delivered').length
      }
    }
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getMyOrdersCount,
  cancelOrder,
  getSalesAnalytics,
};