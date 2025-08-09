const express = require("express");
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/productController");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.array("images", 5), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById); // New route to get product by ID
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;