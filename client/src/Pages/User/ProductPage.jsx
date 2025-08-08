import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearch } from "../../contexts/SearchContext";
import { 
  Heart, 
  Search, 
  ShoppingCart, 
  Star, 
  User, 
  Menu, 
  Filter,
  Zap,
  X
} from "lucide-react";

// Sample product data
const products = {
  phones: [
    {
      id: 1,
      name: "iPhone 15 Pro",
      price: 999,
      originalPrice: 1099,
      rating: 4.8,
      reviews: 1234,
      image: "/placeholder.svg?height=300&width=300&text=iPhone+15+Pro",
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      price: 899,
      originalPrice: 999,
      rating: 4.7,
      reviews: 856,
      image: "/placeholder.svg?height=300&width=300&text=Galaxy+S24",
      badge: "New"
    },
    {
      id: 3,
      name: "Google Pixel 8",
      price: 699,
      originalPrice: 799,
      rating: 4.6,
      reviews: 642,
      image: "/placeholder.svg?height=300&width=300&text=Pixel+8",
      badge: "Sale"
    },
    {
      id: 4,
      name: "OnePlus 12",
      price: 799,
      originalPrice: 899,
      rating: 4.5,
      reviews: 423,
      image: "/placeholder.svg?height=300&width=300&text=OnePlus+12",
      badge: ""
    }
  ],
  laptops: [
    {
      id: 5,
      name: "MacBook Pro 16\"",
      price: 2499,
      originalPrice: 2699,
      rating: 4.9,
      reviews: 2156,
      image: "/placeholder.svg?height=300&width=300&text=MacBook+Pro",
      badge: "Premium"
    },
    {
      id: 6,
      name: "Dell XPS 13",
      price: 1299,
      originalPrice: 1499,
      rating: 4.7,
      reviews: 1834,
      image: "/placeholder.svg?height=300&width=300&text=Dell+XPS+13",
      badge: "Popular"
    },
    {
      id: 7,
      name: "HP Spectre x360",
      price: 1199,
      originalPrice: 1399,
      rating: 4.6,
      reviews: 967,
      image: "/placeholder.svg?height=300&width=300&text=HP+Spectre",
      badge: "2-in-1"
    },
    {
      id: 8,
      name: "Lenovo ThinkPad X1",
      price: 1599,
      originalPrice: 1799,
      rating: 4.8,
      reviews: 1245,
      image: "/placeholder.svg?height=300&width=300&text=ThinkPad+X1",
      badge: "Business"
    }
  ],
  watches: [
    {
      id: 9,
      name: "Apple Watch Series 9",
      price: 399,
      originalPrice: 449,
      rating: 4.8,
      reviews: 3421,
      image: "/placeholder.svg?height=300&width=300&text=Apple+Watch+9",
      badge: "Fitness"
    },
    {
      id: 10,
      name: "Samsung Galaxy Watch 6",
      price: 329,
      originalPrice: 379,
      rating: 4.6,
      reviews: 1876,
      image: "/placeholder.svg?height=300&width=300&text=Galaxy+Watch+6",
      badge: "Android"
    },
    {
      id: 11,
      name: "Garmin Forerunner 965",
      price: 599,
      originalPrice: 649,
      rating: 4.7,
      reviews: 892,
      image: "/placeholder.svg?height=300&width=300&text=Garmin+965",
      badge: "Sports"
    },
    {
      id: 12,
      name: "Fitbit Sense 2",
      price: 249,
      originalPrice: 299,
      rating: 4.4,
      reviews: 1534,
      image: "/placeholder.svg?height=300&width=300&text=Fitbit+Sense+2",
      badge: "Health"
    }
  ],
  headphones: [
    {
      id: 13,
      name: "AirPods Pro 2",
      price: 249,
      originalPrice: 279,
      rating: 4.8,
      reviews: 4567,
      image: "/placeholder.svg?height=300&width=300&text=AirPods+Pro+2",
      badge: "Wireless"
    },
    {
      id: 14,
      name: "Sony WH-1000XM5",
      price: 349,
      originalPrice: 399,
      rating: 4.9,
      reviews: 2834,
      image: "/placeholder.svg?height=300&width=300&text=Sony+WH1000XM5",
      badge: "Noise Cancelling"
    },
    {
      id: 15,
      name: "Bose QuietComfort",
      price: 329,
      originalPrice: 379,
      rating: 4.7,
      reviews: 1923,
      image: "/placeholder.svg?height=300&width=300&text=Bose+QC",
      badge: "Comfort"
    },
    {
      id: 16,
      name: "Sennheiser HD 660S2",
      price: 599,
      originalPrice: 649,
      rating: 4.8,
      reviews: 756,
      image: "/placeholder.svg?height=300&width=300&text=Sennheiser+HD660S2",
      badge: "Audiophile"
    }
  ],
  cameras: [
    {
      id: 17,
      name: "Canon EOS R5",
      price: 3899,
      originalPrice: 4199,
      rating: 4.9,
      reviews: 892,
      image: "/placeholder.svg?height=300&width=300&text=Canon+EOS+R5",
      badge: "Professional"
    },
    {
      id: 18,
      name: "Sony A7 IV",
      price: 2498,
      originalPrice: 2699,
      rating: 4.8,
      reviews: 654,
      image: "/placeholder.svg?height=300&width=300&text=Sony+A7+IV",
      badge: "Mirrorless"
    }
  ],
  gaming: [
    {
      id: 19,
      name: "PlayStation 5",
      price: 499,
      originalPrice: 559,
      rating: 4.9,
      reviews: 2134,
      image: "/placeholder.svg?height=300&width=300&text=PlayStation+5",
      badge: "Console"
    },
    {
      id: 20,
      name: "Xbox Series X",
      price: 499,
      originalPrice: 549,
      rating: 4.8,
      reviews: 1876,
      image: "/placeholder.svg?height=300&width=300&text=Xbox+Series+X",
      badge: "Gaming"
    }
  ],
  tablets: [
    {
      id: 21,
      name: "iPad Pro 12.9\"",
      price: 1099,
      originalPrice: 1199,
      rating: 4.9,
      reviews: 987,
      image: "/placeholder.svg?height=300&width=300&text=iPad+Pro",
      badge: "Pro"
    },
    {
      id: 22,
      name: "Samsung Galaxy Tab S9",
      price: 799,
      originalPrice: 899,
      rating: 4.7,
      reviews: 543,
      image: "/placeholder.svg?height=300&width=300&text=Galaxy+Tab+S9",
      badge: "Android"
    }
  ],
  speakers: [
    {
      id: 23,
      name: "HomePod mini",
      price: 99,
      originalPrice: 119,
      rating: 4.6,
      reviews: 1876,
      image: "/placeholder.svg?height=300&width=300&text=HomePod+mini",
      badge: "Smart"
    },
    {
      id: 24,
      name: "Sonos One",
      price: 199,
      originalPrice: 229,
      rating: 4.8,
      reviews: 1234,
      image: "/placeholder.svg?height=300&width=300&text=Sonos+One",
      badge: "WiFi"
    }
  ]
};

function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    // You can add logic here to actually add the product to cart state/context
    // For now, we'll just navigate to the cart page
    navigate('/cart');
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
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
        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-slate-900">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-600 font-medium">{product.rating} ({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-slate-900">${product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-lg text-slate-500 line-through">${product.originalPrice}</span>
          )}
        </div>
        <button 
          onClick={handleAddToCart}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductPage() {
  const [sortBy, setSortBy] = useState("featured");
  const { searchQuery, isSearching, clearSearch, activeCategory: contextActiveCategory, setCategory, setSearchQuery } = useSearch();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [localActiveCategory, setLocalActiveCategory] = useState("all");

  // Use context category if available, otherwise use local state
  const activeCategory = !isSearching ? (contextActiveCategory !== 'all' ? contextActiveCategory : localActiveCategory) : null;

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }

    const filtered = {};
    Object.keys(products).forEach(category => {
      const categoryProducts = products[category].filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (categoryProducts.length > 0) {
        filtered[category] = categoryProducts;
      }
    });

    setFilteredProducts(filtered);
  }, [searchQuery]);

  // Get all products for search results
  const getAllSearchResults = () => {
    const allProducts = [];
    Object.keys(filteredProducts).forEach(category => {
      filteredProducts[category].forEach(product => {
        allProducts.push({ ...product, category });
      });
    });
    return allProducts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Logo and name at the top of the page */}
      <div className="w-full flex justify-center items-center py-8 bg-transparent">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white">
            <img src={process.env.PUBLIC_URL + '/zap-logo.png'} alt="ElectroWave Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <span className="text-2xl font-bold text-slate-900">ElectroWave</span>
        </Link>
      </div>

      {/* Search, Filters, and Sort */}
      <section className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 flex items-center gap-4 mb-4 lg:mb-0">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={e => {
                    setLocalActiveCategory('all');
                    setCategory('all');
                  if (e.target.value === '') clearSearch();
                  else {
                    if (typeof setSearchQuery === 'function') setSearchQuery(e.target.value);
                  }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              {/* Category Filter Dropdown */}
              <select
                value={activeCategory || 'all'}
                onChange={e => {
                  setLocalActiveCategory(e.target.value);
                  setCategory(e.target.value);
                  if (isSearching) clearSearch();
                }}
                className="w-48 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
              >
                <option value="all">All Categories</option>
                <option value="phones">Phones</option>
                <option value="laptops">Laptops</option>
                <option value="watches">Watches</option>
                <option value="headphones">Headphones</option>
                <option value="cameras">Cameras</option>
                <option value="gaming">Gaming</option>
                <option value="tablets">Tablets</option>
                <option value="speakers">Speakers</option>
              </select>
            </div>
            {/* Sort Dropdown */}
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
              <button className="p-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Filter className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="container mx-auto px-6 py-12">
        {isSearching ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-slate-600">
                  Found {getAllSearchResults().length} products
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
            
            {getAllSearchResults().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {getAllSearchResults().map(product => (
                  <ProductCard key={product.id} product={product} />
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
          <div className="space-y-16">
            {Object.keys(filteredProducts).map(category => (
              <section key={category}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-bold text-slate-900">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                  <button 
                    onClick={() => {
                      setLocalActiveCategory(category);
                      setCategory(category);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts[category].map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
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
              {(filteredProducts[activeCategory] || []).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Latest Electronics
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
            Discover the newest phones, laptops, watches, and headphones with cutting-edge technology
          </p>
          <Link 
            to="/"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Back to Home
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-20">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                  <img src={process.env.PUBLIC_URL + '/zap-logo.png'} alt="ElectroWave Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <span className="font-bold text-2xl">ElectroWave</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Your trusted destination for the latest electronics and cutting-edge technology.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Categories</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Smartphones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Laptops</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Smart Watches</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Audio</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Warranty</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ElectroWave. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ProductPage;
