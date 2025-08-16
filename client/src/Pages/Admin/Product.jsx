import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Doughnut, PolarArea } from 'react-chartjs-2';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Download,
  Calendar,
  BarChart3,
  ShoppingBag,
  Activity,
  RefreshCcw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Star,
  Filter,
  CreditCard,
  Truck
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const ProductDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [stockFilter, setStockFilter] = useState('all');
  
  const dashboardRef = useRef(null);

  const fetchData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [ordersRes, productsRes, topSellingRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/orders', { headers }),
        fetch('http://localhost:5000/api/products', { headers }),
        fetch('http://localhost:5000/api/products/top-selling', { headers }),
        fetch('http://localhost:5000/api/orders/analytics/sales', { headers })
      ]);

      const handleResponse = async (res, endpoint) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${endpoint}: ${res.status} ${res.statusText} - ${text}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await res.text();
          throw new Error(`${endpoint}: Expected JSON, got ${contentType} - ${text.slice(0, 100)}`);
        }
        return res.json();
      };

      const [ordersData, productsData, topSellingData, analyticsData] = await Promise.all([
        handleResponse(ordersRes, 'Orders API'),
        handleResponse(productsRes, 'Products API'), 
        handleResponse(topSellingRes, 'Top Selling API'),
        handleResponse(analyticsRes, 'Analytics API')
      ]);

      setOrders(ordersData || []);
      setProducts(productsData || []);
      setTopSelling(topSellingData || []);
      setSalesAnalytics(analyticsData || null);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Professional PDF Generation Function
  const generateProfessionalPDF = async (reportType) => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Colors
      const primaryColor = [79, 70, 229]; // Indigo
      const secondaryColor = [107, 114, 128]; // Gray
      const accentColor = [16, 185, 129]; // Green
      
      let yPosition = 20;
      const lineHeight = 7;
      const sectionSpacing = 15;
      
      // Header with company branding
      const addHeader = () => {
        // Header background
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        // Company name/logo area
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analytics Dashboard', 20, 25);
        
        // Report title
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const reportTitles = {
          daily: 'Daily Revenue Report',
          monthly: 'Monthly Revenue Report',
          inventory: 'Inventory Status Report',
          performance: 'Top Performance Report'
        };
        pdf.text(reportTitles[reportType] || 'Business Report', pageWidth - 20, 25, { align: 'right' });
        
        // Date and time
        pdf.setFontSize(10);
        const now = new Date().toLocaleString();
        pdf.text(`Generated: ${now}`, pageWidth - 20, 32, { align: 'right' });
        
        return 50; // Return Y position after header
      };
      
      // Add section title
      const addSectionTitle = (title, y) => {
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 20, y);
        
        // Underline
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setLineWidth(0.5);
        pdf.line(20, y + 2, pageWidth - 20, y + 2);
        
        return y + 10;
      };
      
      // Add key-value pair
      const addKeyValue = (key, value, y, isHighlight = false) => {
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${key}:`, 25, y);
        
        if (isHighlight) {
          pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
        }
        
        pdf.text(value.toString(), 100, y);
        return y + lineHeight;
      };
      
      // Add table
      const addTable = (headers, rows, startY) => {
        const colWidth = (pageWidth - 40) / headers.length;
        let y = startY;
        
        // Table headers
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, y - 5, pageWidth - 40, 10, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        
        headers.forEach((header, index) => {
          pdf.text(header, 25 + (index * colWidth), y);
        });
        
        y += 10;
        
        // Table rows
        pdf.setFont('helvetica', 'normal');
        rows.forEach((row, rowIndex) => {
          if (y > pageHeight - 30) {
            pdf.addPage();
            y = addHeader();
          }
          
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(20, y - 5, pageWidth - 40, 8, 'F');
          }
          
          row.forEach((cell, cellIndex) => {
            pdf.text(cell.toString(), 25 + (cellIndex * colWidth), y);
          });
          
          y += 8;
        });
        
        return y + 5;
      };
      
      // Generate specific reports
      yPosition = addHeader();
      
      if (reportType === 'daily') {
        const dailySales = salesAnalytics?.dailySales || earningsEligibleOrders
          .filter(o => o.createdAt?.split('T')[0] === today)
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          
        const yesterdaySales = salesAnalytics?.yesterdaySales || earningsEligibleOrders
          .filter(o => o.createdAt?.split('T')[0] === yesterday)
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          
        const todayOrders = orders.filter(o => o.createdAt?.split('T')[0] === today);
        const salesGrowth = yesterdaySales > 0 ? ((dailySales - yesterdaySales) / yesterdaySales * 100) : 0;
        
        yPosition = addSectionTitle('Daily Revenue Summary', yPosition);
        
        yPosition = addKeyValue('Report Date', today, yPosition, true);
        yPosition = addKeyValue('Total Revenue', `$${dailySales.toLocaleString()}`, yPosition, true);
        yPosition = addKeyValue('Yesterday Revenue', `$${yesterdaySales.toLocaleString()}`, yPosition);
        yPosition = addKeyValue('Growth', `${salesGrowth >= 0 ? '+' : ''}${salesGrowth.toFixed(1)}%`, yPosition, salesGrowth >= 0);
        yPosition = addKeyValue('Total Orders Today', todayOrders.length, yPosition);
        yPosition = addKeyValue('Revenue Eligible Orders', earningsEligibleOrders.filter(o => o.createdAt?.split('T')[0] === today).length, yPosition);
        
        yPosition += sectionSpacing;
        yPosition = addSectionTitle('Revenue Recognition Method', yPosition);
        
        const cardOrders = todayOrders.filter(o => ['card', 'paypal', 'apple'].includes(o.paymentMethod));
        const codOrders = todayOrders.filter(o => o.paymentMethod === 'cod');
        const cardEarnings = cardOrders.filter(shouldCountInEarnings).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const codEarnings = codOrders.filter(shouldCountInEarnings).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        
        yPosition = addKeyValue('Card/Digital Payments', `${cardOrders.length} orders - $${cardEarnings.toLocaleString()} (Immediate)`, yPosition);
        yPosition = addKeyValue('Cash on Delivery', `${codOrders.length} orders - $${codEarnings.toLocaleString()} (On Delivery Only)`, yPosition);
        
        if (todayOrders.length > 0) {
          yPosition += sectionSpacing;
          yPosition = addSectionTitle("Today's Order Details", yPosition);
          
          const headers = ['Order ID', 'Customer', 'Amount', 'Payment Method', 'Status', 'Revenue Counted'];
          const rows = todayOrders.slice(0, 15).map(order => [
            order._id?.slice(-6) || 'N/A',
            order.customerName || 'N/A',
            `$${order.totalAmount?.toLocaleString() || '0'}`,
            order.paymentMethod || 'N/A',
            order.orderStatus || 'N/A',
            shouldCountInEarnings(order) ? 'Yes' : 'No'
          ]);
          
          yPosition = addTable(headers, rows, yPosition);
        }
        
      } else if (reportType === 'monthly') {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySales = salesAnalytics?.monthlySales || earningsEligibleOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return (
              orderDate.getMonth() === currentMonth &&
              orderDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          
        const monthlyOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });
        
        yPosition = addSectionTitle('Monthly Revenue Summary', yPosition);
        
        yPosition = addKeyValue('Report Period', new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), yPosition, true);
        yPosition = addKeyValue('Total Revenue', `$${monthlySales.toLocaleString()}`, yPosition, true);
        yPosition = addKeyValue('Total Orders', monthlyOrders.length, yPosition);
        yPosition = addKeyValue('Revenue Eligible Orders', earningsEligibleOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        }).length, yPosition);
        yPosition = addKeyValue('Average Order Value', `$${monthlyOrders.length > 0 ? (monthlySales / monthlyOrders.length).toFixed(2) : '0'}`, yPosition);
        
        yPosition += sectionSpacing;
        yPosition = addSectionTitle('Monthly Breakdown by Payment Method', yPosition);
        
        const monthlyCardOrders = monthlyOrders.filter(o => ['card', 'paypal', 'apple'].includes(o.paymentMethod));
        const monthlyCodOrders = monthlyOrders.filter(o => o.paymentMethod === 'cod');
        const monthlyCardEarnings = monthlyCardOrders.filter(shouldCountInEarnings).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const monthlyCodEarnings = monthlyCodOrders.filter(shouldCountInEarnings).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        
        yPosition = addKeyValue('Card/Digital Payments', `${monthlyCardOrders.length} orders - $${monthlyCardEarnings.toLocaleString()}`, yPosition);
        yPosition = addKeyValue('Cash on Delivery', `${monthlyCodOrders.length} orders - $${monthlyCodEarnings.toLocaleString()}`, yPosition);
        
      } else if (reportType === 'inventory') {
        const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0);
        const outOfStockProducts = products.filter(p => p.stock === 0);
        const healthyStockProducts = products.filter(p => p.stock >= 10);
        
        yPosition = addSectionTitle('Inventory Overview', yPosition);
        
        yPosition = addKeyValue('Total Products', products.length, yPosition, true);
        yPosition = addKeyValue('Healthy Stock (≥10 units)', healthyStockProducts.length, yPosition);
        yPosition = addKeyValue('Low Stock (1-9 units)', lowStockProducts.length, yPosition);
        yPosition = addKeyValue('Out of Stock', outOfStockProducts.length, yPosition, outOfStockProducts.length > 0);
        
        if (outOfStockProducts.length > 0) {
          yPosition += sectionSpacing;
          yPosition = addSectionTitle('OUT OF STOCK - IMMEDIATE ATTENTION REQUIRED', yPosition);
          
          const headers = ['Product Name', 'Category', 'Stock Level', 'Status'];
          const rows = outOfStockProducts.map(product => [
            product.productName || 'N/A',
            product.category || 'N/A',
            '0',
            'OUT OF STOCK'
          ]);
          
          yPosition = addTable(headers, rows, yPosition);
        }
        
        if (lowStockProducts.length > 0) {
          yPosition += sectionSpacing;
          yPosition = addSectionTitle('LOW STOCK - REORDER RECOMMENDED', yPosition);
          
          const headers = ['Product Name', 'Category', 'Current Stock', 'Status'];
          const rows = lowStockProducts.sort((a, b) => a.stock - b.stock).map(product => [
            product.productName || 'N/A',
            product.category || 'N/A',
            product.stock.toString(),
            'LOW STOCK'
          ]);
          
          yPosition = addTable(headers, rows, yPosition);
        }
        
        if (healthyStockProducts.length > 0) {
          yPosition += sectionSpacing;
          yPosition = addSectionTitle('Healthy Stock Levels', yPosition);
          
          const headers = ['Product Name', 'Category', 'Current Stock', 'Status'];
          const rows = healthyStockProducts.slice(0, 20).map(product => [
            product.productName || 'N/A',
            product.category || 'N/A',
            product.stock.toString(),
            'HEALTHY'
          ]);
          
          yPosition = addTable(headers, rows, yPosition);
        }
        
      } else if (reportType === 'performance') {
        yPosition = addSectionTitle('Top Performing Products', yPosition);
        
        if (topSelling.length > 0) {
          const totalRevenue = topSelling.reduce((sum, p) => sum + (p.revenue || 0), 0);
          const totalUnitsSold = topSelling.reduce((sum, p) => sum + (p.quantitySold || 0), 0);
          
          yPosition = addKeyValue('Total Products Analyzed', topSelling.length, yPosition);
          yPosition = addKeyValue('Total Revenue from Top Products', `$${totalRevenue.toFixed(2)}`, yPosition, true);
          yPosition = addKeyValue('Total Units Sold', totalUnitsSold, yPosition);
          yPosition = addKeyValue('Average Revenue per Product', `$${topSelling.length > 0 ? (totalRevenue / topSelling.length).toFixed(2) : '0'}`, yPosition);
          
          yPosition += sectionSpacing;
          yPosition = addSectionTitle('Top Performers Ranking', yPosition);
          
          const headers = ['Rank', 'Product Name', 'Units Sold', 'Revenue', 'Avg. Price'];
          const rows = topSelling.map((product, index) => [
            `#${index + 1}`,
            product.productName || 'N/A',
            product.quantitySold?.toString() || '0',
            `$${product.revenue?.toFixed(2) || '0'}`,
            `$${product.quantitySold > 0 ? (product.revenue / product.quantitySold).toFixed(2) : '0'}`
          ]);
          
          yPosition = addTable(headers, rows, yPosition);
        } else {
          yPosition = addKeyValue('Status', 'No performance data available', yPosition);
        }
      }
      
      // Footer
      const addFooter = () => {
        pdf.setFontSize(8);
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.text('Generated by Analytics Dashboard', 20, pageHeight - 10);
        pdf.text(`Page 1 of 1`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        
        // Revenue recognition note
        pdf.setFontSize(7);
        pdf.text('Revenue Recognition: Card/PayPal/Apple payments counted immediately | COD payments counted on delivery only', 20, pageHeight - 5);
      };
      
      addFooter();
      
      // Save the PDF
      const fileNames = {
        daily: `Daily_Revenue_Report_${today}.pdf`,
        monthly: `Monthly_Revenue_Report_${new Date().getFullYear()}-${new Date().getMonth() + 1}.pdf`,
        inventory: `Inventory_Status_Report_${today}.pdf`,
        performance: `Top_Performance_Report_${today}.pdf`
      };
      
      pdf.save(fileNames[reportType] || 'Business_Report.pdf');
      
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-blue-500 border-b-transparent animate-pulse mx-auto"></div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-xl font-semibold text-white">Loading Analytics Dashboard</p>
            <p className="text-purple-200 mt-2">Preparing your business insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-300/20 p-10 max-w-2xl w-full">
          <div className="flex items-center text-red-100 mb-6">
            <div className="p-3 bg-red-500/20 rounded-full mr-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">System Connection Error</h2>
              <p className="text-red-200 text-sm">Unable to connect to backend services</p>
            </div>
          </div>
          <p className="text-red-100 mb-6 text-lg">{error}</p>
          <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-yellow-100 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              System Diagnostics
            </h3>
            <ul className="text-yellow-200 space-y-2 text-sm">
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Verify server status on port 5000</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Check MongoDB connection</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Validate API endpoints</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Review browser console</li>
            </ul>
          </div>
          <button 
            onClick={() => {setLoading(true); fetchData();}}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition duration-300 flex items-center justify-center font-semibold shadow-lg"
          >
            <RefreshCcw className="h-5 w-5 mr-3" />
            Reconnect to System
          </button>
        </div>
      </div>
    );
  }

  // Helper function to determine if order should count towards earnings (matches backend logic)
  const shouldCountInEarnings = (order) => {
    // Card/PayPal/Apple payments: Count immediately when order is placed (paymentStatus is 'Completed')
    if (['card', 'paypal', 'apple'].includes(order.paymentMethod)) {
      return order.paymentStatus === 'Completed';
    }
    
    // COD payments: Only count when delivered (both orderStatus 'Delivered' AND paymentStatus 'Completed')
    if (order.paymentMethod === 'cod') {
      return order.orderStatus === 'Delivered' && order.paymentStatus === 'Completed';
    }
    
    return false;
  };

  // CORRECTED EARNINGS CALCULATIONS - Use proper logic based on payment method
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Filter orders that should count towards earnings based on payment method
  const earningsEligibleOrders = orders.filter(shouldCountInEarnings);

  // Use analytics data if available, otherwise calculate from orders
  const dailySales = salesAnalytics?.dailySales || earningsEligibleOrders
    .filter(o => o.createdAt?.split('T')[0] === today)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const yesterdaySales = salesAnalytics?.yesterdaySales || earningsEligibleOrders
    .filter(o => o.createdAt?.split('T')[0] === yesterday)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const monthlySales = salesAnalytics?.monthlySales || earningsEligibleOrders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalRevenue = salesAnalytics?.totalRevenue || earningsEligibleOrders
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Order status counts
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const shippedOrders = orders.filter(o => o.orderStatus === 'Shipped').length;
  const deliveredOrdersCount = orders.filter(o => o.orderStatus === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;
  
  const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const healthyStockProducts = products.filter(p => p.stock >= 10);

  const salesGrowth = yesterdaySales > 0 ? ((dailySales - yesterdaySales) / yesterdaySales * 100) : 0;

  // Enhanced Chart data - Use earnings eligible orders for revenue calculations
  const daysBack = parseInt(selectedTimeFrame);
  const lastNDays = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    lastNDays.push(date.toISOString().split('T')[0]);
  }

  const dailySalesData = lastNDays.map(d =>
    earningsEligibleOrders
      .filter(o => o.createdAt?.split('T')[0] === d)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  );

  const salesChartData = {
    labels: lastNDays.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Revenue (Card: Immediate | COD: On Delivery)',
        data: dailySalesData,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 2,
        borderWidth: 3,
      },
    ],
  };

const salesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: false 
    },
    title: { 
      display: false 
    },
    tooltip: {
      callbacks: {
        title: function(context) {
          return `${context[0].label} - Smart Revenue Recognition`;
        },
        afterBody: function() {
          return 'Card/PayPal/Apple: Counted immediately\nCOD: Counted on delivery only';
        }
      }
    }
  },
  scales: {
    y: { 
      beginAtZero: true,
      grid: { 
        color: 'rgba(0,0,0,0.05)',
        borderDash: [5, 5]
      },
      border: { display: false },
      ticks: {
        callback: function(value) {
          return '$' + value.toLocaleString(); // Added closing single quote
        },
        color: 'rgb(107, 114, 128)',
        font: { size: 12 }
      }
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: 'rgb(107, 114, 128)',
        font: { size: 12 }
      }
    }
  },
};

  // Category distribution
  const categoryData = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)', 
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)', 
        'rgba(139, 92, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(6, 182, 212, 0.8)'
      ],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  // Stock status data
  const stockStatusData = {
    labels: ['Healthy Stock', 'Low Stock', 'Out of Stock'],
    datasets: [{
      data: [healthyStockProducts.length, lowStockProducts.length, outOfStockProducts.length],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 0,
    }]
  };

  // Filter products based on stock filter
  const getFilteredProducts = () => {
    let filtered = [...products];
    switch(stockFilter) {
      case 'low':
        filtered = lowStockProducts;
        break;
      case 'out':
        filtered = outOfStockProducts;
        break;
      case 'healthy':
        filtered = healthyStockProducts;
        break;
      default:
        break;
    }
    return filtered.sort((a, b) => a.stock - b.stock);
  };

  const filteredProducts = getFilteredProducts();

  // Payment method breakdown for better insights
  const cardOrders = orders.filter(o => ['card', 'paypal', 'apple'].includes(o.paymentMethod));
  const codOrders = orders.filter(o => o.paymentMethod === 'cod');
  const cardEarnings = cardOrders.filter(shouldCountInEarnings).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const codEarnings = codOrders.filter(shouldCountInEarnings).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div ref={dashboardRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-500 mt-1">Smart revenue recognition • Card: Immediate • COD: On delivery</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Frame Selector */}
              <div className="relative">
                <select 
                  value={selectedTimeFrame}
                  onChange={(e) => setSelectedTimeFrame(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-6 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button 
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Syncing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Revenue Explanation Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Smart Revenue Recognition System</h3>
              <p className="text-blue-700 text-sm mt-1">
                <strong>Card/PayPal/Apple:</strong> Revenue counted immediately when order is placed • 
                <strong>Cash on Delivery (COD):</strong> Revenue counted only when order is delivered
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">${cardEarnings.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
                <Truck className="h-4 w-4 text-orange-600" />
                <span className="text-orange-700 font-medium">${codEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-gray-500 font-medium">TOTAL REVENUE</div>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Smart recognition active</span>
            </div>
          </div>

          {/* Daily Sales Card */}
          <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${dailySales.toLocaleString()}</div>
                <div className="text-xs text-gray-500 font-medium">TODAY'S SALES</div>
              </div>
            </div>
            <div className="flex items-center text-sm">
              {salesGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+{salesGrowth.toFixed(1)}% from yesterday</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-600 font-medium">{salesGrowth.toFixed(1)}% from yesterday</span>
                </>
              )}
            </div>
          </div>

          {/* Orders Card - Enhanced with all statuses */}
          <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</div>
                <div className="text-xs text-gray-500 font-medium">TOTAL ORDERS</div>
              </div>
            </div>
            <div className="flex items-center text-xs space-x-3 flex-wrap">
              <span className="text-green-600 font-medium">{deliveredOrdersCount} delivered</span>
              <span className="text-blue-600 font-medium">{shippedOrders} shipped</span>
              <span className="text-yellow-600 font-medium">{pendingOrders} pending</span>
              {cancelledOrders > 0 && (
                <span className="text-red-600 font-medium">{cancelledOrders} cancelled</span>
              )}
            </div>
          </div>

          {/* Inventory Card */}
          <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                <div className="text-xs text-gray-500 font-medium">PRODUCTS</div>
              </div>
            </div>
            <div className="flex items-center text-sm space-x-4">
              <span className="text-red-600 font-medium">{outOfStockProducts.length} out of stock</span>
              <span className="text-yellow-600 font-medium">{lowStockProducts.length} low stock</span>
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Payments Breakdown */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Card/Digital Payments</h3>
                <p className="text-green-700 text-sm">Revenue counted immediately</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-900">{cardOrders.length}</div>
                <div className="text-xs text-green-600">Total Orders</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-900">${cardEarnings.toLocaleString()}</div>
                <div className="text-xs text-green-600">Revenue Earned</div>
              </div>
            </div>
          </div>

          {/* COD Payments Breakdown */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Cash on Delivery</h3>
                <p className="text-orange-700 text-sm">Revenue counted on delivery only</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/60 rounded-xl p-3">
                <div className="text-lg font-bold text-orange-900">{codOrders.length}</div>
                <div className="text-xs text-orange-600">Total Orders</div>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <div className="text-lg font-bold text-orange-900">{codOrders.filter(o => o.orderStatus === 'Delivered').length}</div>
                <div className="text-xs text-orange-600">Delivered</div>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <div className="text-lg font-bold text-orange-900">${codEarnings.toLocaleString()}</div>
                <div className="text-xs text-orange-600">Revenue Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Trend Chart */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Sales Performance</h2>
                  <p className="text-gray-500 mt-1">Smart revenue recognition by payment method</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8" style={{ height: '400px' }}>
              <Line data={salesChartData} options={salesChartOptions} />
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Categories</h3>
                  <p className="text-gray-500 text-sm">Product distribution</p>
                </div>
                <Target className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="p-6" style={{ height: '300px' }}>
              <Doughnut 
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12 }
                      }
                    }
                  },
                  cutout: '60%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Reports & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock Report */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Inventory Status</h3>
                  <p className="text-gray-500 text-sm">Current stock levels</p>
                </div>
                <Package className="h-6 w-6 text-purple-500" />
              </div>
              
              {/* Stock Filter */}
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All', count: products.length },
                  { key: 'healthy', label: 'Healthy', count: healthyStockProducts.length },
                  { key: 'low', label: 'Low Stock', count: lowStockProducts.length },
                  { key: 'out', label: 'Out of Stock', count: outOfStockProducts.length }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStockFilter(filter.key)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-200 ${
                      stockFilter === filter.key 
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {filteredProducts.length > 0 ? (
                <div className="overflow-y-auto max-h-96 space-y-3">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-gray-100/50 transition-colors duration-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{product.productName}</h4>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{product.stock}</div>
                          <div className="text-xs text-gray-500">units</div>
                        </div>
                        <div>
                          {product.stock === 0 ? (
                            <div className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                              Out of Stock
                            </div>
                          ) : product.stock < 10 ? (
                            <div className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                              Low Stock
                            </div>
                          ) : (
                            <div className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                              Healthy
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No products in this category</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100/50">
              <button
                onClick={() => generateProfessionalPDF('inventory')}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Inventory Report
              </button>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Top Performers</h3>
                  <p className="text-gray-500 text-sm">Best selling products</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="p-6">
              {topSelling.length > 0 ? (
                <div className="overflow-y-auto max-h-96 space-y-4">
                  {topSelling.map((product, index) => (
                    <div key={product._id} className="flex items-center p-4 bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl border border-gray-100/50 hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group">
                      {/* Ranking Badge */}
                      <div className="flex-shrink-0 mr-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          'bg-gradient-to-br from-indigo-400 to-indigo-600'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
                          {product.productName}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {product.quantitySold} units sold
                          </span>
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-sm font-bold text-green-600">
                              {product.revenue?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Indicator */}
                      <div className="flex-shrink-0 ml-4">
                        <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No sales data available</p>
                  <p className="text-gray-400 text-sm mt-1">Complete some orders to see top performers</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100/50">
              <button
                onClick={() => generateProfessionalPDF('performance')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Performance Report
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Sales Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Sales Report */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Daily Revenue</h3>
                  <p className="text-gray-500 text-sm">Smart recognition active</p>
                </div>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  ${dailySales.toLocaleString()}
                </div>
                <p className="text-gray-500 text-sm">{today}</p>
                <div className="flex items-center justify-center mt-2">
                  {salesGrowth >= 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 text-sm font-medium">+{salesGrowth.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-600 text-sm font-medium">{salesGrowth.toFixed(1)}%</span>
                    </>
                  )}
                  <span className="text-gray-500 text-sm ml-1">vs yesterday</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  ({earningsEligibleOrders.filter(o => o.createdAt?.split('T')[0] === today).length} revenue-eligible orders today)
                </div>
              </div>
              
              <button
                onClick={() => generateProfessionalPDF('daily')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Daily Report
              </button>
            </div>
          </div>

          {/* Monthly Sales Report */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monthly Revenue</h3>
                  <p className="text-gray-500 text-sm">This month's earnings</p>
                </div>
                <Activity className="h-5 w-5 text-green-500" />
              </div>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  ${monthlySales.toLocaleString()}
                </div>
                <p className="text-gray-500 text-sm">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  ({earningsEligibleOrders.filter(o => {
                    const orderDate = new Date(o.createdAt);
                    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                  }).length} revenue-eligible orders this month)
                </div>
              </div>
              
              <button
                onClick={() => generateProfessionalPDF('monthly')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Monthly Report
              </button>
            </div>
          </div>

          {/* Order Status Overview */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Order Pipeline</h3>
                  <p className="text-gray-500 text-sm">Current order statuses</p>
                </div>
                <ShoppingBag className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800">Delivered</span>
                  </div>
                  <div className="text-green-900 font-bold">{deliveredOrdersCount}</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-800">Shipped</span>
                  </div>
                  <div className="text-blue-900 font-bold">{shippedOrders}</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-yellow-800">Pending</span>
                  </div>
                  <div className="text-yellow-900 font-bold">{pendingOrders}</div>
                </div>
                
                {cancelledOrders > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-800">Cancelled</span>
                    </div>
                    <div className="text-red-900 font-bold">{cancelledOrders}</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="text-center text-xs text-gray-500">
                  <strong>Revenue Recognition:</strong><br />
                  Card payments: Immediate • COD: On delivery only
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Smart Revenue Analytics Hub</h2>
              <p className="text-white/80 text-lg">
                Advanced business intelligence with payment-method-aware revenue recognition
              </p>
              <p className="text-white/60 text-sm mt-1">
                Card/Digital: ${cardEarnings.toLocaleString()} earned immediately • COD: ${codEarnings.toLocaleString()} earned on delivery
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => generateProfessionalPDF('complete')}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition-all duration-200 flex items-center font-semibold border border-white/30"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Full Report
              </button>
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-2xl hover:bg-gray-50 transition-all duration-200 flex items-center font-semibold shadow-lg">
                <Eye className="h-5 w-5 mr-2" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDashboard;