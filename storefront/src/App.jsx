import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnnouncementBar from './components/AnnouncementBar'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ScentFinderPage from './pages/ScentFinderPage'
import AboutPage from './pages/AboutPage'
import WishlistPage from './pages/WishlistPage'
import SearchResultsPage from './pages/SearchResultsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import FAQPage from './pages/FAQPage'
import ShippingPage from './pages/ShippingPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <ScrollToTop />
              <AnnouncementBar />
              <Navbar />
              <CartDrawer />
              <Toast />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/shop/:category" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/subscribe" element={<SubscriptionPage />} />
                  <Route path="/scent-finder" element={<ScentFinderPage />} />
                  <Route path="/our-story" element={<AboutPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/shipping" element={<ShippingPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
