const express = require("express");
const router = express.Router();
const { createProduct, getAllProducts, getProductById, getProductReviews, updateProduct, deleteProduct, addReview } = require("../controllers/productController");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.array("images", 5), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/reviews", addReview);

module.exports = router;