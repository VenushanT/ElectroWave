import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  Star,
  Zap
} from "lucide-react";
import axios from "axios";

function CartItem({ item, onUpdateQuantity, onRemoveItem }) {
  const discount = item.product.originalPrice ? Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="relative">
          <img 
            src={item.product.images && item.product.images.length > 0 ? `http://localhost:5000/uploads/${item.product.images[0]}` : "/placeholder.svg"}
            alt={item.product.productName}
            className="w-24 h-24 object-cover rounded-lg"
            onError={(e) => { e.target.src = "/placeholder.svg"; }}
          />
          {discount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {item.product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900 mb-2">{item.product.productName}</h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(item.product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-600">{item.product.rating || 0}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-blue-600">${item.product.price}</span>
            {item.product.originalPrice > item.product.price && (
              <span className="text-lg text-slate-500 line-through">${item.product.originalPrice}</span>
            )}
          </div>
          <p className={`text-sm font-medium ${item.product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-2">
            <button
              onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
              disabled={item.quantity <= 1 || item.product.stock === 0}
              className="p-1 hover:bg-slate-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
              disabled={item.product.stock === 0 || item.quantity >= item.product.stock}
              className="p-1 hover:bg-slate-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => onRemoveItem(item.product._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right">
          <p className="text-sm text-slate-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900">
            ${(item.product.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

function AddToCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Please log in to view your cart.");
          setLoading(false);
          return;
        }
        const response = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(response.data);
      } catch (err) {
        setError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/cart/${productId}`, { quantity: newQuantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch (err) {
      setError("Failed to update cart.");
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch (err) {
      setError("Failed to remove item.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-2xl font-bold text-slate-900">Loading Cart...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Error</h3>
          <p className="text-slate-600 mb-8">{error}</p>
          {error.includes("log in") && (
            <Link to="/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Log In
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="fixed top-4 left-4 z-50">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Zap size={32} color="#6200EA" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900">ElectroWave</span>
          </Link>
        </div>
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 mx-auto text-slate-400 mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Cart is Empty</h1>
            <p className="text-slate-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link 
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 99 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const availableItems = cart.items.filter(item => item.product.stock > 0);
  const unavailableItems = cart.items.filter(item => item.product.stock === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="fixed top-4 left-4 z-50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Zap size={32} color="#6200EA" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-slate-900">ElectroWave</span>
        </Link>
      </div>
      <div className="container mx-auto px-6 py-12 pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
          <p className="text-slate-600">Review your items and proceed to checkout</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {availableItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Available Items ({availableItems.length})
                </h2>
                <div className="space-y-4">
                  {availableItems.map(item => (
                    <CartItem
                      key={item.product._id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={removeItem}
                    />
                  ))}
                </div>
              </div>
            )}
            {unavailableItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Unavailable Items ({unavailableItems.length})
                </h2>
                <div className="space-y-4">
                  {unavailableItems.map(item => (
                    <CartItem
                      key={item.product._id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={removeItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
              {shipping > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Add ${(99 - subtotal).toFixed(2)} more to get free shipping!
                  </p>
                </div>
              )}
              <Link 
                to="/payment"
                className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl ${
                  availableItems.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (availableItems.length === 0) {
                    e.preventDefault();
                  }
                }}
              >
                Pay Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/products"
                className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Continue Shopping
              </Link>
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Secure checkout with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddToCart;