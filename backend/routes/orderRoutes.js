const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getMyOrdersCount, cancelOrder } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createOrder);
router.get('/myorders', verifyToken, getMyOrders);
router.get('/count', verifyToken, getMyOrdersCount);
router.get('/:id', verifyToken, getOrderById);
router.get('/', getAllOrders);
router.put('/:id', updateOrderStatus); // No verifyToken
router.put('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;