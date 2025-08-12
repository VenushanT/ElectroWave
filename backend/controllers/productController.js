const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
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
    const uploadPath = path.join(__dirname, "../uploads", filename);
    fs.writeFileSync(uploadPath, file.buffer);
    return filename;
  });

  const product = new Product({
    productName,
    description,
    price,
    category,
    brand,
    stock,
    images: imagePaths,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { productName, description, price, category, brand, stock } = req.body;
  const files = req.files;
  const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.productName = productName || product.productName;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.stock = stock || product.stock;

  // Handle new images
  if (files && files.length > 0) {
    if (files.length > 5) {
      res.status(400);
      throw new Error("Maximum 5 images allowed");
    }
    const newImagePaths = files.map((file) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const extension = path.extname(file.originalname);
      const filename = `${uniqueSuffix}${extension}`;
      const uploadPath = path.join(__dirname, "../uploads", filename);
      fs.writeFileSync(uploadPath, file.buffer);
      return filename;
    });
    product.images = [...product.images, ...newImagePaths];
  }

  // Handle removed images
  if (removedImages.length > 0) {
    product.images = product.images.filter((image) => !removedImages.includes(image));
    removedImages.forEach((image) => {
      const imagePath = path.join(__dirname, "../uploads", image);
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
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Delete associated images from filesystem with error handling
  product.images.forEach((image) => {
    const imagePath = path.join(__dirname, "../uploads", image);
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

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };