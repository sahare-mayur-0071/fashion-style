import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Listing from './pages/Listing';
import Favorites from './pages/Favorites';
import CartPage from './pages/dashboard/CartPage';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboardLayout from './pages/dashboard/UserDashboardLayout';
import ProfileInfo from './pages/dashboard/ProfileInfo';
import MyOrders from './pages/dashboard/MyOrders';
import MyFavorites from './pages/dashboard/MyFavorites';
import ProductDetails from './pages/ProductDetails';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Stock from './pages/admin/Stock';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

import MobileBottomNav from './components/MobileBottomNav';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Listing />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/cart" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* User Dashboard Routes */}
        <Route path="/profile" element={<UserDashboardLayout />}>
          <Route index element={<ProfileInfo />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="favorites" element={<MyFavorites />} />
          <Route path="cart" element={<CartPage />} />
        </Route>
        
        <Route path="/product/:id" element={<ProductDetails />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="stock" element={<Stock />} />
        </Route>
      </Routes>
      {!isAdminRoute && <MobileBottomNav />}
    </div>
  );
}

function App() {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </AdminAuthProvider>
  );
}

export default App;
