import Sidebar from "../../components/Admin/Sidebar";
import { useState, useEffect } from "react";
import { 
  ImagePlus, 
  X, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Package,
  DollarSign,
  Hash,
  FileText,
  Tag,
  Layers,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import axios from "axios";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: ""
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});

  const categories = {
    Smartphones: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Huawei", "Oppo", "Vivo", "Sony", "Nokia"],
    Laptops: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "MSI", "Razer", "Toshiba"],
    Audio: ["Sony", "Bose", "JBL", "Sennheiser", "Beats", "Audio-Technica", "Shure", "Marshall", "Skullcandy", "Anker"],
    Cameras: ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic", "Olympus", "Leica", "GoPro", "DJI", "Pentax"],
    Wearables: ["Apple", "Samsung", "Fitbit", "Garmin", "Huawei", "Xiaomi", "Polar", "Fossil", "Withings", "Oura"],
    Gaming: ["Sony", "Microsoft", "Nintendo", "Razer", "Logitech", "Asus", "MSI", "HyperX", "SteelSeries", "Corsair"],
  };

  // Real-time validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'productName':
        if (!value.trim()) return "Product name is required";
        if (value.length < 3) return "Product name must be at least 3 characters";
        if (value.length > 100) return "Product name must be less than 100 characters";
        if (!/^[a-zA-Z0-9\s\-_&().]+$/.test(value)) return "Product name contains invalid characters";
        return "";

      case 'description':
        if (!value.trim()) return "Description is required";
        if (value.length < 10) return "Description must be at least 10 characters";
        if (value.length > 1000) return "Description must be less than 1000 characters";
        return "";

      case 'price':
        if (!value) return "Price is required";
        const priceNum = parseFloat(value);
        if (isNaN(priceNum)) return "Price must be a valid number";
        if (priceNum <= 0) return "Price must be greater than 0";
        if (priceNum > 999999.99) return "Price must be less than $999,999.99";
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Price can have maximum 2 decimal places";
        return "";

      case 'stock':
        if (!value) return "Stock quantity is required";
        const stockNum = parseInt(value);
        if (isNaN(stockNum)) return "Stock must be a valid number";
        if (stockNum < 0) return "Stock cannot be negative";
        if (stockNum > 99999) return "Stock must be less than 100,000";
        if (!Number.isInteger(stockNum)) return "Stock must be a whole number";
        return "";

      case 'category':
        if (!value) return "Category is required";
        if (!Object.keys(categories).includes(value)) return "Please select a valid category";
        return "";

      case 'brand':
        if (!value) return "Brand is required";
        if (formData.category && !categories[formData.category]?.includes(value)) {
          return "Please select a valid brand for this category";
        }
        return "";

      default:
        return "";
    }
  };

  // Handle input changes with real-time validation
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Set validation status
    setValidationStatus(prev => ({
      ...prev,
      [name]: error ? 'error' : (value ? 'success' : 'default')
    }));

    // Clear brand if category changes
    if (name === 'category') {
      setFormData(prev => ({ ...prev, brand: "" }));
      setErrors(prev => ({ ...prev, brand: "" }));
      setValidationStatus(prev => ({ ...prev, brand: 'default' }));
    }

    // Clear success message when user starts typing
    if (success) setSuccess("");
  };

  // Validate images
  const validateImages = (files) => {
    if (files.length === 0) return "At least 1 image is required";
    if (files.length > 5) return "Maximum 5 images allowed";
    
    for (let file of files) {
      if (!file.type.startsWith('image/')) return "Only image files are allowed";
      if (file.size > 5 * 1024 * 1024) return "Each image must be less than 5MB";
    }
    
    return "";
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageError = validateImages(files);
    
    if (imageError) {
      setErrors(prev => ({ ...prev, images: imageError }));
      setValidationStatus(prev => ({ ...prev, images: 'error' }));
      return;
    }

    setImages(files);
    setErrors(prev => ({ ...prev, images: "" }));
    setValidationStatus(prev => ({ ...prev, images: 'success' }));

    // Create previews
    const imagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) // Size in MB
    }));
    setPreviews(imagePreviews);
    setTouched(prev => ({ ...prev, images: true }));
  };

  const handleRemoveImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    const newPreviews = previews.filter((_, index) => index !== indexToRemove);
    
    setImages(newImages);
    setPreviews(newPreviews);
    
    const imageError = validateImages(newImages);
    setErrors(prev => ({ ...prev, images: imageError }));
    setValidationStatus(prev => ({ 
      ...prev, 
      images: imageError ? 'error' : (newImages.length > 0 ? 'success' : 'default') 
    }));
  };

  // Check if form is valid
  const isFormValid = () => {
    const requiredFields = ['productName', 'description', 'price', 'category', 'brand', 'stock'];
    const hasAllFields = requiredFields.every(field => formData[field]);
    const hasNoErrors = Object.values(errors).every(error => !error);
    const hasImages = images.length > 0;
    
    return hasAllFields && hasNoErrors && hasImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ['productName', 'description', 'price', 'category', 'brand', 'stock', 'images'];
    const newTouched = {};
    allFields.forEach(field => newTouched[field] = true);
    setTouched(newTouched);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      newErrors[field] = validateField(field, formData[field]);
    });
    newErrors.images = validateImages(images);
    setErrors(newErrors);

    // Check if form is valid
    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    images.forEach((image) => submitData.append('images', image));

    try {
      const response = await axios.post('http://localhost:5000/api/products', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess("Product added successfully!");
      
      // Reset form
      setFormData({
        productName: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        stock: ""
      });
      setImages([]);
      setPreviews([]);
      setErrors({});
      setTouched({});
      setValidationStatus({});
      
      // Clear form input
      document.getElementById("images").value = "";
      
    } catch (error) {
      console.error("Error adding product:", error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.response?.data?.message || "Failed to add product. Please try again." 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get field validation icon
  const getValidationIcon = (fieldName) => {
    if (!touched[fieldName]) return null;
    
    switch (validationStatus[fieldName]) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Get field border class
  const getFieldBorderClass = (fieldName) => {
    if (!touched[fieldName]) return "border-gray-200 focus:border-blue-500";
    
    switch (validationStatus[fieldName]) {
      case 'success':
        return "border-emerald-200 focus:border-emerald-500 bg-emerald-50/30";
      case 'error':
        return "border-red-200 focus:border-red-500 bg-red-50/30";
      default:
        return "border-gray-200 focus:border-blue-500";
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex-1 p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Add New Product
                </h1>
                <p className="text-gray-600 text-lg mt-1">Create and configure your product listing with real-time validation</p>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {(errors.submit || success) && (
            <div className={`mb-8 p-5 rounded-xl border-l-4 shadow-sm animate-in slide-in-from-top-2 duration-300 ${
              errors.submit 
                ? 'bg-red-50 border-red-400 text-red-800' 
                : 'bg-emerald-50 border-emerald-400 text-emerald-800'
            }`}>
              <div className="flex items-center gap-3">
                {errors.submit ? (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                )}
                <span className="font-semibold text-lg">{errors.submit || success}</span>
              </div>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Package className="h-6 w-6" />
                Product Information
              </h2>
              <div className="mt-2 text-blue-100">
                Fill in the details below to create your product listing
              </div>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Product Name */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <FileText className="h-4 w-4" />
                        Product Name
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.productName}
                          onChange={(e) => handleInputChange('productName', e.target.value)}
                          className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 ${getFieldBorderClass('productName')}`}
                          placeholder="Enter a descriptive product name"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          {getValidationIcon('productName')}
                        </div>
                      </div>
                      {touched.productName && errors.productName && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                          <XCircle className="h-4 w-4" />
                          {errors.productName}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Layers className="h-4 w-4" />
                        Description
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 resize-y ${getFieldBorderClass('description')}`}
                          placeholder="Describe your product features, specifications, and benefits"
                          rows="6"
                        />
                        <div className="absolute right-4 top-4">
                          {getValidationIcon('description')}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        {touched.description && errors.description ? (
                          <p className="text-red-600 text-sm flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                            <XCircle className="h-4 w-4" />
                            {errors.description}
                          </p>
                        ) : (
                          <div></div>
                        )}
                        <span className={`text-sm ${formData.description.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                          {formData.description.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Price and Stock Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Price */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                          <DollarSign className="h-4 w-4" />
                          Price (USD)
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 ${getFieldBorderClass('price')}`}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {getValidationIcon('price')}
                          </div>
                        </div>
                        {touched.price && errors.price && (
                          <p className="text-red-600 text-sm mt-2 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                            <XCircle className="h-4 w-4" />
                            {errors.price}
                          </p>
                        )}
                      </div>

                      {/* Stock */}
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                          <Hash className="h-4 w-4" />
                          Stock Quantity
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => handleInputChange('stock', e.target.value)}
                            className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 ${getFieldBorderClass('stock')}`}
                            placeholder="0"
                            min="0"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {getValidationIcon('stock')}
                          </div>
                        </div>
                        {touched.stock && errors.stock && (
                          <p className="text-red-600 text-sm mt-2 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                            <XCircle className="h-4 w-4" />
                            {errors.stock}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Tag className="h-4 w-4" />
                        Category
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 ${getFieldBorderClass('category')}`}
                        >
                          <option value="">Select a category</option>
                          {Object.keys(categories).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          {getValidationIcon('category')}
                        </div>
                      </div>
                      {touched.category && errors.category && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                          <XCircle className="h-4 w-4" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    {/* Brand */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Tag className="h-4 w-4" />
                        Brand
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.brand}
                          onChange={(e) => handleInputChange('brand', e.target.value)}
                          className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${getFieldBorderClass('brand')}`}
                          disabled={!formData.category}
                        >
                          <option value="">
                            {formData.category ? "Select a brand" : "First select a category"}
                          </option>
                          {formData.category && categories[formData.category].map((brandOption) => (
                            <option key={brandOption} value={brandOption}>{brandOption}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          {getValidationIcon('brand')}
                        </div>
                      </div>
                      {touched.brand && errors.brand && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                          <XCircle className="h-4 w-4" />
                          {errors.brand}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="border-t border-gray-100 pt-8">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                    <ImageIcon className="h-4 w-4" />
                    Product Images
                    <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                      id="images"
                    />
                    
                    <div 
                      onClick={() => document.getElementById("images").click()}
                      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer group ${
                        validationStatus.images === 'error' 
                          ? 'border-red-300 bg-red-50' 
                          : validationStatus.images === 'success' 
                            ? 'border-emerald-300 bg-emerald-50' 
                            : 'border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`p-4 rounded-full mb-4 group-hover:scale-105 transition-transform duration-200 ${
                          validationStatus.images === 'error' 
                            ? 'bg-red-500' 
                            : validationStatus.images === 'success' 
                              ? 'bg-emerald-500' 
                              : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                        }`}>
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Upload Product Images</h3>
                        <p className="text-gray-500 mb-4">Drag and drop or click to select high-quality images</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Min: 1 image</span>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">Max: 5 images</span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Max: 5MB each</span>
                        </div>
                      </div>
                    </div>

                    {touched.images && errors.images && (
                      <p className="text-red-600 text-sm mt-3 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                        <XCircle className="h-4 w-4" />
                        {errors.images}
                      </p>
                    )}

                    {/* Image Previews */}
                    {previews.length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-700">
                            {previews.length} image{previews.length > 1 ? 's' : ''} selected
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {previews.map((preview, index) => (
                            <div key={index} className="relative group animate-in fade-in zoom-in duration-300" style={{animationDelay: `${index * 100}ms`}}>
                              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg group-hover:shadow-xl transition-all duration-200 ring-2 ring-emerald-200">
                                <img
                                  src={preview.url}
                                  alt={`Preview ${preview.name}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white p-2 rounded-b-xl">
                                <div className="text-xs truncate font-medium">{preview.name}</div>
                                <div className="text-xs text-gray-300">{preview.size} MB</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t border-gray-100 pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid()}
                    className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ${
                      isFormValid() && !isSubmitting
                        ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Processing...
                      </div>
                    ) : isFormValid() ? (
                      <div className="flex items-center justify-center gap-3">
                        <Package className="h-6 w-6" />
                        Add Product
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <AlertCircle className="h-6 w-6" />
                        Please complete all required fields
                      </div>
                    )}
                  </button>
                  
                  {/* Form Validation Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-700">Form Validation Status</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {[
                        { key: 'productName', label: 'Product Name' },
                        { key: 'description', label: 'Description' },
                        { key: 'price', label: 'Price' },
                        { key: 'stock', label: 'Stock' },
                        { key: 'category', label: 'Category' },
                        { key: 'brand', label: 'Brand' },
                        { key: 'images', label: 'Images' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          {validationStatus[key] === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : validationStatus[key] === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className={`${
                            validationStatus[key] === 'success' 
                              ? 'text-emerald-700' 
                              : validationStatus[key] === 'error' 
                                ? 'text-red-700' 
                                : 'text-gray-500'
                          }`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;