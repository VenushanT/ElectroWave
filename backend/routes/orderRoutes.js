// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus, 
  getMyOrdersCount, 
  cancelOrder,
  getSalesAnalytics // Updated analytics endpoint with proper revenue recognition
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

// Create order (requires authentication)
router.post('/', verifyToken, createOrder);

// Get current user's orders (requires authentication)
router.get('/myorders', verifyToken, getMyOrders);

// Get current user's order count (requires authentication)
router.get('/count', verifyToken, getMyOrdersCount);

// IMPORTANT: Get sales analytics with proper revenue recognition (public for dashboard)
// This endpoint now properly handles:
// - Card/PayPal/Apple: Revenue counted immediately when order is placed
// - COD: Revenue counted only when order status is 'Delivered'
router.get('/analytics/sales', getSalesAnalytics);

// Get specific order by ID (requires authentication)
router.get('/:id', verifyToken, getOrderById);

// Get all orders (public for admin dashboard)
router.get('/', getAllOrders);

// Update order status (public for admin operations)
// CRITICAL: This route updates COD payment status to 'Completed' when status changes to 'Delivered'
router.put('/:id', updateOrderStatus);

// Cancel and delete order (requires authentication - user can only cancel their own orders)
router.put('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;