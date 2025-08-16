// MyOrders.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  ArrowRight, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter
} from "lucide-react";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Please log in to view your orders.");
          setLoading(false);
          return;
        }
        const response = await axios.get("http://localhost:5000/api/orders/myorders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setCancellingOrder(id);
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/orders/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const response = await axios.get("http://localhost:5000/api/orders/myorders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
        setSuccessMessage('Order cancelled successfully');
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to cancel order.");
        setTimeout(() => setError(''), 4000);
      } finally {
        setCancellingOrder(null);
      }
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusIcon = (status) => {
    const iconProps = { className: "w-4 h-4" };
    
    switch (status) {
      case 'Pending':
        return <Clock {...iconProps} className="w-4 h-4 text-amber-600 animate-pulse" />;
      case 'Shipped':
        return <Truck {...iconProps} className="w-4 h-4 text-blue-600 animate-bounce" />;
      case 'Delivered':
        return <CheckCircle {...iconProps} className="w-4 h-4 text-emerald-600" />;
      case 'Cancelled':
        return <XCircle {...iconProps} className="w-4 h-4 text-rose-600" />;
      default:
        return <Package {...iconProps} className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-100';
      case 'Shipped':
        return 'bg-blue-50 text-blue-800 border-blue-200 ring-blue-100';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200 ring-rose-100';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200 ring-slate-100';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Failed':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'Cancelled':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.orderStatus.toLowerCase() === filterStatus.toLowerCase();
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'Pending').length,
    shipped: orders.filter(o => o.orderStatus === 'Shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-slate-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Loading Orders</h3>
            <p className="text-sm text-slate-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          {error.includes("log in") && (
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
              <p className="text-slate-600 text-sm mt-1">
                {orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''} found` : 'No orders yet'}
              </p>
            </div>
            
            {/* Filter Dropdown */}
            {orders.length > 0 && (
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Filter className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {orders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-2xl font-bold text-slate-900">{orderStats.total}</div>
                <div className="text-xs text-slate-600 font-medium">Total Orders</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-2xl font-bold text-amber-600">{orderStats.pending}</div>
                <div className="text-xs text-slate-600 font-medium">Pending</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-2xl font-bold text-blue-600">{orderStats.shipped}</div>
                <div className="text-xs text-slate-600 font-medium">Shipped</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-2xl font-bold text-emerald-600">{orderStats.delivered}</div>
                <div className="text-xs text-slate-600 font-medium">Delivered</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-2xl font-bold text-rose-600">{orderStats.cancelled}</div>
                <div className="text-xs text-slate-600 font-medium">Cancelled</div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {error && !error.includes("log in") && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus} orders`}
            </h2>
            <p className="text-slate-600 mb-8">
              {filterStatus === 'all' 
                ? 'Start shopping to see your orders here' 
                : `You don't have any ${filterStatus} orders at the moment`}
            </p>
            {filterStatus === 'all' && (
              <Link 
                to="/products" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const isExpanded = expandedOrders.has(order._id);
              
              return (
                <div 
                  key={order._id} 
                  className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden"
                >
                  {/* Order Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleOrderExpansion(order._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.orderStatus)}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ring-1 ${getStatusStyle(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">#{order._id.slice(-8).toUpperCase()}</h3>
                          <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-lg text-slate-900">${order.totalAmount.toFixed(2)}</div>
                          <div className="text-sm text-slate-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      {/* Order Items */}
                      <div className="mb-6 mt-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={item.product?._id || index} className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                              <div className="flex-1">
                                <span className="text-slate-900 font-medium text-sm">
                                  {item.product ? item.product.productName : 'Product Unavailable'}
                                </span>
                                <span className="text-slate-600 text-sm ml-2">× {item.quantity}</span>
                              </div>
                              <span className="font-semibold text-slate-900 text-sm">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <CreditCard className="h-4 w-4" />
                            <span>Payment Method</span>
                          </div>
                          <p className="font-medium text-slate-900 capitalize text-sm">{order.paymentMethod}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            {getPaymentStatusIcon(order.paymentStatus)}
                            <span>Payment Status</span>
                          </div>
                          <p className="font-medium text-slate-900 text-sm">{order.paymentStatus}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>Shipping Address</span>
                          </div>
                          <p className="font-medium text-slate-900 text-sm line-clamp-2" title={order.shippingAddress}>
                            {order.shippingAddress}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {order.orderStatus === 'Pending' && (
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(order._id);
                            }}
                            disabled={cancellingOrder === order._id}
                            className="inline-flex items-center px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingOrder === order._id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Cancel Order
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;