import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageCategories from './pages/admin/ManageCategories';
import ManageOrders from './pages/admin/ManageOrders';
import PaymentVerification from './pages/admin/PaymentVerification';

// Renders routes after auth state resolves
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-200px)]">
        <Routes>
          <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Home />} />
          <Route path="/books" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Books />} />
          <Route path="/books/:id" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <BookDetails />} />
          <Route path="/cart" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Cart />} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login" element={!user ? <Login /> : user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/" />} />

          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/books" element={<ProtectedRoute adminOnly><ManageBooks /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly><ManageCategories /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><ManageOrders /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute adminOnly><PaymentVerification /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

// Root component — wraps the app in all context providers
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
