const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product")
    .lean()
    .exec();
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Ensure product data is properly formatted
  cart.items = cart.items
    .filter(
      (item) =>
        item.product &&
        item.product._id &&
        item.quantity > 0 &&
        item.product.price != null
    )
    .map((item) => ({
      product: {
        _id: item.product._id,
        productName: item.product.productName,
        price: item.product.price,
        stock: item.product.stock,
        images: item.product.images,
        rating: item.product.rating,
        numReviews: item.product.numReviews,
      },
      quantity: item.quantity,
    }));

  console.log("Cart items returned:", cart.items); // Debug log
  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const product = await Product.findById(productId).lean().exec();
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Insufficient stock. Only ${product.stock} items available.`);
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex > -1) {
    const newQuantity = cart.items[itemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      res.status(400);
      throw new Error(`Cannot add ${newQuantity} items. Only ${product.stock} available.`);
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  console.log("Cart before save:", cart.items); // Debug log
  await cart.save();
  console.log("Cart after save:", cart.items); // Debug log
  const populatedCart = await Cart.findById(cart._id)
    .populate("items.product")
    .lean()
    .exec();

  populatedCart.items = populatedCart.items.map((item) => ({
    product: {
      _id: item.product._id,
      productName: item.product.productName,
      price: item.product.price,
      stock: item.product.stock,
      images: item.product.images,
      rating: item.product.rating,
      numReviews: item.product.numReviews,
    },
    quantity: item.quantity,
  }));

  res.status(201).json(populatedCart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  const product = await Product.findById(productId).lean().exec();
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Cannot set quantity to ${quantity}. Only ${product.stock} available.`);
  }

  if (quantity < 1) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  console.log("Cart before save:", cart.items); // Debug log
  await cart.save();
  console.log("Cart after save:", cart.items); // Debug log
  const populatedCart = await Cart.findById(cart._id)
    .populate("items.product")
    .lean()
    .exec();

  populatedCart.items = populatedCart.items.map((item) => ({
    product: {
      _id: item.product._id,
      productName: item.product.productName,
      price: item.product.price,
      stock: item.product.stock,
      images: item.product.images,
      rating: item.product.rating,
      numReviews: item.product.numReviews,
    },
    quantity: item.quantity,
  }));

  res.json(populatedCart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate("items.product")
    .lean()
    .exec();

  populatedCart.items = populatedCart.items.map((item) => ({
    product: {
      _id: item.product._id,
      productName: item.product.productName,
      price: item.product.price,
      stock: item.product.stock,
      images: item.product.images,
      rating: item.product.rating,
      numReviews: item.product.numReviews,
    },
    quantity: item.quantity,
  }));

  res.json(populatedCart);
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
