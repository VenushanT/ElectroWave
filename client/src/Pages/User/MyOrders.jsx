import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Zap, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900">Error</h3>
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
        <h1 className="text-4xl font-bold text-slate-900 mb-8">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto text-slate-400 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Orders Yet</h2>
            <Link to="/products" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Order #{order._id}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.orderStatus === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-slate-600 mb-4">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="space-y-4 mb-6">
                  {order.items.map(item => (
                    <div key={item.product._id} className="flex justify-between">
                      <span>{item.product.productName} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <Link to={`/order/${order._id}`} className="mt-4 block text-blue-600 hover:underline">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;