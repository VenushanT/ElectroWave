import Sidebar from "../../components/Admin/Sidebar";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import axios from "axios";

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState([]);
  const [success, setSuccess] = useState("");

  const categories = {
    Smartphones: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Huawei", "Oppo", "Vivo", "Sony", "Nokia"],
    Laptops: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "MSI", "Razer", "Toshiba"],
    Audio: ["Sony", "Bose", "JBL", "Sennheiser", "Beats", "Audio-Technica", "Shure", "Marshall", "Skullcandy", "Anker"],
    Cameras: ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic", "Olympus", "Leica", "GoPro", "DJI", "Pentax"],
    Wearables: ["Apple", "Samsung", "Fitbit", "Garmin", "Huawei", "Xiaomi", "Polar", "Fossil", "Withings", "Oura"],
    Gaming: ["Sony", "Microsoft", "Nintendo", "Razer", "Logitech", "Asus", "MSI", "HyperX", "SteelSeries", "Corsair"],
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1) {
      setError("Please upload at least 1 image.");
      return;
    }
    if (files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }
    setImages(files);

    const imagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviews(imagePreviews);
    setError("");
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    setPreviews(previews.filter((_, index) => index !== indexToRemove));
    if (images.length <= 1) {
      setError("Please upload at least 1 image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !description || !price || !category || !brand || !stock || price <= 0 || stock <= 0) {
      setError("Please fill all fields with valid data (price and stock must be positive).");
      setSuccess("");
      return;
    }
    if (images.length < 1) {
      setError("Please upload at least 1 image.");
      setSuccess("");
      return;
    }

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('brand', brand);
    formData.append('stock', stock);
    images.forEach((image) => formData.append('images', image));

    try {
      const response = await axios.post('http://localhost:5000/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess("Product added successfully!");
      setError("");
      setProductName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setBrand("");
      setStock("");
      setImages([]);
      setPreviews([]);
    } catch (error) {
      console.error("Error adding product:", error);
      setError(error.response?.data?.message || "Failed to add product");
      setSuccess("");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {(error || success) && (
            <div className={`mb-6 p-4 rounded-lg text-center ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} role="alert">
              {error || success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  id="productName"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                  placeholder="Enter product name"
                  aria-label="Product name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 resize-y"
                  placeholder="Enter product description"
                  rows="5"
                  aria-label="Product description"
                  required
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                  placeholder="Enter price"
                  step="0.01"
                  min="0.01"
                  aria-label="Product price"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setBrand(""); // Reset brand when category changes
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                  aria-label="Product category"
                  required
                >
                  <option value="">Select a category</option>
                  {Object.keys(categories).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                  aria-label="Product brand"
                  required
                  disabled={!category}
                >
                  <option value="">Select a brand</option>
                  {category && categories[category].map((brandOption) => (
                    <option key={brandOption} value={brandOption}>
                      {brandOption}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                  placeholder="Enter stock quantity"
                  min="0"
                  aria-label="Product stock"
                  required
                />
              </div>
            </div>
            <div className="col-span-2">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="border-2 border-gray-300 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition duration-200">
                <input
                  id="images"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                  aria-label="Upload product images"
                  required
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("images").click()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-semibold flex items-center justify-center"
                >
                  <ImagePlus className="h-5 w-5 mr-2" />
                  Upload Images (Min 1, Max 5)
                </button>
                {previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview.url}
                          alt={`Preview ${preview.name}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-600 transition duration-200"
                          aria-label={`Remove ${preview.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-gray-600 mt-1 block">{preview.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Drag and drop or click to upload</p>
              </div>
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;