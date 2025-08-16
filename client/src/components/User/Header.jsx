import { useState, useEffect, useRef, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { currentUser } from "../../store/authSlice";
import {
  logout,
  setLoading as setAuthLoading,
  setError as setAuthError,
  setUser,
  clearError as clearAuthError,
} from "../../store/authSlice";
import {
  setError as setCartError,
  setCart,
  clearError as clearCartError,
} from "../../store/cartSlice";
import {
  Search,
  ShoppingCart,
  Menu,
  Heart,
  X,
  LogOut,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Watch,
  Gamepad2,
  UserPlus,
  Package,
} from "lucide-react";
import { Input } from "../../Pages/ui/Input";
import { Button } from "../../Pages/ui/Button";
import { Badge } from "../../Pages/ui/Badge";
import CategoryNav from "./CategoryNav";
import axios from "axios";

const API_URL = "http://localhost:5000/api/users";
const CART_API_URL = "http://localhost:5000/api/cart";

// Memoized CartBadge component to prevent unnecessary re-renders
const CartBadge = memo(({ cartCount }) => (
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
));

export function Header() {
  const {
    loading: authLoading,
    isAuthenticated,
    token,
    user: storeUser,
    error: authError,
  } = useSelector(
    (state) =>
      state.auth || {
        loading: false,
        isAuthenticated: false,
        token: null,
        user: null,
        error: null,
      }
  );
  const { totalQuantity: cartCount, error: cartError } = useSelector(
    (state) => state.cart || { totalQuantity: 0, error: null }
  );
  const currentUserData = useSelector(currentUser) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
  }, []);

  useEffect(() => {
    if (isAuthenticated && !storeUser && token) {
      fetchProfile();
    }
  }, [isAuthenticated, token, storeUser]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart();
    } else {
      dispatch(setCart({ items: [] }));
    }
  }, [isAuthenticated, token]);

  const fetchProfile = async () => {
    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.user) {
        dispatch(setUser({ user: response.data.user, token }));
      } else {
        dispatch(setAuthError("No user data received from server"));
      }
    } catch (error) {
      dispatch(
        setAuthError(error.response?.data?.message || "Failed to fetch profile")
      );
      if (error.response?.status === 401) {
        dispatch(logout());
        navigate("/login");
      }
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(CART_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Cart:", response.data); // Debug log
      dispatch(setCart(response.data));
    } catch (error) {
      console.error("Fetch Cart Error:", error.response?.data || error.message);
      dispatch(
        setCartError(error.response?.data?.message || "Failed to fetch cart")
      );
      if (error.response?.status === 401) {
        dispatch(logout());
        navigate("/login");
      }
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
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  if (authError || cartError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center text-sm">
          {authError || cartError}
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

          <div className="flex-1 max-w-2xl mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for electronics, accessories..."
                className="pl-10 pr-12 py-3 w-full"
                value={searchInput}
                onChange={handleSearchChange}
                onBlur={handleInputBlur}
              />
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
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated && (
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200"
                onClick={() => navigate("/login")}
              >
                <UserPlus className="h-5 w-5" />
                <span className="text-sm font-medium">Sign In</span>
              </Button>
            )}

            {isAuthenticated && (
              <>
                <div className="relative" ref={profileMenuRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="relative"
                  >
                    {currentUserData?.profilePicture ? (
                      <img
                        src={`http://localhost:5000${currentUserData.profilePicture}`}
                        alt={`${currentUserData.firstName} ${currentUserData.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {getInitials(
                          currentUserData?.firstName,
                          currentUserData?.lastName
                        )}
                      </div>
                    )}
                  </Button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out animate-in slide-in-from-top-2">
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
                          <span className="text-sm font-medium">View Profile</span>
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
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/MyOrders">
                  <Button variant="ghost" size="icon" className="relative">
                    <Package className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}

            <CartBadge cartCount={cartCount} />

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

                    {isAuthenticated && (
                      <Link
                        to="/MyOrders"
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Package className="h-4 w-4" />
                        <span className="text-sm font-medium">My Orders</span>
                      </Link>
                    )}

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
    </header>
  );
}

export default memo(Header);
