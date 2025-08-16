import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Award,
  Package,
  Clock,
  AlertCircle,
  Sparkles,
  Eye,
  Plus,
  Minus,
  MessageSquare,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        const productData = response.data;
        setProduct({
          ...productData,
          rating: Number(productData.rating) || 0,
          numReviews: Number(productData.numReviews) || 0,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.response?.data?.message || "Failed to load product details. Please try again later.");
        toast.error(error.response?.data?.message || "Failed to load product details.", { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };

    if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
      fetchProduct();
    } else {
      setError("Invalid product ID");
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (addingToCart || !product || product.stock <= 0) return;

    try {
      setAddingToCart(true);
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
      const errorMessage = err.response?.data?.message || "Failed to add to cart.";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      setImageLoaded(false);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
      setImageLoaded(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.productName,
          text: `Check out this amazing product: ${product.productName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        toast.error("Failed to share product.", { autoClose: 3000 });
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!", { autoClose: 2000 });
      } catch (err) {
        console.error("Error copying to clipboard:", err);
        toast.error("Failed to copy link.", { autoClose: 3000 });
      }
    }
  };

  const StarRatingWithLink = ({ rating = 0, numReviews = 0, productId, size = 5 }) => {
    return (
      <div className="flex items-center gap-4">
        <Link
          to={`/product/${productId}/reviews`}
          className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-${size} w-${size} transition-colors group-hover:scale-110 ${
                  i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {rating.toFixed(1)}
          </span>
        </Link>
        <Link
          to={`/product/${productId}/reviews`}
          className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
        >
          ({numReviews} {numReviews === 1 ? "review" : "reviews"})
        </Link>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading Product...</h3>
          <p className="text-gray-600">Fetching product details for you</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-600 mb-8">{error || "The product you're looking for doesn't exist."}</p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors group"
          >
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 truncate">{product.productName || "Product"}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden border border-gray-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {product.images && product.images.length > 0 ? (
                  <>
                    <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 transition-opacity duration-300 ${
                          imageLoaded ? "opacity-0" : "opacity-100"
                        }`}
                      />
                      <img
                        src={`http://localhost:5000/uploads/${product.images[currentImageIndex]}`}
                        alt={product.productName || "Product"}
                        className="w-full h-[500px] object-contain p-4"
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                          setImageLoaded(true);
                        }}
                      />
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                          >
                            <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:-translate-x-0.5 transition-transform" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                          >
                            <ChevronRight className="h-6 w-6 text-gray-600 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </>
                      )}
                    </div>
                    {product.images.length > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        {product.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setImageLoaded(false);
                            }}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                              index === currentImageIndex
                                ? "border-blue-600 shadow-lg"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={`http://localhost:5000/uploads/${product.images[index]}`}
                              alt={`${product.productName || "Product"} ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg";
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 bg-white rounded-2xl p-12 shadow-xl">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <span className="text-xl font-medium">No Image Available</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                      {product.productName || "Product"}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {product.category && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {product.category}
                        </span>
                      )}
                      {product.brand && (
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                          {product.brand}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setIsWishlisted(!isWishlisted);
                        toast.info(isWishlisted ? "Removed from wishlist" : "Added to wishlist", { autoClose: 2000 });
                      }}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Heart className={`h-6 w-6 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Share2 className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <StarRatingWithLink
                    rating={Number(product.rating) || 0}
                    numReviews={Number(product.numReviews) || 0}
                    productId={product._id}
                    size={5}
                  />
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ${product.price || 0}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">${product.originalPrice}</span>
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full animate-pulse">
                        -{discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.description || "No description available for this product."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Stock</span>
                    </div>
                    <span className={`text-lg font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.stock > 0 ? `${product.stock} units` : "Out of stock"}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Brand</span>
                    </div>
                    <span className="text-lg font-bold text-green-700">{product.brand || "N/A"}</span>
                  </div>
                </div>
                {product.stock > 0 && (
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-lg font-semibold text-gray-900">Quantity:</span>
                    <div className="flex items-center bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="px-6 py-3 text-lg font-semibold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-3 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addingToCart}
                  className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 ${
                    product.stock <= 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : addingToCart
                      ? "bg-blue-400 text-white cursor-wait"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Adding to Cart...
                    </>
                  ) : product.stock <= 0 ? (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      Out of Stock
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add {quantity} to Cart
                    </>
                  )}
                </button>
                <Link
                  to={`/product/${product._id}/reviews`}
                  className="px-6 py-4 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <MessageSquare className="h-5 w-5" />
                  Reviews
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Free Shipping</div>
                    <div className="text-sm">On orders over $50</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Secure Payment</div>
                    <div className="text-sm">100% protected</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <RotateCcw className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Easy Returns</div>
                    <div className="text-sm">30 day guarantee</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Fast Delivery</div>
                    <div className="text-sm">2-3 business days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;