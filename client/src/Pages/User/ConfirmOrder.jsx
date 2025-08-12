import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Zap } from "lucide-react";
import axios from "axios";

function ConfirmOrder() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Error</h3>
          <p className="text-slate-600 mb-8">{error || "Order not found."}</p>
          <Link to="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Zap size={32} color="#6200EA" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900">ElectroWave</span>
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Order Confirmed!</h1>
          <p className="text-slate-600 mb-6">Thank you for your purchase. Your order #{order._id} has been successfully placed.</p>
          <div className="space-y-4 mb-6">
            {order.items.map((item, index) => (
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
                <span className="font-semibold">${order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="font-semibold">{order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) > 99 ? 'Free' : '$15.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="font-semibold">${(order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">${(order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + (order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) > 99 ? 0 : 15) + (order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08)).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <Link
            to="/MyOrders"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ConfirmOrder;