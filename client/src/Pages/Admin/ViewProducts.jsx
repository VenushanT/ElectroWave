import Sidebar from "../../components/Admin/Sidebar";
import { useState, useEffect } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
      setShowDeleteConfirm(null);
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product. Please check the server logs.");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">View Products</h1>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <img
                src={product.images[0] ? `http://localhost:5000/uploads/${product.images[0]}` : "/placeholder.jpg"}
                alt={product.productName}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h2 className="text-lg font-semibold">{product.productName}</h2>
              <p className="text-gray-600">${product.price}</p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => navigate(`/update-product/${product._id}`)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Edit className="h-5 w-5 mr-1" /> Update
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(product._id)}
                  className="text-red-600 hover:text-red-800 flex items-center"
                >
                  <Trash2 className="h-5 w-5 mr-1" /> Delete
                </button>
              </div>
              {showDeleteConfirm === product._id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                    <p>Are you sure you want to delete {product.productName}?</p>
                    <div className="mt-4 flex justify-end gap-4">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewProducts;