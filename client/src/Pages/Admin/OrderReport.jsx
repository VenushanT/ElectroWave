import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

const OrderReport = ({ orders }) => {
  const generateReport = () => {
    if (!orders || orders.length === 0) {
      alert("No orders available to generate a report.");
      return;
    }

    const doc = new jsPDF();

    // Filter paid orders: paymentStatus is "Completed" and paymentMethod is not "Cash on Delivery"
    const paidOrders = orders.filter(
      (order) => order.paymentStatus === "Completed" && order.paymentMethod !== "Cash on Delivery"
    );
    // Filter unpaid orders: paymentStatus is "Pending" or paymentMethod is "Cash on Delivery"
    const unpaidOrders = orders.filter(
      (order) => order.paymentStatus === "Pending" || order.paymentMethod === "Cash on Delivery"
    );

    doc.setFontSize(18);
    doc.text("Order Report - Paid and Unpaid Orders", 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}`, 14, 30);

    doc.setFontSize(14);
    doc.text("Summary", 14, 40);
    doc.text(`Total Orders: ${orders.length}`, 14, 50);
    doc.text(`Paid Orders: ${paidOrders.length}`, 14, 60);
    doc.text(`Unpaid Orders: ${unpaidOrders.length}`, 14, 70);

    doc.setFontSize(14);
    doc.text("Paid Orders", 14, 90);
    autoTable(doc, {
      startY: 100,
      head: [["Order ID", "Customer Name", "Total Amount", "Payment Method"]],
      body: paidOrders.map((order) => [
        order._id,
        `${order.user?.firstName || "Unknown"} ${order.user?.lastName || "User"}`,
        `$${order.totalAmount.toFixed(2)}`,
        order.paymentMethod,
      ]),
    });

    doc.text("Unpaid Orders", 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Order ID", "Customer Name", "Total Amount", "Payment Method"]],
      body: unpaidOrders.map((order) => [
        order._id,
        `${order.user?.firstName || "Unknown"} ${order.user?.lastName || "User"}`,
        `$${order.totalAmount.toFixed(2)}`,
        order.paymentMethod,
      ]),
    });

    doc.save(`orders-report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <button
      onClick={generateReport}
      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
    >
      <Download className="h-5 w-5" />
      Generate Report
    </button>
  );
};

export default OrderReport;