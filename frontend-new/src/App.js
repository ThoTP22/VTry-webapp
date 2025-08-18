import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { loadCartFromStorage } from './store/cartSlice';

// Components
import Layout from './components/Layout/Layout';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Pages
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductCatalog from './pages/ProductCatalog/ProductCatalog';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import CartPage from './pages/Cart/CartPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';
import VirtualTryOn from './pages/VirtualTryOn/VirtualTryOn';
import APITestPage from './pages/APITest/APITestPage';
import PaymentSuccessPage from './pages/Payment/PaymentSuccessPage';
import PaymentCancelPage from './pages/Payment/PaymentCancelPage';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Styles
import './App.css';

// Cart Initializer Component
const CartInitializer = () => {
  useEffect(() => {
    // Load cart data from localStorage when app starts
    store.dispatch(loadCartFromStorage());
  }, []);

  return null;
};

function App() {
  return (
    <Provider store={store}>
      <CartInitializer />
      <AuthProvider>
        <ProductsProvider>
          <Router>
            <div className="App">
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/catalog" element={<ProductCatalog />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/virtual-tryon" 
                    element={
                      <ProtectedRoute>
                        <VirtualTryOn />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/api-test" element={<APITestPage />} />
                  <Route path="/payment/success" element={<PaymentSuccessPage />} />
                  <Route path="/payment/cancel" element={<PaymentCancelPage />} />
                </Routes>
              </Layout>
            </div>
          </Router>
        </ProductsProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
