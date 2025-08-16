import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  AlertCircle,
  Truck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Building,
  Calendar,
  KeyRound,
  Banknote,
  Sparkles,
  Download,
  Star,
  Award,
  TrendingUp
} from "lucide-react";
import axios from "axios";

// Custom hooks for better state management
const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value, paymentMethod) => {
    let error = '';
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          error = 'This field is required';
        } else if (value.length < 2) {
          error = 'Must be at least 2 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          error = 'Only letters, spaces, hyphens and apostrophes allowed';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      
      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^[0-9]{9}$/.test(value)) {
          error = 'Phone number must be exactly 9 digits (e.g., 771234567)';
        } else {
          if (!value.startsWith('7')) {
            error = 'Phone number must start with 7';
          }
        }
        break;
      
      case 'address':
        if (!value.trim()) {
          error = 'Address is required';
        } else if (value.length < 10) {
          error = 'Please enter a complete address';
        }
        break;
      
      case 'city':
        if (!value.trim()) {
          error = 'City is required';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          error = 'Only letters, spaces, hyphens and apostrophes allowed';
        }
        break;
      
      case 'state':
        if (!value.trim()) {
          error = 'State is required';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          error = 'Only letters, spaces, hyphens and apostrophes allowed';
        }
        break;
      
      case 'zipCode':
        if (!value.trim()) {
          error = 'ZIP code is required';
        } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
          error = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
        }
        break;
      
      case 'cardNumber':
        if (paymentMethod === 'card') {
          const cleaned = value.replace(/\s/g, '');
          if (!cleaned) {
            error = 'Card number is required';
          } else if (cleaned.length !== 16) {
            error = 'Card number must be 16 digits';
          } else if (!/^\d{16}$/.test(cleaned)) {
            error = 'Card number must contain only digits';
          }
        }
        break;
      
      case 'expiryDate':
        if (paymentMethod === 'card') {
          if (!value.trim()) {
            error = 'Expiry date is required';
          } else if (!/^\d{2}\/\d{2}$/.test(value)) {
            error = 'Invalid format (MM/YY)';
          } else {
            const [month, year] = value.split('/').map(Number);
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;
            
            if (month < 1 || month > 12) {
              error = 'Invalid month';
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
              error = 'Card has expired';
            }
          }
        }
        break;
      
      case 'cvv':
        if (paymentMethod === 'card') {
          if (!value.trim()) {
            error = 'CVV is required';
          } else if (!/^\d{3,4}$/.test(value)) {
            error = 'CVV must be 3 or 4 digits';
          }
        }
        break;
      
      case 'cardName':
        if (paymentMethod === 'card') {
          if (!value.trim()) {
            error = 'Cardholder name is required';
          } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            error = 'Only letters, spaces, hyphens and apostrophes allowed';
          }
        }
        break;
    }
    
    return error;
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearFieldError = useCallback((name) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  return {
    errors,
    touched,
    validateField,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    setErrors
  };
};

// Enhanced Input Component with real-time validation
const FormInput = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  icon: Icon, 
  error, 
  touched,
  maxLength,
  className = "",
  required = false,
  showPasswordToggle = false,
  prefix = "" // Added prefix prop for phone number
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isValid = touched && !error && value.trim();
  const hasError = touched && error;
  
  const inputType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        {Icon && <Icon className="h-4 w-4 text-slate-600" />}
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 font-medium z-10 bg-white px-1">
            {prefix}
          </span>
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`w-full py-3.5 border-2 rounded-xl transition-all duration-200 text-slate-900 placeholder-slate-400 bg-white/50 backdrop-blur-sm
            ${hasError 
              ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
              : isValid 
                ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                : isFocused
                  ? 'border-blue-400 bg-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
            } focus:outline-none ${prefix ? 'px-16' : 'px-4 pr-12'}`}
        />
        
        {/* Status Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {hasError && <XCircle className="h-5 w-5 text-red-500" />}
          {isValid && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </div>
      </div>
      
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-600 text-sm font-medium flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Professional Payment Method Card
const PaymentMethodCard = ({ method, selected, onClick, icon: Icon, title, description, badge }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`relative p-6 border-2 rounded-2xl transition-all duration-300 text-left group ${
      selected 
        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50' 
        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
    }`}
  >
    {badge && (
      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        {badge}
      </div>
    )}
    
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${
        selected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
      }`}>
        <Icon className="h-6 w-6" />
      </div>
      
      <div>
        <h3 className={`font-semibold ${selected ? 'text-blue-900' : 'text-slate-900'}`}>
          {title}
        </h3>
        <p className={`text-sm ${selected ? 'text-blue-700' : 'text-slate-600'}`}>
          {description}
        </p>
      </div>
    </div>
    
    {selected && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute top-4 right-4 bg-blue-500 rounded-full p-1"
      >
        <Check className="h-4 w-4 text-white" />
      </motion.div>
    )}
  </motion.button>
);

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
    phone: '', // Changed: Remove the +94 prefix from initial value
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const navigate = useNavigate();
  
  const {
    errors,
    touched,
    validateField,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    setErrors
  } = useFormValidation();

  // Memoized calculations for better performance
  const orderCalculations = useMemo(() => {
    if (!cart?.items) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 99 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  }, [cart]);

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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format specific fields
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 16);
      formattedValue = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'expiryDate') {
      let cleaned = value.replace(/\D/g, '').slice(0, 4);
      if (cleaned.length > 2) {
        cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      }
      formattedValue = cleaned;
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'phone') {
      // Only allow digits and limit to 9 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (['firstName', 'lastName', 'city', 'state', 'cardName'].includes(name)) {
      formattedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Real-time validation
    const fieldError = validateField(name, formattedValue, paymentMethod);
    if (fieldError) {
      setFieldError(name, fieldError);
    } else {
      clearFieldError(name);
    }
  }, [paymentMethod, validateField, setFieldError, clearFieldError]);

  const handleInputBlur = useCallback((e) => {
    const { name } = e.target;
    setFieldTouched(name);
  }, [setFieldTouched]);

  const validateForm = useCallback(() => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    if (paymentMethod === 'card') {
      requiredFields.push('cardNumber', 'expiryDate', 'cvv', 'cardName');
    }

    let isValid = true;
    const newErrors = {};

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field], paymentMethod);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
      setFieldTouched(field);
    });

    if (!isValid) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }

    return isValid;
  }, [formData, paymentMethod, validateField, setErrors, setFieldTouched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsProcessing(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
      
      // Format phone number with +94 prefix for submission
      const phoneWithPrefix = `+94${formData.phone}`;
      
      const response = await axios.post("http://localhost:5000/api/orders", {
        shippingAddress,
        paymentMethod,
        phone: phoneWithPrefix, // Include phone number in the request
        paymentDetails: paymentMethod === 'card' ? {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardName: formData.cardName
        } : {}
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowSuccessAnimation(true);
      
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/ConfirmOrder', { state: { orderId: response.data._id } });
      }, 2000);
      
    } catch (err) {
      setIsProcessing(false);
      setErrors({ submit: err.response?.data?.message || "Failed to process payment. Please check your details and try again or contact support." });
      console.error("Payment failed:", err.response?.data?.message || err.message);
    }
  };

  const handleDownloadPDF = useCallback(() => {
    if (!cart) return;
    
    const doc = new jsPDF();
    let y = 20;
    
    // Header with logo/branding
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text("ElectroWave", 20, y);
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Gray color
    doc.text("Premium Electronics Store", 20, y + 8);
    
    y += 25;
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Order Summary", 20, y);
    
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, y);
    
    y += 20;
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    // Items
    cart.items.forEach(item => {
      doc.text(`${item.product.productName}`, 20, y);
      doc.text(`Qty: ${item.quantity}`, 120, y);
      doc.text(`$${(item.product.price * item.quantity).toFixed(2)}`, 160, y);
      y += 8;
    });
    
    y += 10;
    // Totals
    const { subtotal, shipping, tax, total } = orderCalculations;
    
    doc.setTextColor(100);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, y);
    y += 8;
    doc.text(`Shipping: ${shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}`, 20, y);
    y += 8;
    doc.text(`Tax: $${tax.toFixed(2)}`, 20, y);
    y += 12;
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Total: $${total.toFixed(2)}`, 20, y);
    
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Payment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`, 20, y);
    
    y += 15;
    doc.setTextColor(59, 130, 246);
    doc.text("Thank you for choosing ElectroWave!", 20, y);
    doc.text("Your satisfaction is our priority.", 20, y + 8);
    
    doc.save("ElectroWave-OrderSummary.pdf");
  }, [cart, orderCalculations, paymentMethod]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-12 shadow-2xl"
        >
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="h-8 w-8 text-blue-600" />
            </motion.div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Loading Your Secure Checkout</h3>
          <p className="text-slate-600">Preparing your premium shopping experience...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 backdrop-blur-md rounded-3xl p-12 shadow-2xl max-w-md"
        >
          <div className="bg-red-100 rounded-full p-6 w-fit mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Oops! Something went wrong</h3>
          <p className="text-slate-600 mb-8 leading-relaxed">{error || "Your cart appears to be empty. Let's find some amazing products for you!"}</p>
          {error.includes("log in") ? (
            <Link to="/login" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Lock className="h-5 w-5 mr-2" />
              Secure Login
            </Link>
          ) : (
            <Link to="/products" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <TrendingUp className="h-5 w-5 mr-2" />
              Explore Products
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-500/90 to-teal-600/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-3xl p-12 text-center shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="bg-emerald-100 rounded-full p-6 w-fit mx-auto mb-6"
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h2>
              <p className="text-slate-600">Redirecting to your order confirmation...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-xl p-2">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Premium Order Summary</h2>
                  </div>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    onClick={() => setShowSummaryModal(false)}
                    aria-label="Close"
                  >
                    <XCircle className="h-6 w-6 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Star className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">${orderCalculations.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Shipping</span>
                      <span className="font-semibold">{orderCalculations.shipping === 0 ? 'Free' : `${orderCalculations.shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Tax</span>
                      <span className="font-semibold">${orderCalculations.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-300 pt-3">
                      <div className="flex justify-between text-xl font-bold text-slate-900">
                        <span>Total</span>
                        <span className="text-blue-600">${orderCalculations.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-slate-600 pt-2">
                      <span>Payment Method</span>
                      <span>{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold">Enterprise-Grade Security</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {paymentMethod === 'cod' ? 'Secure cash payment upon delivery with signature confirmation' : 'Your payment is protected with 256-bit SSL encryption and PCI DSS compliance'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <Download className="h-5 w-5" />
                    Download PDF Summary
                  </button>
                  <button
                    onClick={() => setShowSummaryModal(false)}
                    className="px-6 py-3 bg-slate-200 text-slate-900 rounded-xl hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:px-6 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link 
            to="/cart"
            className="p-3 hover:bg-white/70 backdrop-blur-sm rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-2">
              Premium Checkout
            </h1>
            <p className="text-slate-600 text-lg">Your secure gateway to premium electronics</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                    <p className="text-slate-600">Tell us about yourself</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Enter your first name"
                    icon={User}
                    error={errors.firstName}
                    touched={touched.firstName}
                    required
                  />
                  <FormInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Enter your last name"
                    error={errors.lastName}
                    touched={touched.lastName}
                    required
                  />
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="your.email@example.com"
                    icon={Mail}
                    error={errors.email}
                    touched={touched.email}
                    required
                  />
                  <FormInput
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="771234567" // Changed: Placeholder without +94 prefix
                    icon={Phone}
                    error={errors.phone}
                    touched={touched.phone}
                    required
                    prefix="+94"
                    maxLength="9"
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Billing Address</h2>
                    <p className="text-slate-600">Where should we send your order?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <FormInput
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="123 Main Street, Apt 4B"
                    icon={Building}
                    error={errors.address}
                    touched={touched.address}
                    required
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormInput
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="New York"
                      error={errors.city}
                      touched={touched.city}
                      required
                    />
                    <FormInput
                      label="State / Province"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="NY"
                      error={errors.state}
                      touched={touched.state}
                      required
                    />
                    <FormInput
                      label="ZIP / Postal Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="10001"
                      error={errors.zipCode}
                      touched={touched.zipCode}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-3">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Payment Method</h2>
                    <p className="text-slate-600">Choose your preferred payment option</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <PaymentMethodCard
                    method="card"
                    selected={paymentMethod === 'card'}
                    onClick={() => setPaymentMethod('card')}
                    icon={CreditCard}
                    title="Credit Card"
                    description="Visa, Mastercard, Amex"
                    badge="Popular"
                  />
                  <PaymentMethodCard
                    method="paypal"
                    selected={paymentMethod === 'paypal'}
                    onClick={() => setPaymentMethod('paypal')}
                    icon={() => (
                      <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                    )}
                    title="PayPal"
                    description="Fast & secure"
                  />
                  <PaymentMethodCard
                    method="apple"
                    selected={paymentMethod === 'apple'}
                    onClick={() => setPaymentMethod('apple')}
                    icon={() => (
                      <div className="h-6 w-6 bg-black rounded flex items-center justify-center">
                        <span className="text-white text-sm">🍎</span>
                      </div>
                    )}
                    title="Apple Pay"
                    description="Touch ID & Face ID"
                  />
                  <PaymentMethodCard
                    method="cod"
                    selected={paymentMethod === 'cod'}
                    onClick={() => setPaymentMethod('cod')}
                    icon={Truck}
                    title="Cash on Delivery"
                    description="Pay when delivered"
                    badge="Safe"
                  />
                </div>

                {/* Card Details */}
                <AnimatePresence>
                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <FormInput
                        label="Cardholder Name"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="John Doe"
                        icon={User}
                        error={errors.cardName}
                        touched={touched.cardName}
                        required
                      />
                      
                      <FormInput
                        label="Card Number"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="1234 5678 9012 3456"
                        icon={CreditCard}
                        error={errors.cardNumber}
                        touched={touched.cardNumber}
                        maxLength="19"
                        required
                      />
                      
                      <div className="grid grid-cols-2 gap-6">
                        <FormInput
                          label="Expiry Date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          placeholder="MM/YY"
                          icon={Calendar}
                          error={errors.expiryDate}
                          touched={touched.expiryDate}
                          maxLength="5"
                          required
                        />
                        <FormInput
                          label="Security Code"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          placeholder="123"
                          icon={KeyRound}
                          error={errors.cvv}
                          touched={touched.cvv}
                          maxLength="4"
                          required
                          showPasswordToggle
                        />
                      </div>

                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-amber-800 mb-2">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-semibold">Important Policy Notice</span>
                        </div>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          Card payments are final and non-refundable as per our service policy. Please review your order carefully before completing the payment.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* COD Info */}
                <AnimatePresence>
                  {paymentMethod === 'cod' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 text-emerald-800 mb-3">
                        <Truck className="h-6 w-6" />
                        <span className="font-semibold text-lg">Cash on Delivery Selected</span>
                      </div>
                      <div className="space-y-2 text-sm text-emerald-700">
                        <p className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Pay with cash when your order arrives at your doorstep
                        </p>
                        <p className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Signature confirmation required upon delivery
                        </p>
                        <p className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          No processing fees for cash payments
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-800 mb-1">Payment Failed</h3>
                        <p className="text-red-700 mb-4">{errors.submit}</p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setErrors({})}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Try Again
                          </button>
                          <Link
                            to="/cart"
                            className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            Back to Cart
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-5 rounded-2xl text-lg font-bold transition-all shadow-2xl flex items-center justify-center gap-3 ${
                  isProcessing 
                    ? 'bg-gradient-to-r from-slate-400 to-slate-500 text-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 shadow-blue-500/25 hover:shadow-blue-500/40'
                }`}
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing {paymentMethod === 'cod' ? 'Order' : 'Payment'}...
                  </>
                ) : (
                  <>
                    <Lock className="h-6 w-6" />
                    {paymentMethod === 'cod' ? 'Place Order' : 'Complete Secure Payment'} - ${orderCalculations.total.toFixed(2)}
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-1"
          >
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Order Summary</h2>
                  <p className="text-slate-600">Review your purchase</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {cart.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-4 bg-slate-50/50 rounded-xl border border-slate-200/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <Star className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{item.product.productName}</p>
                        <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">${orderCalculations.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Shipping</span>
                    <span className="font-semibold">{orderCalculations.shipping === 0 ? 'Free' : `${orderCalculations.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Tax (8%)</span>
                    <span className="font-semibold">${orderCalculations.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-3">
                    <div className="flex justify-between text-2xl font-bold text-slate-900">
                      <span>Total</span>
                      <span className="text-blue-600">${orderCalculations.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-600 pt-2">
                    <span>Payment Method</span>
                    <span className="capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</span>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => setShowSummaryModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Sparkles className="h-5 w-5" />
                View Detailed Summary
              </motion.button>

              {/* Trust Indicators */}
              <div className="mt-8 space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold text-sm">256-bit SSL Secure</span>
                  </div>
                  <p className="text-xs text-green-700">Your payment information is encrypted and protected</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <Banknote className="h-5 w-5" />
                    <span className="font-semibold text-sm">Money-Back Guarantee</span>
                  </div>
                  <p className="text-xs text-blue-700">30-day return policy on all products</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;