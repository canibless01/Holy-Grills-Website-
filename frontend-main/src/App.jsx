import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { HolyGrillProvider } from '@/lib/HolyGrillContext';
import Layout from '@/components/Layout';
import InstallPrompt from '@/components/InstallPrompt';
import CookieConsent from '@/components/CookieConsent';
import RequireAuth from '@/components/RequireAuth';
import { SoundProvider } from '@/lib/SoundProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

// Eager imports — instant navigation with no per-route Suspense spinner.
import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import ItemDetail from '@/pages/ItemDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderConfirmation from '@/pages/OrderConfirmation';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import TrackOrders from '@/pages/TrackOrders';
import Dashboard from '@/pages/Dashboard';
import HpEducation from '@/pages/HpEducation';
import Rewards from '@/pages/Rewards';
import Leaderboard from '@/pages/Leaderboard';
import Wallet from '@/pages/Wallet';
import Marketplace from '@/pages/Marketplace';
import MarketplaceDetail from '@/pages/MarketplaceDetail';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import Profile from '@/pages/Profile';
import Addresses from '@/pages/Addresses';
import NotificationPreferences from '@/pages/NotificationPreferences';
import Notifications from '@/pages/Notifications';
import Referrals from '@/pages/Referrals';
import OrderLocks from '@/pages/OrderLocks';
import Streak from '@/pages/Streak';
import HallOfFame from '@/pages/HallOfFame';
const Kitchen = lazy(() => import('@/pages/Kitchen'));
const Rider = lazy(() => import('@/pages/Rider'));
const Admin = lazy(() => import('@/pages/Admin'));
import FAQ from '@/pages/FAQ';
import TermsPrivacy from '@/pages/TermsPrivacy';
import OurStory from '@/pages/OurStory';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-flame-500 border-t-transparent rounded-full animate-spin" /></div>}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<Layout />}>
        {/* Public browsing + ordering (guests welcome) */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:id" element={<ItemDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/track-orders" element={<TrackOrders />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<TermsPrivacy />} />
        <Route path="/our-story" element={<OurStory />} />
        {/* Authenticated student routes */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hp-education" element={<HpEducation />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/notification-preferences" element={<NotificationPreferences />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/order-locks" element={<OrderLocks />} />
          <Route path="/streak" element={<Streak />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
        </Route>
      </Route>
      <Route path="/admin" element={<Admin />} />
      <Route path="/kitchen" element={<Kitchen />} />
      <Route path="/rider" element={<Rider />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <SoundProvider>
              <HolyGrillProvider>
                <AppRoutes />
                <InstallPrompt />
                <CookieConsent />
              </HolyGrillProvider>
            </SoundProvider>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App