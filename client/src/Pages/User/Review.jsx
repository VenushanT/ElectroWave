import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Star, ShoppingCart, Heart, Plus, Minus, Loader2, AlertCircle, Package } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

const StarRating = ({ rating = 0, onRatingChange = null, size = 24 }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={size}
          className={`cursor-${onRatingChange ? "pointer" : "default"} ${
            index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => onRatingChange && onRatingChange(index + 1)}
        />
      ))}
    </div>
  );
};

const ReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [userId, setUserId] = useState(null);
  const [formErrors, setFormErrors] = useState({ rating: false, comment: false });

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setReviewError("Please log in to submit a review.");
        toast.error("Please log in to submit a review.", { autoClose: 3000 });
        return;
      }
      try {
        const decoded = jwtDecode(token);
        if (decoded.id) {
          setUserId(decoded.id);
          return;
        }
      } catch (decodeErr) {
        console.warn("JWT decode failed, falling back to API:", decodeErr);
      }
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserId(response.data.id);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setReviewError("Please log in or verify your account to submit a review.");
      toast.error("Authentication failed. Please log in again.", { autoClose: 3000 });
      setTimeout(() => navigate("/login"), 3500);
    }
  };

  const fetchProduct = async () => {
    try {
      setError("");
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      const productData = response.data;
      setProduct({
        ...productData,
        rating: Number(productData.rating) || 0,
        numReviews: Number(productData.numReviews) || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load product details");
      toast.error(err.response?.data?.message || "Failed to load product details.", { autoClose: 3000 });
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}/reviews`);
      const data = Array.isArray(response.data) ? response.data : [];
      const validReviews = data
        .filter((review) => {
          const isValid =
            review &&
            typeof review === "object" &&
            review._id &&
            typeof review.rating === "number" &&
            review.rating >= 1 &&
            review.rating <= 5 &&
            review.comment &&
            typeof review.comment === "string" &&
            review.comment.trim().length > 0 &&
            review.createdAt &&
            review.user;
          if (!isValid) {
            console.warn("Invalid review filtered out:", review);
          }
          return isValid;
        })
        .map((review) => ({
          ...review,
          rating: Number(review.rating),
        }));
      setReviews(validReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.response?.data?.message || "Failed to load reviews");
      toast.error(err.response?.data?.message || "Failed to load reviews.", { autoClose: 3000 });
    }
  };

  useEffect(() => {
    if (!isValidObjectId(id)) {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }
    Promise.all([fetchUserProfile(), fetchProduct(), fetchReviews()]).finally(() => setLoading(false));
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity(Math.max(1, Math.min(product?.stock || 999, quantity + delta)));
  };

  const handleAddToCart = async () => {
    if (addingToCart || !product || product.stock <= 0) return;
    setAddingToCart(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to add to cart.", { autoClose: 3000 });
        setTimeout(() => navigate("/login"), 3500);
        return;
      }
      await axios.post(
        "http://localhost:5000/api/cart",
        { productId: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart!`, { autoClose: 2000 });
      navigate("/cart");
    } catch (err) {
      console.error("Error adding to cart:", err);
      const errorMessage = err.response?.data?.message || "Failed to add to cart";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    setIsWishlisted(!isWishlisted);
    toast.info(isWishlisted ? "Removed from wishlist" : "Added to wishlist", { autoClose: 2000 });
  };

  const handleReviewChange = (field, value) => {
    setNewReview((prev) => ({ ...prev, [field]: value }));
    setReviewError("");
    setFormErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      setFormErrors((prev) => ({ ...prev, rating: true }));
      toast.error("Please select a rating.", { autoClose: 3000 });
      return;
    }
    if (!newReview.comment.trim()) {
      setFormErrors((prev) => ({ ...prev, comment: true }));
      toast.error("Please enter a review comment.", { autoClose: 3000 });
      return;
    }
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) {
        toast.error("Please log in to submit a review.", { autoClose: 3000 });
        setTimeout(() => navigate("/login"), 3500);
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/products/${id}/reviews`,
        { ...newReview, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewReview({ rating: 0, comment: "" });
      toast.success("Review submitted successfully! Feel free to add another review.", { autoClose: 2000 });
      await fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
      const errorMessage = err.response?.data?.message || "Failed to submit review";
      setReviewError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } finally {
      setSubmittingReview(false);
    }
  };

  const getSubmitButtonTooltip = () => {
    if (!userId) return "Please log in to submit a review";
    if (newReview.rating === 0) return "Please select a star rating";
    if (!newReview.comment.trim()) return "Please enter a review comment";
    if (submittingReview) return "Submitting your review...";
    return "";
  };

  const getUserName = (review) => {
    if (!review || !review.user) {
      return "Anonymous User";
    }
    if (typeof review.user === "string" && isValidObjectId(review.user)) {
      return "Anonymous User";
    }
    if (typeof review.user === "string" && !isValidObjectId(review.user)) {
      return review.user;
    }
    if (typeof review.user === "object" && review.user !== null) {
      const firstName = review.user.firstName || "";
      const lastName = review.user.lastName || "";
      const username = review.user.username || "";
      const name = review.user.name || "";
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      if (username) {
        return username;
      }
      if (name) {
        return name;
      }
    }
    return "Anonymous User";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  const renderReviews = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return (
        <p className="text-gray-600 text-lg">No reviews yet. Be the first to share your experience!</p>
      );
    }

    return (
      <div className="space-y-6">
        {reviews.map((review, index) => {
          if (!review || typeof review !== "object" || !review.comment || typeof review.rating !== "number") {
            console.warn("Skipping invalid review at index:", index, review);
            return null;
          }

          const reviewId = review._id || `review-${index}`;
          const userName = getUserName(review);
          const formattedDate = formatDate(review.createdAt);
          const rating = Math.max(0, Math.min(5, Math.floor(review.rating)));

          return (
            <div key={reviewId} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-center gap-4 mb-2">
                <p className="font-semibold text-gray-900">{userName}</p>
                <StarRating rating={rating} size={20} />
              </div>
              <p className="text-gray-600 mb-2">{String(review.comment)}</p>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900">Loading...</h3>
          <p className="text-gray-600 mt-2">Fetching product and reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Error</h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              Promise.all([fetchUserProfile(), fetchProduct(), fetchReviews()]).finally(() => setLoading(false));
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Product Not Found</h3>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 py-16">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <img
                src={
                  product.images && product.images.length > 0
                    ? `http://localhost:5000/uploads/${product.images[0]}`
                    : "/placeholder.svg"
                }
                alt={product.productName || "Product"}
                className="w-full h-96 object-cover rounded-2xl"
                onError={(e) => (e.target.src = "/placeholder.svg")}
              />
            </div>
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.productName || "Product Name"}</h1>
              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={Math.floor(Number(product.rating) || 0)} />
                <span className="text-sm text-gray-600 font-medium">
                  ({Number(product.numReviews) || 0} reviews)
                </span>
              </div>
              <p className="text-gray-600 mb-6">{product.description || "No description available"}</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${product.price || 0}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-6">
                <Package className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product?.stock || 999)}
                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-xl"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {addingToCart ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          {renderReviews()}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Write a Review</h3>
            {reviewError && (
              <p className="text-red-600 mb-4">{reviewError}</p>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Rating</label>
                <StarRating
                  rating={newReview.rating}
                  onRatingChange={(rating) => handleReviewChange("rating", rating)}
                  size={30}
                />
                {formErrors.rating && (
                  <p className="text-red-600 text-sm mt-2">Please select a rating</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => handleReviewChange("comment", e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all duration-300 ${
                    formErrors.comment ? "border-red-500" : "border-gray-200"
                  }`}
                  rows={5}
                />
                {formErrors.comment && (
                  <p className="text-red-600 text-sm mt-2">Please enter a review comment</p>
                )}
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !userId || newReview.rating === 0 || !newReview.comment.trim()}
                title={getSubmitButtonTooltip()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;