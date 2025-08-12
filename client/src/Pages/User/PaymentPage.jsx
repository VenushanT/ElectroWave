import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import { Link, useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Lock, 
  User, 
  MapPin, 
  Shield,
  ArrowLeft,
  Check,
  Zap,
  AlertCircle
} from "lucide-react";
import axios from "axios";

function PaymentPage() {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Please log in to proceed with payment.");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
      if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsProcessing(true);
    setError(""); // Clear previous errors
    try {
      const token = localStorage.getItem('token');
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
      const response = await axios.post("http://localhost:5000/api/orders", {
        shippingAddress,
        paymentMethod,
        paymentDetails: paymentMethod === 'card' ? {
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardName: formData.cardName
        } : {}
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsProcessing(false);
      navigate('/ConfirmOrder', { state: { orderId: response.data._id } });
    } catch (err) {
      setIsProcessing(false);
      setErrors({ submit: "Failed to process payment. Please check your details and try again or contact support." });
      // Log the error for debugging (optional)
      console.error("Payment failed:", err.response?.data?.message || err.message);
    }
  };

  const handleDownloadPDF = () => {
    if (!cart) return;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text("Order Summary", 10, y);
    y += 10;
    doc.setFontSize(12);
    cart.items.forEach(item => {
      doc.text(`${item.product.productName} (Qty: ${item.quantity}) - $${(item.product.price * item.quantity).toFixed(2)}`, 10, y);
      y += 8;
    });
    y += 4;
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 99 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 10, y);
    y += 8;
    doc.text(`Shipping: ${shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}`, 10, y);
    y += 8;
    doc.text(`Tax: $${tax.toFixed(2)}`, 10, y);
    y += 8;
    doc.setFontSize(14);
    doc.text(`Total: $${total.toFixed(2)}`, 10, y);
    y += 12;
    doc.setFontSize(10);
    doc.text("Thank you for shopping with ElectroWave!", 10, y);
    doc.save("OrderSummary.pdf");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-2xl font-bold text-slate-900">Loading...</h3>
        </div>
      </div>
    );
  }

  if (error || !cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Error</h3>
          <p className="text-slate-600 mb-8">{error || "Your cart is empty."}</p>
          {error.includes("log in") ? (
            <Link to="/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Log In
            </Link>
          ) : (
            <Link to="/products" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Shop Now
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatePresence>
        {showSummaryModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl font-bold"
                onClick={() => setShowSummaryModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900">{item.product.productName}</p>
                      <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <hr className="border-slate-200 mb-4" />
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">${cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold">{cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) > 99 ? 'Free' : '$15.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-semibold">${(cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${(cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + (cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) > 99 ? 0 : 15) + (cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08)).toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-4"
              >
                <Check className="h-5 w-5" />
                Download Order Summary as PDF
              </button>
              <div className="text-center">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/cart"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Secure Checkout</h1>
            <p className="text-slate-600">Complete your purchase safely and securely</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-slate-300'}`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-slate-300'}`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-slate-300'}`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Billing Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-slate-300'}`}
                      placeholder="Enter your street address"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="City"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="State"
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.zipCode ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="ZIP"
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2" />
                    <span className="block text-sm font-medium">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="h-6 w-6 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="block text-sm font-medium">PayPal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'apple' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="h-6 w-6 mx-auto mb-2 bg-black rounded flex items-center justify-center">
                      <span className="text-white text-xs">🍎</span>
                    </div>
                    <span className="block text-sm font-medium">Apple Pay</span>
                  </button>
                </div>
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cardName ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="Name on card"
                      />
                      {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cardNumber ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.expiryDate ? 'border-red-500' : 'border-slate-300'}`}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cvv ? 'border-red-500' : 'border-slate-300'}`}
                          placeholder="123"
                          maxLength="4"
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.submit && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-2 mt-4">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700">{errors.submit}</p>
                  <button
                    onClick={() => setErrors({})} // Clear error to retry
                    className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Retry Payment
                  </button>
                  <Link
                    to="/cart"
                    className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Back to Cart
                  </Link>
                </div>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                  isProcessing 
                    ? 'bg-slate-400 text-slate-600 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Complete Payment - ${(cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + (cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) > 99 ? 0 : 15) + (cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08)).toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900">{item.product.productName}</p>
                      <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <hr className="border-slate-200" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold">${cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-semibold">{cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) > 99 ? 'Free' : '$15.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-semibold">${(cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${(cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + (cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) > 99 ? 0 : 15) + (cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryModal(true)}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                View Full Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;