import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { SearchProvider } from "./contexts/SearchContext";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { DealsSection } from "./components/DealsSection";
import { Newsletter } from "./components/Newsletter";
import { Footer } from "./components/Footer";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import UserProfile from "./components/UserProfile";
import ProductPage from "./components/ProductPage";
import AddToCart from "./components/AddToCart";
import PaymentPage from "./components/PaymentPage";

function AppContent() {
  const location = useLocation();
  const hideHeader = [
    '/products',
    '/cart',
    '/payment',
    '/login',
    '/register'
  ].includes(location.pathname);
  const showLogoOnlyFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
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
        </Routes>
      </main>
      {!hideHeader && !showLogoOnlyFooter && <Footer />}
      {showLogoOnlyFooter && (
        <footer className="w-full flex justify-center items-center py-8 bg-transparent">
          <img src={process.env.PUBLIC_URL + '/zap-logo.png'} alt="ElectroWave Logo" className="w-16 h-16 object-contain" />
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <SearchProvider>
        <AppContent />
      </SearchProvider>
    </Router>
  );
}

export default App;