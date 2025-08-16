import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  ShoppingCart,
  Star,
  Eye,
  X,
  Grid,
  List,
  ChevronDown,
  Sparkles,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../../components/User/ProductFooter";
import { useDispatch, useSelector } from "react-redux";
import { setCart, setError as setCartError } from "../../store/cartSlice";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:5000/api/products");
      const products = Array.isArray(response.data) ? response.data : [];
      setProducts(
        products.map((product) => ({
          ...product,
          rating: Number(product.rating) || 0,
          numReviews: Number(product.numReviews) || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Failed to load products. Please try again later.");
      toast.error(error.response?.data?.message || "Failed to load products.", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts };
};

function StarRatingWithLink({ rating = 0, numReviews = 0, productId, size = 4 }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to={`/product/${productId}/reviews`}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-${size} w-${size} transition-colors ${
                i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 font-medium hover:text-indigo-600 transition-colors">
          {rating.toFixed(1)} ({numReviews} {numReviews === 1 ? "review" : "reviews"})
        </span>
      </Link>
    </div>
  );
}

function ProductCard({ product, viewMode = "grid" }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth || {});
  const cartItems = useSelector((state) => state.cart.cart?.items) || [];

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, Math.min(product.stock || 999, quantity + delta));
    setQuantity(newQuantity);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);

    try {
      if (!token || !isAuthenticated) {
        toast.error("Please log in to add to cart.", { autoClose: 3000 });
        setTimeout(() => navigate("/login"), 3500);
        return;
      }

      // Check if product is already in cart
      const existingItem = cartItems.find((item) => item.product._id === product._id);

      if (existingItem) {
        // Product already in cart: Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.error(`Cannot add more than ${product.stock} items to cart.`, { autoClose: 3000 });
          return;
        }

        // API call to update quantity
        const response = await axios.put(
          `http://localhost:5000/api/cart/${product._id}`,
          { quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        dispatch(setCart(response.data));
        toast.info("Cart updated with additional quantity!", { autoClose: 2000 });
      } else {
        // Product not in cart: Add new item
        const response = await axios.post(
          "http://localhost:5000/api/cart",
          { productId: product._id, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        dispatch(setCart(response.data));
        toast.success("Added to cart!", { autoClose: 2000 });
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      const errorMessage = err.response?.data?.message || "Failed to add to cart. Please try again.";
      dispatch(setCartError(errorMessage));
      toast.error(errorMessage, { autoClose: 3000 });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product._id}`);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.info(isWishlisted ? "Removed from wishlist" : "Added to wishlist", { autoClose: 2000 });
  };

  const handleCardClick = () => {
    // Prevent card click from navigating
  };

  if (viewMode === "list") {
    return (
      <div
        className="group bg-white/90 backdrop-blur-xl border border-gray-100/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-700 hover:border-gray-200/80"
        onClick={handleCardClick}
      >
        <div className="flex">
          <div className="relative w-72 h-56 flex-shrink-0 overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 transition-opacity duration-500 ${
                imageLoaded ? "opacity-0" : "opacity-100"
              }`}
            />
            <img
              src={
                product.images && product.images.length > 0
                  ? `http://localhost:5000/uploads/${product.images[0]}`
                  : "/placeholder.svg"
              }
              alt={product.productName || "Product"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                <Sparkles className="h-3 w-3 inline mr-1" />
                {product.badge}
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                -{discount}%
              </div>
            )}
            <button
              onClick={handleWishlistToggle}
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110"
            >
              <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-2xl mb-4 text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {product.productName || "Product Name"}
              </h3>
              <div className="mb-4">
                <StarRatingWithLink
                  rating={Number(product.rating) || 0}
                  numReviews={Number(product.numReviews) || 0}
                  productId={product._id}
                  size={4}
                />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${product.price || 0}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-6">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(-1);
                  }}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(1);
                  }}
                  disabled={quantity >= (product.stock || 999)}
                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-xl"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {addingToCart ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleViewDetails}
                className="px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group/btn"
                title="View Details"
              >
                <Eye className="h-5 w-5 text-gray-600 group-hover/btn:text-indigo-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-white/90 backdrop-blur-xl border border-gray-100/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-700 transform hover:-translate-y-3 hover:border-gray-200/80"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 transition-opacity duration-500 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={
            product.images && product.images.length > 0
              ? `http://localhost:5000/uploads/${product.images[0]}`
              : "/placeholder.svg"
          }
          alt={product.productName || "Product"}
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {product.badge && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            <Sparkles className="h-3 w-3 inline mr-1" />
            {product.badge}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            -{discount}%
          </div>
        )}
        <button
          onClick={handleWishlistToggle}
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110"
        >
          <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl mb-4 text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {product.productName || "Product Name"}
        </h3>
        <div className="mb-4">
          <StarRatingWithLink
            rating={Number(product.rating) || 0}
            numReviews={Number(product.numReviews) || 0}
            productId={product._id}
            size={4}
          />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ${product.price || 0}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-lg text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">Qty:</span>
          <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(-1);
              }}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(1);
              }}
              disabled={quantity >= (product.stock || 999)}
              className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-xl"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {addingToCart ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleViewDetails}
            className="px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group/btn"
            title="View Details"
          >
            <Eye className="h-5 w-5 text-gray-600 group-hover/btn:text-indigo-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { products, loading, error, fetchProducts } = useProducts();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const searchRef = useRef(null);

  const updateSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    if (query.length > 0) {
      const filteredSuggestions = [...new Set(products.map((p) => p.productName))]
        .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setIsSearching(true);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  const filteredProducts = sortedProducts.filter((product) => {
    if (isSearching) {
      return (
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return (
      !activeCategory ||
      activeCategory === "all" ||
      product.category === activeCategory
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-indigo-200 rounded-full animate-spin"></div>
            <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Loading Products</h3>
          <p className="text-gray-600 text-lg">Curating the perfect collection for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      <ToastContainer position="top-right" autoClose={3000} />
      <section className="relative bg-white/70 backdrop-blur-xl border-b border-gray-100/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5"></div>
        <div className="container mx-auto px-6 py-10 relative">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex-1 max-w-lg" ref={searchRef}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      setIsSearching(true);
                      navigate("/products");
                    }
                  }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
                    <input
                      type="text"
                      placeholder="Search for premium products..."
                      value={searchQuery}
                      onChange={(e) => updateSearch(e.target.value)}
                      onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                      className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-2 z-50 max-h-64 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                          onClick={() => {
                            selectSuggestion(suggestion);
                            navigate("/products");
                          }}
                        >
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              </div>
              <div className="relative">
                <select
                  value={activeCategory}
                  onChange={(e) => {
                    setActiveCategory(e.target.value);
                    if (isSearching) clearSearch();
                  }}
                  className="appearance-none w-52 px-6 py-4 pr-12 border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 bg-white/80 backdrop-blur-sm font-semibold text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="all">All Categories</option>
                  {[...new Set(products.map((p) => p.category))].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/60 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-64 px-6 py-4 pr-12 border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 bg-white/80 backdrop-blur-sm font-semibold text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="featured">✨ Featured Products</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💎 Price: High to Low</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="newest">🆕 Latest Arrivals</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <main className="container mx-auto px-6 py-16">
        {isSearching ? (
          <div>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-4">
                  Search Results for <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">"{searchQuery}"</span>
                </h2>
                <p className="text-gray-600 text-xl">
                  Discovered {filteredProducts.length} exceptional products
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="flex items-center gap-3 px-8 py-4 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md"
              >
                <X className="h-5 w-5" />
                Clear Search
              </button>
            </div>
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    : "flex flex-col gap-8"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Search className="h-16 w-16 text-indigo-400" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">No products found</h3>
                <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-xl leading-relaxed">
                  We couldn't find any products matching your search criteria. Try adjusting your filters or explore our featured collections.
                </p>
                <button
                  onClick={clearSearch}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                >
                  Browse All Products
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-16 text-center">
              <h2 className="text-6xl font-bold text-gray-900 mb-6">
                {activeCategory === "all" ? (
                  <>
                    Our <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Premium</span> Collection
                  </>
                ) : (
                  <>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                    </span> Collection
                  </>
                )}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {activeCategory === "all"
                  ? "Discover our carefully curated selection of premium products, each chosen for exceptional quality and innovation"
                  : `Explore our exclusive range of premium ${activeCategory} products, crafted with precision and designed for excellence`}
              </p>
            </div>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "flex flex-col gap-8"
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} viewMode={viewMode} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductPage;
