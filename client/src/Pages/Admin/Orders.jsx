import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, ChevronLeft } from "lucide-react";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:5000/api/orders");
      setOrders(response.data);
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
        { status: newStatus }
      );
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.response?.data?.message || "Failed to update order status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-2xl font-bold text-slate-900">Loading Orders...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900">Error</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              Manage Orders
            </h1>
            <p className="text-slate-600">View and update the status of all orders</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Orders Found</h3>
              <p className="text-slate-600">There are currently no orders to display.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Order #{order._id}
                    </h2>
                    <select
                      value={order.orderStatus || "Pending"}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Details
                      </h3>
                      <p className="text-sm text-slate-600">
                        Name: {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-sm text-slate-600">Email: {order.user?.email}</p>
                      <p className="text-sm text-slate-600">Phone: {order.user?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-700">Shipping Address</h3>
                      <p className="text-sm text-slate-600">{order.shippingAddress}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-700">Order Items</h3>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product.productName} (Qty: {item.quantity})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <hr className="border-slate-200 my-2" />
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 99 ? "Free" : "$15.00"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total</span>
                      <span>
                        ${(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
                          (order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 99 ? 0 : 15) +
                          (order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;