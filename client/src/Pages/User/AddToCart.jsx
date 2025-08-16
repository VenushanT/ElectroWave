import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Star,
  Shield,
  Truck,
  CreditCard,
  Gift,
  Package,
  AlertTriangle,
  Loader2,
  Heart,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setCart, setLoading as setCartLoading, setError as setCartError, clearError as clearCartError } from "../../store/cartSlice"; // Adjust the path as needed
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS

function CartItem({
  item,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating = false,
}) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isRemoving, setIsRemoving] = useState(false);

  const discount = item.product.originalPrice
    ? Math.round(
        ((item.product.originalPrice - item.product.price) /
          item.product.originalPrice) *
          100
      )
    : 0;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return;
    setLocalQuantity(newQuantity);
    await onUpdateQuantity(item.product._id, newQuantity);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemoveItem(item.product._id);
    setIsRemoving(false);
  };

  const isOutOfStock = item.product.stock === 0;
  const isLowStock = item.product.stock > 0 && item.product.stock <= 5;

  return (
    <div
      className={`group relative bg-white/90 backdrop-blur-xl border rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 ${
        isOutOfStock
          ? "border-red-200 bg-red-50/30"
          : "border-gray-100/60 hover:border-gray-200/80"
      } ${isRemoving ? "opacity-50 scale-95" : ""}`}
    >
      {isOutOfStock && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 z-10 flex items-center justify-center">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Out of Stock
          </div>
        </div>
      )}

      <div className="flex p-8 gap-8">
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={
                item.product.images && item.product.images.length > 0
                  ? `http://localhost:5000/uploads/${item.product.images[0]}`
                  : "/placeholder.svg"
              }
              alt={item.product.productName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.src = "/placeholder.svg";
              }}
            />
          </div>

          {discount > 0 && (
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              -{discount}%
            </div>
          )}

          {isLowStock && !isOutOfStock && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Only {item.product.stock} left
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 mr-4">
              <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {item.product.productName}
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 transition-colors ${
                        i < Math.floor(item.product.rating || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {item.product.rating || 0} ({item.product.numReviews || 0}{" "}
                  reviews)
                </span>
                <Link
                  to={`/product/${item.product._id}/reviews`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors duration-300"
                  title="View all reviews"
                >
                  <Eye className="h-4 w-4" />
                  View Reviews
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${item.product.price}
                </span>
                {item.product.originalPrice > item.product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${item.product.originalPrice}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6">
                {isOutOfStock ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-600">
                      Out of Stock
                    </span>
                  </>
                ) : isLowStock ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-600">
                      Low Stock - Only {item.product.stock} left
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      In Stock
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50"
              title="Remove from cart"
            >
              {isRemoving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1">
                <button
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  disabled={localQuantity <= 1 || isOutOfStock || isUpdating}
                  className="p-3 hover:bg-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="px-6 py-3 min-w-[4rem] text-center">
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    <span className="font-bold text-lg">{localQuantity}</span>
                  )}
                </div>

                <button
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  disabled={
                    localQuantity >= item.product.stock ||
                    isOutOfStock ||
                    isUpdating
                  }
                  className="p-3 hover:bg-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <span className="text-sm text-gray-600">
                Max: {item.product.stock}
              </span>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1 font-medium">
                Item Total
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${(item.product.price * localQuantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingSummary({ cart, shipping, tax, total, availableItemsCount }) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const freeShippingThreshold = 99;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-gray-100/60 rounded-3xl shadow-xl p-8 sticky top-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Package className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-700 font-medium">
            Subtotal ({cart.items.length} items)
          </span>
          <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700 font-medium">Shipping</span>
          </div>
          <span className="font-bold text-lg">
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700 font-medium">Tax</span>
          </div>
          <span className="font-bold text-lg">${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {shipping > 0 && remainingForFreeShipping > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Truck className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              Free Shipping Available!
            </span>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            Add{" "}
            <span className="font-bold">
              ${remainingForFreeShipping.toFixed(2)}
            </span>{" "}
            more to get free shipping
          </p>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  (subtotal / freeShippingThreshold) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      <Link
        to="/payment"
        className={`w-full inline-flex items-center justify-center px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 mb-4 ${
          availableItemsCount > 0
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        onClick={(e) => {
          if (availableItemsCount === 0) {
            e.preventDefault();
          }
        }}
      >
        <CreditCard className="mr-3 h-6 w-6" />
        Proceed to Payment
        <ArrowRight className="ml-3 h-6 w-6" />
      </Link>

      <Link
        to="/products"
        className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        Continue Shopping
      </Link>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Secure checkout with 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}

function AddToCart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading: cartLoading, error: cartError } = useSelector((state) => state.cart || { cart: { items: [] }, loading: false, error: "" });
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    const fetchCart = async () => {
      dispatch(setCartLoading(true));
      dispatch(clearCartError());
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          dispatch(setCartError("Please log in to view your cart."));
          return;
        }

        const response = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setCart(response.data));
      } catch (err) {
        console.error("Error fetching cart:", err);
        dispatch(setCartError(err.response?.data?.message || "Failed to load cart. Please try again."));
      } finally {
        dispatch(setCartLoading(false));
      }
    };

    fetchCart();
  }, [dispatch]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set([...prev, productId]));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setCart(response.data));
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error(err.response?.data?.message || "Failed to update quantity. Please try again.", { autoClose: 3000 });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/cart/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setCart(response.data));
      toast.success("Item removed from cart.", { autoClose: 3000 }); // Added success toast
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error(err.response?.data?.message || "Failed to remove item. Please try again.", { autoClose: 3000 });
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            Loading Your Cart
          </h3>
          <p className="text-gray-600 text-lg">
            Preparing your selected items...
          </p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-8 text-lg">{cartError}</p>
          {cartError.includes("log in") ? (
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Log In to Continue
            </Link>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="h-16 w-16 text-indigo-400" />
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Your Cart is Empty
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Ready to fill it with amazing products? Explore our premium
              collection and find something you'll love.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Package className="mr-3 h-6 w-6" />
                Start Shopping
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>

              <Link
                to="/categories"
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 rounded-2xl hover:bg-white/60 transition-all duration-300 shadow-sm hover:shadow-lg font-semibold text-lg"
              >
                Browse Categories
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Free Shipping</h3>
                <p className="text-gray-600">On orders over $99</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
                <p className="text-gray-600">256-bit SSL encryption</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Easy Returns</h3>
                <p className="text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 99 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const availableItems = cart.items.filter((item) => item.product.stock > 0);
  const unavailableItems = cart.items.filter(
    (item) => item.product.stock === 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Shopping Cart
          </h1>
          <p className="text-xl text-gray-600">
            Review your selected items and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {availableItems.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Available Items ({availableItems.length})
                  </h2>
                </div>

                <div className="space-y-6">
                  {availableItems.map((item) => (
                    <CartItem
                      key={item.product._id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={removeItem}
                      isUpdating={updatingItems.has(item.product._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {unavailableItems.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Unavailable Items ({unavailableItems.length})
                  </h2>
                </div>

                <div className="space-y-6">
                  {unavailableItems.map((item) => (
                    <CartItem
                      key={item.product._id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={removeItem}
                      isUpdating={updatingItems.has(item.product._id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <PricingSummary
              cart={cart}
              shipping={shipping}
              tax={tax}
              total={total}
              availableItemsCount={availableItems.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddToCart;