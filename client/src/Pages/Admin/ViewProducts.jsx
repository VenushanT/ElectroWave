import Sidebar from "../../components/Admin/Sidebar";
import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Eye, Edit, Trash2, X, ChevronLeft, ChevronRight, 
  Search, Filter, Package, TrendingUp, AlertTriangle, 
  XCircle, Star, Calendar, DollarSign, Tag, Archive,
  Loader, RefreshCw, Download, Upload
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Custom hooks for better state management
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, setProducts, loading, error, fetchProducts };
};

const useModal = (initialState = null) => {
  const [isOpen, setIsOpen] = useState(!!initialState);
  const [data, setData] = useState(initialState);

  const open = useCallback((newData) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close };
};

const ViewProducts = () => {
  const { products, setProducts, loading, error, fetchProducts } = useProducts();
  const productModal = useModal();
  const deleteModal = useModal();
  const navigate = useNavigate();
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    sortBy: "name",
    sortOrder: "asc"
  });
  
  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Low stock alert state
  const [lowStockAlert, setLowStockAlert] = useState(false);

  // Initialize data
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Check low stock on products update
  useEffect(() => {
    const hasLowStock = products.some(product => product.stock > 0 && product.stock <= 10);
    setLowStockAlert(hasLowStock);
  }, [products]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        if (productModal.isOpen) productModal.close();
        if (deleteModal.isOpen) deleteModal.close();
      }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fetchProducts();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [productModal, deleteModal, fetchProducts]);

  // Enhanced delete handler with optimistic updates
  const handleDelete = async (id) => {
    let originalProducts = [...products];
    try {
      setProducts(products.filter(p => p._id !== id));
      deleteModal.close();
      await axios.delete(`http://localhost:5000/api/products/${id}`);
    } catch (error) {
      setProducts(originalProducts);
      console.error("Error deleting product:", error);
    }
  };

  // Advanced filtering and sorting
  const processedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
                          product.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
                          product.category.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = !filters.category || product.category === filters.category;
      
      const getStatus = (stock) => {
        if (stock === 0) return "Out of Stock";
        if (stock <= 5) return "Low Stock";
        return "In Stock";
      };
      
      const matchesStatus = !filters.status || getStatus(product.stock) === filters.status;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [products, filters]);

  // Statistics
  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.stock > 5).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  }), [products]);

  // Get unique categories
  const categories = useMemo(() => 
    [...new Set(products.map(p => p.category))].sort(),
    [products]
  );

  const openProductDetails = (product, imageIndex = 0) => {
    setCurrentImageIndex(imageIndex);
    productModal.open(product);
  };

  const nextImage = () => {
    if (!productModal.data?.images?.length) return;
    setCurrentImageIndex(prev => (prev + 1) % productModal.data.images.length);
  };

  const prevImage = () => {
    if (!productModal.data?.images?.length) return;
    setCurrentImageIndex(prev => 
      (prev - 1 + productModal.data.images.length) % productModal.data.images.length
    );
  };

  const getStatusConfig = (stock) => {
    if (stock === 0) {
      return { 
        label: "Out of Stock", 
        className: "bg-gradient-to-r from-red-500 to-red-600 text-white",
        icon: XCircle,
        priority: 3
      };
    }
    if (stock <= 5) {
      return { 
        label: "Low Stock", 
        className: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
        icon: AlertTriangle,
        priority: 2
      };
    }
    return { 
      label: "In Stock", 
      className: "bg-gradient-to-r from-green-500 to-green-600 text-white",
      icon: Package,
      priority: 1
    };
  };

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
            {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white/10 rounded-full"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Inventory</h1>
            <p className="text-gray-600">Manage your product catalog with advanced controls</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh (Ctrl+R)"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => navigate("/add-product")}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Upload className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {lowStockAlert && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="text-yellow-700 font-medium">Low Stock Alert: Some products have 10 or fewer units remaining!</p>
          </div>
        )}

        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.total}
            icon={Package}
            gradient="from-blue-500 via-blue-600 to-blue-700"
          />
          <StatCard
            title="In Stock"
            value={stats.inStock}
            icon={TrendingUp}
            gradient="from-green-500 via-green-600 to-green-700"
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStock}
            icon={AlertTriangle}
            gradient="from-yellow-500 via-yellow-600 to-orange-500"
          />
          <StatCard
            title="Out of Stock"
            value={stats.outOfStock}
            icon={XCircle}
            gradient="from-red-500 via-red-600 to-red-700"
          />
          <StatCard
            title="Total Value"
            value={`$${stats.totalValue.toLocaleString()}`}
            icon={DollarSign}
            gradient="from-purple-500 via-purple-600 to-purple-700"
            subtitle="Inventory Worth"
          />
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filters & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          
          {Object.values(filters).some(v => v !== "" && v !== "name" && v !== "asc") && (
            <button
              onClick={() => setFilters({ search: "", category: "", status: "", sortBy: "name", sortOrder: "asc" })}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Premium Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Brand</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Stock</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedProducts.length > 0 ? (
                  processedProducts.map((product, index) => {
                    const statusConfig = getStatusConfig(product.stock);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr 
                        key={product._id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <img
                                src={product.images?.[0] ? `http://localhost:5000/uploads/${product.images[0]}` : "/placeholder.jpg"}
                                alt={product.productName}
                                className="w-14 h-14 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
                                onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                                onClick={() => openProductDetails(product, 0)}
                              />
                              {product.images?.length > 1 && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                  {product.images.length}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                                  onClick={() => openProductDetails(product)}>
                                {product.productName}
                              </h4>
                              <p className="text-sm text-gray-500">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{product.category}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{product.brand}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">{product.stock}</span>
                          <span className="text-gray-500 text-sm ml-1">units</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.className}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openProductDetails(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/update-product/${product._id}`)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteModal.open(product._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No products found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your filters or add a new product</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ultra-Premium Product Details Modal */}
        {productModal.isOpen && productModal.data && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={(e) => e.target === e.currentTarget && productModal.close()}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scaleIn">
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <button
                  onClick={productModal.close}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all hover:shadow-xl"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <div className="pr-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{productModal.data.productName}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {productModal.data.category}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {productModal.data.brand}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col lg:flex-row max-h-[calc(90vh-100px)]">
                {/* Image Gallery */}
                <div className="lg:w-1/2 bg-gray-50 relative flex items-center justify-center min-h-80">
                  {productModal.data.images && productModal.data.images.length > 0 ? (
                    <>
                      <img
                        src={`http://localhost:5000/uploads/${productModal.data.images[currentImageIndex]}`}
                        alt={productModal.data.productName}
                        className="max-w-full max-h-full object-contain p-4"
                        onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                      />
                      
                      {productModal.data.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/20 backdrop-blur-sm hover:bg-black/40 rounded-full text-white transition-all"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/20 backdrop-blur-sm hover:bg-black/40 rounded-full text-white transition-all"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          
                          {/* Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {productModal.data.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                  index === currentImageIndex 
                                    ? 'bg-white shadow-lg scale-125' 
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 p-8">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No images available</p>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="lg:w-1/2 p-8 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Price and Status */}
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-green-600">
                        ${productModal.data.price.toFixed(2)}
                      </div>
                      {(() => {
                        const statusConfig = getStatusConfig(productModal.data.stock);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.className}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Description */}
                    {productModal.data.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {productModal.data.description}
                        </p>
                      </div>
                    )}

                    {/* Product Details Grid */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500">Category</span>
                          </div>
                          <p className="text-gray-900 font-semibold">{productModal.data.category}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500">Brand</span>
                          </div>
                          <p className="text-gray-900 font-semibold">{productModal.data.brand}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500">Stock Quantity</span>
                          </div>
                          <p className="text-gray-900 font-semibold">{productModal.data.stock} units</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500">Total Value</span>
                          </div>
                          <p className="text-gray-900 font-semibold">
                            ${(productModal.data.price * productModal.data.stock).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/update-product/${productModal.data._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Product
                      </button>
                      <button
                        onClick={() => {
                          deleteModal.open(productModal.data._id);
                          productModal.close();
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ultra-Premium Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={(e) => e.target === e.currentTarget && deleteModal.close()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-200">
                <button
                  onClick={deleteModal.close}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all"
                  title="Close (ESC)"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
                    <p className="text-red-600 text-sm">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    Are you absolutely sure you want to delete this product? This will permanently remove 
                    the product from your inventory and cannot be reversed.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={deleteModal.close}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteModal.data)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium CSS Animations and Styles */}
      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
          }
          to { 
            opacity: 1; 
          }
        }
        
        @keyframes scaleIn {
          from { 
            transform: scale(0.95) translateY(10px); 
            opacity: 0; 
          }
          to { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-fadeIn { 
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        
        .animate-scaleIn { 
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Glass morphism effect */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* Smooth transitions for all interactive elements */
        button, input, select, .transition-all {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Focus styles */
        button:focus,
        input:focus,
        select:focus {
          outline: none;
          ring: 2px;
          ring-color: rgb(59 130 246 / 0.5);
          ring-offset: 2px;
        }

        /* Hover effects */
        .hover-lift:hover {
          transform: translateY(-2px);
        }

        /* Loading skeleton animation */
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }
        
        .skeleton {
          animation: shimmer 1.2s ease-in-out infinite;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 468px 100%;
        }

        /* Premium shadow effects */
        .shadow-premium {
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .shadow-premium-lg {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Gradient text effects */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Card hover effects */
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Interactive button effects */
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .animate-scaleIn {
            animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .bg-gradient-to-r {
            background: solid !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewProducts;