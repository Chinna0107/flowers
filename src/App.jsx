import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import './index.css';
import './styles/theme.css';
import { AuthProvider } from './store/authStore';

import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import ProductList from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Signin from "./pages/Signin.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import { CartProvider } from './store/cartStore.jsx';
import MyOrders from "./pages/MyOrders.jsx";
import MySubscriptions from "./pages/MySubscriptions.jsx";
import Support from "./pages/Support.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
            {/* Customer Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation" element={<OrderConfirmation />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth" element={<Navigate to="/signin" replace />} />
              <Route path="/login" element={<Navigate to="/signin" replace />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/my-subscriptions" element={<MySubscriptions />} />
              <Route path="/support" element={<Support />} />
              <Route path="/account" element={<Navigate to="/my-orders" replace />} />

            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
