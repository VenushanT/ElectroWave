const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
const createProduct = asyncHandler(async (req, res) => {
  const { productName, description, price, category, brand, stock } = req.body;
  const files = req.files;

  if (!files || files.length < 1) {
    res.status(400);
    throw new Error("Please upload at least 1 image");
  }
  if (files.length > 5) {
    res.status(400);
    throw new Error("Maximum 5 images allowed");
  }

  const imagePaths = files.map((file) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    const uploadPath = path.join(__dirname, "../Uploads", filename);
    fs.writeFileSync(uploadPath, file.buffer);
    return filename;
  });

  const product = new Product({
    productName,
    description,
    price: parseFloat(price),
    category,
    brand,
    stock: parseInt(stock),
    images: imagePaths,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().select(
    "productName description price category brand stock images rating numReviews createdAt"
  );
  res.json(products);
});

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(req.params.id)
    .populate("reviews.user", "firstName lastName")
    .lean()
    .exec();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Ensure reviews are properly formatted
  product.reviews = product.reviews.map((review) => ({
    _id: review._id,
    user: {
      _id: review.user?._id || null,
      firstName: review.user?.firstName || "Anonymous",
      lastName: review.user?.lastName || "",
    },
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  res.json(product);
});

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(req.params.id)
    .populate("reviews.user", "firstName lastName")
    .lean()
    .exec();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const validReviews = product.reviews
    .filter(
      (review) =>
        review.user &&
        typeof review.user === "object" &&
        (review.user.firstName || review.user.lastName) &&
        review.rating &&
        review.comment &&
        review.createdAt
    )
    .map((review) => ({
      _id: review._id,
      user: {
        _id: review.user?._id || null,
        firstName: review.user?.firstName || "Anonymous",
        lastName: review.user?.lastName || "",
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }));

  res.json(validReviews);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { productName, description, price, category, brand, stock } = req.body;
  const files = req.files;
  const removedImages = req.body.removedImages
    ? JSON.parse(req.body.removedImages)
    : [];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.productName = productName || product.productName;
  product.description = description || product.description;
  product.price = price ? parseFloat(price) : product.price;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.stock = stock ? parseInt(stock) : product.stock;

  if (files && files.length > 0) {
    if (files.length > 5) {
      res.status(400);
      throw new Error("Maximum 5 images allowed");
    }
    const newImagePaths = files.map((file) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const extension = path.extname(file.originalname);
      const filename = `${uniqueSuffix}${extension}`;
      const uploadPath = path.join(__dirname, "../Uploads", filename);
      fs.writeFileSync(uploadPath, file.buffer);
      return filename;
    });
    product.images = [...product.images, ...newImagePaths];
  }

  if (removedImages.length > 0) {
    product.images = product.images.filter(
      (image) => !removedImages.includes(image)
    );
    removedImages.forEach((image) => {
      const imagePath = path.join(__dirname, "../Uploads", image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error(`Failed to delete image ${imagePath}: ${err.message}`);
        }
      }
    });
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const ordersWithProduct = await Order.find({ "items.product": id });
  if (ordersWithProduct.length > 0) {
    res.status(400);
    throw new Error(
      "Cannot delete product because it is referenced in existing orders"
    );
  }

  product.images.forEach((image) => {
    const imagePath = path.join(__dirname, "../Uploads", image);
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error(`Failed to delete image ${imagePath}: ${err.message}`);
      }
    }
  });

  await Product.findByIdAndDelete(id);
  res.json({ message: "Product deleted successfully" });
});

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment, userId } = req.body;
  const productId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }
  if (!comment || comment.trim().length === 0) {
    res.status(400);
    throw new Error("Comment is required");
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Valid User ID is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const review = {
    user: userId,
    rating: Number(rating),
    comment,
    createdAt: Date.now(),
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => acc + item.rating, 0) /
    product.numReviews;

  await product.save();
  res.status(201).json({ message: "Review added successfully", review });
});

// @desc    Get top selling products
// @route   GET /api/products/top-selling
// @access  Public
const getTopSellingProducts = asyncHandler(async (req, res) => {
  const orders = await Order.find({ orderStatus: "Delivered" })
    .populate("items.product", "productName price")
    .lean()
    .exec();

  const salesByProduct = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.product && item.product._id) {
        const pid = item.product._id.toString();
        if (!salesByProduct[pid]) {
          salesByProduct[pid] = {
            _id: pid,
            name: item.product.productName || "Unknown",
            quantity: 0,
            revenue: 0,
          };
        }
        salesByProduct[pid].quantity += item.quantity;
        salesByProduct[pid].revenue += item.price * item.quantity;
      }
    });
  });

  const topSelling = Object.values(salesByProduct)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((product) => ({
      _id: product._id,
      productName: product.name,
      quantitySold: product.quantity,
      revenue: parseFloat(product.revenue.toFixed(2)),
    }));

  res.json(topSelling);
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductReviews,
  updateProduct,
  deleteProduct,
  addReview,
  getTopSellingProducts,
};