import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { currentUser } from "../../store/authSlice";
import {
  logout,
  setLoading,
  setError,
  setUser,
  clearError,
} from "../../store/authSlice";
import {
  Search,
  ShoppingCart,
  Menu,
  Heart,
  Filter,
  X,
  LogOut,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Watch,
  Gamepad2,
  UserPlus,
} from "lucide-react";
import { Input } from "../../Pages/ui/Input";
import { Button } from "../../Pages/ui/Button";
import { Badge } from "../../Pages/ui/Badge";
import CategoryNav from "./CategoryNav";
import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export function Header() {
  const [cartCount] = useState(3); // Placeholder for cart count
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    brand: "",
    priceRange: "",
    rating: "",
    category: "",
  });

  const {
    loading,
    isAuthenticated,
    token,
    user: storeUser,
    error,
  } = useSelector(
    (state) =>
      state.auth || {
        loading: true,
        isAuthenticated: false,
        token: null,
        user: null,
        error: null,
      }
  );
  const currentUserData = useSelector(currentUser) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null);
  const filtersRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Placeholder for search context
  const {
    updateSearch,
    suggestions,
    showSuggestions,
    hideSuggestions,
    selectSuggestion,
    setCategory,
  } = {
    updateSearch: () => {},
    suggestions: [],
    showSuggestions: false,
    hideSuggestions: () => {},
    selectSuggestion: () => {},
    setCategory: () => {},
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
        hideSuggestions();
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hideSuggestions]);

  // Fetch user profile on mount if authenticated but user is null
  useEffect(() => {
    if (isAuthenticated && !storeUser && token) {
      fetchProfile();
    }
  }, [isAuthenticated, storeUser, token]);

  const fetchProfile = async () => {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.user) {
        dispatch(setUser({ user: response.data.user, token }));
      } else {
        dispatch(setError("No user data received from server"));
      }
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch profile")
      );
      if (error.response?.status === 401) {
        dispatch(logout());
        navigate("/login");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      updateSearch(searchInput.trim());
      hideSuggestions();
      navigate("/products");
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    updateSearch(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    selectSuggestion(suggestion);
    navigate("/products");
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      hideSuggestions();
    }, 200);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  // Hide profile-related button on homepage for guests
  const isHomepage = location.pathname === "/";
  const showProfileButton = isAuthenticated || !isHomepage;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="bg-slate-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <span>Free shipping on orders over $99</span>
          <div className="flex items-center gap-4">
            <span>24/7 Customer Support</span>
            <span>|</span>
            <span></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
              <img
                src={process.env.PUBLIC_URL + "/zap-logo.png"}
                alt="ElectroWave Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              ElectroWave
            </span>
          </Link>

          <div className="flex-1 max-w-2xl mx-8 relative" ref={filtersRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for electronics, accessories..."
                className="pl-10 pr-12 py-3 w-full"
                value={searchInput}
                onChange={handleSearchChange}
                onBlur={handleInputBlur}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowFilters(!showFilters)}
                type="button"
              >
                <Filter className="h-5 w-5" />
              </Button>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-1 z-50 max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center gap-3"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {showFilters && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-2xl mt-2 p-6 z-50 transform transition-all duration-200 ease-out animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Filter Products
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFilters.category}
                      onChange={(e) =>
                        setSelectedFilters({
                          ...selectedFilters,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">All Categories</option>
                      <option value="smartphones">Smartphones</option>
                      <option value="laptops">Laptops</option>
                      <option value="audio">Audio</option>
                      <option value="cameras">Cameras</option>
                      <option value="wearables">Wearables</option>
                      <option value="gaming">Gaming</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Brand
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFilters.brand}
                      onChange={(e) =>
                        setSelectedFilters({
                          ...selectedFilters,
                          brand: e.target.value,
                        })
                      }
                    >
                      <option value="">All Brands</option>
                      <option value="apple">Apple</option>
                      <option value="samsung">Samsung</option>
                      <option value="dell">Dell</option>
                      <option value="hp">HP</option>
                      <option value="sony">Sony</option>
                      <option value="bose">Bose</option>
                      <option value="canon">Canon</option>
                      <option value="nintendo">Nintendo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price Range
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFilters.priceRange}
                      onChange={(e) =>
                        setSelectedFilters({
                          ...selectedFilters,
                          priceRange: e.target.value,
                        })
                      }
                    >
                      <option value="">Any Price</option>
                      <option value="0-50">$0 - $50</option>
                      <option value="50-100">$50 - $100</option>
                      <option value="100-500">$100 - $500</option>
                      <option value="500-1000">$500 - $1000</option>
                      <option value="1000+">$1000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Min Rating
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFilters.rating}
                      onChange={(e) =>
                        setSelectedFilters({
                          ...selectedFilters,
                          rating: e.target.value,
                        })
                      }
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSelectedFilters({
                        brand: "",
                        priceRange: "",
                        rating: "",
                        category: "",
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      console.log("Applied filters:", selectedFilters);
                      setShowFilters(false);
                    }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {showProfileButton && (
              <div className="relative" ref={profileMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative"
                >
                  {isAuthenticated && currentUserData?.profilePicture ? (
                    <img
                      src={`http://localhost:5000${currentUserData.profilePicture}`}
                      alt={`${currentUserData.firstName} ${currentUserData.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : isAuthenticated ? (
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {getInitials(
                        currentUserData?.firstName,
                        currentUserData?.lastName
                      )}
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                      ?
                    </div>
                  )}
                </Button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out animate-in slide-in-from-top-2">
                    {isAuthenticated ? (
                      <>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 flex items-center gap-3">
                          {currentUserData?.profilePicture ? (
                            <img
                              src={`http://localhost:5000${currentUserData.profilePicture}`}
                              alt={`${currentUserData.firstName} ${currentUserData.lastName}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                              {getInitials(
                                currentUserData?.firstName,
                                currentUserData?.lastName
                              )}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 break-words">{`${currentUserData?.firstName} ${currentUserData?.lastName}`}</p>
                            <p className="text-sm text-slate-600 break-words">
                              {currentUserData?.email}
                            </p>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <UserPlus className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              View Profile
                            </span>
                          </Link>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => {
                              setShowProfileMenu(false);
                              dispatch(logout());
                              navigate("/login");
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Sign Out
                            </span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span className="text-sm font-medium">Sign In</span>
                        </Link>
                        <Link
                          to="/register"
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span className="text-sm font-medium">Register</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <div className="relative" ref={mobileMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="relative"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out animate-in slide-in-from-top-2">
                  <div className="py-2">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setShowMobileMenu(false);
                        console.log("Wishlist clicked");
                      }}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">Wishlist</span>
                    </button>

                    <Link
                      to="/cart"
                      className="w-full flex items-center justify-between px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Shopping Cart
                        </span>
                      </div>
                      {cartCount > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {cartCount}
                        </Badge>
                      )}
                    </Link>

                    <hr className="my-2 border-slate-200" />

                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Categories
                      </p>
                    </div>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm font-medium">Smartphones</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Laptop className="h-4 w-4" />
                      <span className="text-sm font-medium">Laptops</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Headphones className="h-4 w-4" />
                      <span className="text-sm font-medium">Audio</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Camera className="h-4 w-4" />
                      <span className="text-sm font-medium">Cameras</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Watch className="h-4 w-4" />
                      <span className="text-sm font-medium">Wearables</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Gamepad2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Gaming</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CategoryNav />
    </header>
  );
}

export default Header;
