import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  CheckCircle, 
  Package, 
  Calendar,
  CreditCard,
  Truck,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  ArrowRight,
  Download,
  Share2,
  AlertCircle,
  Sparkles,
  FileText
} from "lucide-react";
import axios from "axios";

function ConfirmOrder() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !orderId) {
          setError("Invalid order or authentication.");
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
        
        // Trigger success animation
        setTimeout(() => setShowAnimation(true), 300);
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const calculateSubtotal = () => {
    return order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 99 ? 0 : 15;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = () => {
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from order
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate HTML receipt content
  const generateReceiptHTML = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax();
    const total = calculateTotal();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt - Order #${order._id.slice(-8).toUpperCase()}</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            color: #333;
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #3B82F6; 
            padding-bottom: 30px; 
            margin-bottom: 40px; 
        }
        .header h1 { 
            color: #1E40AF; 
            font-size: 2.5em; 
            margin: 0 0 10px 0;
            font-weight: bold;
        }
        .header p { 
            color: #6B7280; 
            font-size: 1.1em; 
            margin: 5px 0;
        }
        .order-info { 
            background: #F8FAFC; 
            padding: 25px; 
            border-radius: 12px; 
            margin-bottom: 30px;
            border-left: 5px solid #10B981;
        }
        .order-info h2 { 
            color: #1F2937; 
            margin-top: 0; 
            font-size: 1.5em;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-top: 20px;
        }
        .info-item { 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-label { 
            font-weight: bold; 
            color: #374151; 
            display: block; 
            margin-bottom: 5px;
        }
        .info-value { 
            color: #6B7280; 
        }
        .items-section { 
            margin: 40px 0; 
        }
        .items-section h2 { 
            color: #1F2937; 
            border-bottom: 2px solid #E5E7EB; 
            padding-bottom: 10px;
            font-size: 1.5em;
        }
        .item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 20px; 
            border-bottom: 1px solid #E5E7EB; 
            background: #FAFBFC;
            margin-bottom: 10px;
            border-radius: 8px;
        }
        .item:last-child { 
            border-bottom: none; 
        }
        .item-details h3 { 
            margin: 0 0 8px 0; 
            color: #1F2937; 
            font-size: 1.2em;
        }
        .item-details p { 
            margin: 0; 
            color: #6B7280; 
            font-size: 0.95em;
        }
        .item-price { 
            text-align: right; 
            font-size: 1.1em;
        }
        .item-price .unit-price { 
            color: #6B7280; 
            font-size: 0.9em; 
        }
        .item-price .total-price { 
            color: #1F2937; 
            font-weight: bold; 
            font-size: 1.2em;
        }
        .summary { 
            background: #F8FAFC; 
            padding: 30px; 
            border-radius: 12px; 
            margin-top: 40px;
            border: 2px solid #E5E7EB;
        }
        .summary h2 { 
            color: #1F2937; 
            margin-top: 0; 
            text-align: center;
            font-size: 1.5em;
        }
        .summary-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 15px 0; 
            padding: 10px 0;
            font-size: 1.1em;
        }
        .summary-row.total { 
            border-top: 2px solid #3B82F6; 
            font-weight: bold; 
            font-size: 1.3em; 
            color: #1E40AF; 
            padding-top: 20px;
            margin-top: 25px;
        }
        .free-shipping { 
            color: #10B981; 
            font-weight: bold; 
        }
        .footer { 
            text-align: center; 
            margin-top: 50px; 
            padding-top: 30px; 
            border-top: 2px solid #E5E7EB; 
            color: #6B7280;
        }
        .footer p { 
            margin: 10px 0; 
        }
        .status-badge {
            display: inline-block;
            background: #D1FAE5;
            color: #065F46;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ Your Store</h1>
        <p><strong>Order Receipt</strong></p>
        <p>Thank you for your purchase!</p>
    </div>

    <div class="order-info">
        <h2>📋 Order Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Order Number:</span>
                <span class="info-value">#${order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${formatDate(order.createdAt)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="status-badge">${order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Estimated Delivery:</span>
                <span class="info-value">${getEstimatedDelivery()}</span>
            </div>
        </div>
    </div>

    <div class="items-section">
        <h2>📦 Order Items</h2>
        ${order.items.map(item => `
            <div class="item">
                <div class="item-details">
                    <h3>${item.product.productName}</h3>
                    <p>Quantity: ${item.quantity} × $${item.product.price.toFixed(2)}</p>
                </div>
                <div class="item-price">
                    <div class="unit-price">$${item.product.price.toFixed(2)} each</div>
                    <div class="total-price">$${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="summary">
        <h2>💰 Order Summary</h2>
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping:</span>
            <span class="${shipping === 0 ? 'free-shipping' : ''}">
                ${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
        </div>
        <div class="summary-row">
            <span>Tax (8%):</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    </div>

    <div class="footer">
        <p><strong>Thank you for shopping with us! 🎉</strong></p>
        <p>For questions about your order, please contact our customer service.</p>
        <p>📧 support@yourstore.com | 📞 1-800-123-4567</p>
        <p style="margin-top: 30px; font-size: 0.9em;">Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
    </div>
</body>
</html>`;
  };

  // Download receipt as HTML file
  const downloadReceipt = async () => {
    try {
      setDownloadingReceipt(true);
      
      const receiptHTML = generateReceiptHTML();
      const blob = new Blob([receiptHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${order._id.slice(-8).toUpperCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message (optional)
      setTimeout(() => {
        alert('✅ Receipt downloaded successfully!');
      }, 500);
      
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('❌ Failed to download receipt. Please try again.');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  // Alternative: Print receipt
  const printReceipt = () => {
    const receiptHTML = generateReceiptHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8 mx-auto"></div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-blue-300 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3">Processing Your Order</h3>
              <p className="text-lg text-slate-600">Please wait while we confirm your purchase...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-lg mx-auto border border-red-100">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">Oops! Something went wrong</h3>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">{error || "Order not found. Please try again."}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/products" 
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all duration-200 font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Success Header with Animation */}
        <div className={`text-center mb-12 transition-all duration-1000 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse opacity-20"></div>
            <div className="relative w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="h-12 w-12 text-white animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            🎉 Thank you for your purchase! Your order has been successfully placed.
          </p>
          <p className="text-lg text-slate-500">
            Order #{order._id.slice(-8).toUpperCase()} • Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Order Items</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Package className="h-10 w-10 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {item.product.productName}
                          </h3>
                          <div className="flex items-center gap-6 text-slate-600">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              Quantity: <span className="font-semibold text-slate-900">{item.quantity}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              Unit Price: <span className="font-semibold text-slate-900">${item.product.price.toFixed(2)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Order Summary</h2>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 text-slate-700">
                      <span className="text-lg font-medium">Subtotal</span>
                      <span className="text-lg font-semibold">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-slate-700">
                      <span className="text-lg font-medium flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping
                      </span>
                      <span className="text-lg font-semibold">
                        {calculateShipping() === 0 ? (
                          <span className="text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Free
                          </span>
                        ) : (
                          `$${calculateShipping().toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-slate-700">
                      <span className="text-lg font-medium">Tax (8%)</span>
                      <span className="text-lg font-semibold">${calculateTax().toFixed(2)}</span>
                    </div>
                    <hr className="border-slate-300 my-4" />
                    <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-6">
                      <span className="text-2xl font-bold text-slate-900">Total</span>
                      <span className="text-3xl font-bold text-blue-600">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Order Status & Actions */}
            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Order Status</h3>
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-slate-500">{getEstimatedDelivery()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Truck className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Shipping Method</p>
                      <p className="text-sm text-slate-500">
                        {calculateShipping() === 0 ? 'Free Standard Shipping' : 'Standard Shipping'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <Link
                    to="/MyOrders"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    View All Orders
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  
                  <button 
                    onClick={downloadReceipt}
                    disabled={downloadingReceipt}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {downloadingReceipt ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        Download Receipt
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={printReceipt}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all duration-200 font-semibold"
                  >
                    <FileText className="h-5 w-5" />
                    Print Receipt
                  </button>
                  
                  <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all duration-200 font-semibold">
                    <Share2 className="h-5 w-5" />
                    Share Order
                  </button>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl p-8 text-white text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Continue Shopping</h3>
                <p className="text-blue-100 mb-6">Discover more amazing products in our collection</p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 font-semibold"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What's Next?</h2>
            <p className="text-lg text-slate-600 mb-8">
              We'll send you email updates about your order status. Track your package and manage your orders anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/MyOrders"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              >
                Track Your Orders
              </Link>
              <Link
                to="/products"
                className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all duration-200 font-semibold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmOrder;