import { Route, Routes, useLocation } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { Header } from './components/User/Header';
import { HeroSection } from './Pages/User/HeroSection';
import { CategoriesSection } from './Pages/User/CategoriesSection';
import { FeaturedProducts } from './Pages/User/FeaturedProducts';
import { DealsSection } from './Pages/User/DealsSection';
import { Newsletter } from './Pages/User/Newsletter';
import { Footer } from './components/User/Footer';
import LoginPage from './Pages/User/LoginPage';
import RegisterPage from './Pages/User/RegisterPage';
import UserProfile from './Pages/User/UserProfile';
import ProductPage from './Pages/User/ProductPage';
import AddToCart from './Pages/User/AddToCart';
import PaymentPage from './Pages/User/PaymentPage';
import { Provider } from 'react-redux';
import { store } from './store';

function AppContent() {
  const location = useLocation();
  const hideHeader = [
    '/products',
    '/cart',
    '/payment',
    '/login',
    '/register',
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
          <img
            src={process.env.PUBLIC_URL + '/zap-logo.png'}
            alt="ElectroWave Logo"
            className="w-16 h-16 object-contain"
          />
        </footer>
      )}
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