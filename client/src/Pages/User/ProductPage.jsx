import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearch } from "../../contexts/SearchContext";
import { 
  Heart, 
  Search, 
  ShoppingCart, 
  Star, 
  Eye,
  X
} from "lucide-react";
import axios from "axios";
import Footer from "../../components/User/ProductFooter";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts };
};

function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post("http://localhost:5000/api/cart", { productId: product._id, quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/cart');
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.images && product.images.length > 0 ? `http://localhost:5000/uploads/${product.images[0]}` : "/placeholder.svg"}
          alt={product.productName}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleViewDetails}
          onError={(e) => { e.target.src = "/placeholder.svg"; }}
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-slate-900">{product.productName}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-600 font-medium">{product.rating || 0} ({product.reviews || 0})</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-slate-900">${product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-lg text-slate-500 line-through">${product.originalPrice}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </button>
          <button
            onClick={handleViewDetails}
            className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-lg hover:shadow-xl"
            title="View Details"
          >
            <Eye className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { products, loading, error, fetchProducts } = useProducts();
  const { searchQuery, isSearching, clearSearch, activeCategory: contextActiveCategory, setCategory, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const [localActiveCategory, setLocalActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const activeCategory = !isSearching ? (contextActiveCategory !== 'all' ? contextActiveCategory : localActiveCategory) : null;

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  // Filter products by category or search
  const filteredProducts = sortedProducts.filter(product => {
    if (isSearching) {
      return product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             product.category.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return !activeCategory || activeCategory === "all" || product.category === activeCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-2xl font-bold text-slate-900">Loading Products...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <X className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900">Error</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full flex justify-center items-center py-8 bg-transparent">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white">
            <img src={process.env.PUBLIC_URL + '/zap-logo.png'} alt="ElectroWave Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <span className="text-2xl font-bold text-slate-900">ElectroWave</span>
        </Link>
      </div>

      <section className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1 flex items-center gap-4 mb-4 lg:mb-0">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setLocalActiveCategory('all');
                    setCategory('all');
                    if (e.target.value === '') clearSearch();
                    else if (typeof setSearchQuery === 'function') setSearchQuery(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <select
                value={activeCategory || 'all'}
                onChange={(e) => {
                  setLocalActiveCategory(e.target.value);
                  setCategory(e.target.value);
                  if (isSearching) clearSearch();
                }}
                className="w-48 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
              >
                <option value="all">All Categories</option>
                {[...new Set(products.map(p => p.category))].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-52 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        {isSearching ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-slate-600">
                  Found {filteredProducts.length} products
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Clear Search
              </button>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-600 mb-8">Try searching for something else or browse our categories</p>
                <button
                  onClick={clearSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse All Products
                </button>
              </div>
            )}
          </div>
        ) : activeCategory === 'all' ? (
          <div>
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">All Products</h2>
              <p className="text-xl text-slate-600">Explore our full collection</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
              </h2>
              <p className="text-xl text-slate-600">
                Browse our collection of premium {activeCategory}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ProductPage;