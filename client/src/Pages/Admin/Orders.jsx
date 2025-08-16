import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import {
  ShoppingBag,
  User,
  ChevronLeft,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Loader,
  CreditCard,
  Download,
} from "lucide-react";
import axios from "axios";
import OrderReport from "./OrderReport";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [updating, setUpdating] = useState(false);

  const statusColors = {
    Pending: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", icon: Clock },
    Shipped: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: Truck },
    Delivered: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", icon: CheckCircle },
    Cancelled: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200", icon: XCircle },
  };

  const paymentColors = {
    card: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: CreditCard, label: "Card" },
    paypal: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: CreditCard, label: "PayPal" },
    apple: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: CreditCard, label: "Apple Pay" },
    cod: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200", icon: Truck, label: "Cash on Delivery" },
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Please log in to access orders.");
      }
      const response = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders. Please ensure the server is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user ? `${order.user.firstName} ${order.user.lastName}` : "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(order => (order.orderStatus || "Pending") === statusFilter);
    }

    // Filter by payment method
    if (paymentFilter !== "All") {
      filtered = filtered.filter(order => order.paymentMethod === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, orderStatus: newStatus, paymentStatus: response.data.paymentStatus } : order
      ));
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.response?.data?.message || "Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const calculateOrderTotal = (order) => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 99 ? 0 : 15;
    const tax = subtotal * 0.08;
    return parseFloat((subtotal + shipping + tax).toFixed(2));
  };

  const getOrderSummary = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => (o.orderStatus || "Pending") === "Pending").length;
    const shipped = orders.filter(o => o.orderStatus === "Shipped").length;
    const delivered = orders.filter(o => o.orderStatus === "Delivered").length;
    const cancelled = orders.filter(o => o.orderStatus === "Cancelled").length;
    const card = orders.filter(o => ['card', 'paypal', 'apple'].includes(o.paymentMethod)).length;
    const cod = orders.filter(o => o.paymentMethod === 'cod').length;

    return { total, pending, shipped, delivered, cancelled, card, cod };
  }, [orders]);

  const StatusBadge = ({ status }) => {
    const statusInfo = statusColors[status] || statusColors.Pending;
    const IconComponent = statusInfo.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} border`}>
        <IconComponent className="h-3.5 w-3.5" />
        {status}
      </span>
    );
  };

  const PaymentBadge = ({ paymentMethod, paymentStatus }) => {
    const paymentInfo = paymentColors[paymentMethod] || paymentColors.card;
    const IconComponent = paymentInfo.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${paymentInfo.bg} ${paymentInfo.text} ${paymentInfo.border} border`}
        data-tooltip-id={`payment-tooltip-${paymentMethod}`}
        data-tooltip-content={paymentMethod === 'cod' ? 'Payment due on delivery' : 'Payment processed via card or digital wallet'}
      >
        <IconComponent className="h-3.5 w-3.5" />
        {paymentInfo.label} ({paymentStatus})
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchOrders}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="p-3 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm border border-white/50"
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900">Orders Management</h1>
            </div>
            <p className="text-slate-600">Monitor and manage all customer orders efficiently</p>
          </div>
        </div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-white/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">{getOrderSummary.total}</p>
              </div>
              <Package className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-white/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Pending</p>
                <p className="text-2xl font-bold text-amber-700">{getOrderSummary.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-white/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Shipped</p>
                <p className="text-2xl font-bold text-blue-700">{getOrderSummary.shipped}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-white/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Delivered</p>
                <p className="text-2xl font-bold text-emerald-700">{getOrderSummary.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-white/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-700">{getOrderSummary.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-white/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Card / COD</p>
                <p className="text-2xl font-bold text-blue-700">{`${getOrderSummary.card} / ${getOrderSummary.cod}`}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-white/50 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                >
                  <option value="All">All Payments</option>
                  <option value="card">Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="apple">Apple Pay</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
              <button
                onClick={fetchOrders}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                disabled={updating}
              >
                <RefreshCw className={`h-5 w-5 ${updating ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <OrderReport orders={orders} />
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {orders.length === 0 ? "No Orders Found" : "No Matching Orders"}
              </h3>
              <p className="text-slate-600">
                {orders.length === 0
                  ? "There are currently no orders to display."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  className="p-6 hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Order ID: {order._id}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${calculateOrderTotal(order).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.orderStatus || "Pending"} />
                      <select
                        value={order.orderStatus || "Pending"}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updating}
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm disabled:opacity-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-5 w-5 text-slate-400" />
                        <h4 className="font-semibold text-slate-900">Customer Details</h4>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                        <p className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-slate-700">Name:</span>
                          <span className="text-slate-600">
                            {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Unknown User"}
                          </span>
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{order.user?.email || "Not provided"}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{order.user?.phoneNumber || "Not provided"}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-700">Payment:</span>
                          <PaymentBadge paymentMethod={order.paymentMethod} paymentStatus={order.paymentStatus} />
                        </p>
                        <Tooltip id={`payment-tooltip-${order.paymentMethod}`} place="top" effect="solid" />
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-5 w-5 text-slate-400" />
                        <h4 className="font-semibold text-slate-900">Shipping Address</h4>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600">{order.shippingAddress}</p>
                      </div>
                    </div>

                    {/* Order Items and Summary */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-5 w-5 text-slate-400" />
                        <h4 className="font-semibold text-slate-900">Order Items</h4>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="space-y-3 mb-4">
                          {order.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 last:border-b-0 last:pb-0"
                            >
                              <div>
                                <p className="font-medium text-slate-900">
                                  {item.product ? item.product.productName : "Product Unavailable"}
                                </p>
                                <p className="text-slate-600">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-slate-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-slate-200 pt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="text-slate-900">
                              ${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Shipping</span>
                            <span className="text-slate-900">
                              {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 99 ? "Free" : "$15.00"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tax (8%)</span>
                            <span className="text-slate-900">
                              ${(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                            <span className="text-slate-900">Total</span>
                            <span className="text-slate-900">${calculateOrderTotal(order).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Orders;