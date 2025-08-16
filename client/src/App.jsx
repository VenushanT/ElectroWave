import { Route, Routes, useLocation } from "react-router-dom";
import { SearchProvider } from "./contexts/SearchContext";
import { Header } from "./components/User/Header";
import { HeroSection } from "./Pages/User/HeroSection";
import { CategoriesSection } from "./Pages/User/CategoriesSection";
import { FeaturedProducts } from "./Pages/User/FeaturedProducts";
import { DealsSection } from "./Pages/User/DealsSection";
import { Newsletter } from "./Pages/User/Newsletter";
import { Footer } from "./components/User/Footer";
import LoginPage from "./Pages/User/LoginPage";
import RegisterPage from "./Pages/User/RegisterPage";
import UserProfile from "./Pages/User/UserProfile";
import ProductPage from "./Pages/User/ProductPage";
import AddToCart from "./Pages/User/AddToCart";
import PaymentPage from "./Pages/User/PaymentPage";
import ProductDetailsPage from "./Pages/User/ProductDetailsPage";
import ConfirmOrder from "./Pages/User/ConfirmOrder";
import MyOrders from "./Pages/User/MyOrders";
import { Provider } from "react-redux";
import { store } from "./store";
import Sidebar from "./components/Admin/Sidebar";
import Dashboard from "./Pages/Admin/Dashboard";
import Users from "./Pages/Admin/Users";
import Product from "./Pages/Admin/Product";
import AddProduct from "./Pages/Admin/AddProduct";
import ViewProducts from "./Pages/Admin/ViewProducts";
import UpdateProduct from "./Pages/Admin/UpdateProduct";
import Orders from "./Pages/Admin/Orders";
import ReviewPage from "./Pages/User/Review";
import ManageCategoriesBrands from "./Pages/Admin/ManageCategoriesBrands";

function AppContent() {
  const location = useLocation();
  const adminRoutes = [
    "/dashboard",
    "/users",
    "/product",
    "/add-product",
    "/view-products",
    "/orders",
    "/manage-categories-brands",
  ];
  const isAdminRoute = adminRoutes.some((path) => location.pathname === path) || 
    location.pathname.startsWith("/update-product/");
  const hideHeader = [
    "/login",
    "/register",
    "/dashboard",
    "/users",
    "/product",
    "/add-product",
    "/view-products",
    "/orders",
    "/manage-categories-brands",
  ].some((path) => location.pathname === path) || 
    location.pathname.startsWith("/update-product/");

  return (
    <div className="min-h-screen flex">
      {isAdminRoute && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {!hideHeader && <Header />}
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <CategoriesSection />
                  <FeaturedProducts />
                  <DealsSection />
                  <Newsletter />
                </>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/cart" element={<AddToCart />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/deals" element={<DealsSection />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/categories" element={<CategoriesSection />} />
            <Route path="/ConfirmOrder" element={<ConfirmOrder />} />
            <Route path="/MyOrders" element={<MyOrders />} />
            <Route path="/product/:id/reviews" element={<ReviewPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/product" element={<Product />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/view-products" element={<ViewProducts />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/update-product/:id" element={<UpdateProduct />} />
            <Route path="/manage-categories-brands" element={<ManageCategoriesBrands />} />
          </Routes>
        </main>
        {!hideHeader && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <SearchProvider>
        <AppContent />
      </SearchProvider>
    </Provider>
  );
}

export default App;