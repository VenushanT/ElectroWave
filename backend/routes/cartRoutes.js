// routes/cartRoutes.js (New routes for Cart)
const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getCart);
router.post('/', verifyToken, addToCart);
router.put('/:productId', verifyToken, updateCartItem);
router.delete('/:productId', verifyToken, removeFromCart);

module.exports = router;