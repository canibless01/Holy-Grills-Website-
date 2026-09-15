import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import SectionErrorBoundary from '@/components/admin/SectionErrorBoundary';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminDelivery from '@/components/admin/AdminDelivery';
import AdminPromos from '@/components/admin/AdminPromos';
import { FeatureFlags, SystemSettings } from '@/components/admin/AdminConfig';
import AdminSystem from '@/components/admin/AdminSystem';
import AdminMenu from '@/components/admin/AdminMenu';
import AdminAddons from '@/components/admin/AdminAddons';
import AdminEvents from '@/components/admin/AdminEvents';
import AdminRewards from '@/components/admin/AdminRewards';
import AdminMarketplace from '@/components/admin/AdminMarketplace';
import AdminNotifications from '@/components/admin/AdminNotifications';
import AdminLeaderboard from '@/components/admin/AdminLeaderboard';
import AdminDepartments from '@/components/admin/AdminDepartments';
import AdminStorefront from '@/components/admin/AdminStorefront';
import AdminOnboarding from '@/components/admin/AdminOnboarding';
import AdminHpMultipliers from '@/components/admin/AdminHpMultipliers';
import AdminChallenges from '@/components/admin/AdminChallenges';
import AdminAbandonedCarts from '@/components/admin/AdminAbandonedCarts';
import AdminOrderLocks from '@/components/admin/AdminOrderLocks';
import AdminFreeCredits from '@/components/admin/AdminFreeCredits';
import AdminExclusiveSpin from '@/components/admin/AdminExclusiveSpin';
import AdminReviews from '@/components/admin/AdminReviews';
import AdminCatering from '@/components/admin/AdminCatering';
import { isAuthenticated, clearTokens } from '@/lib/apiClient';

const TITLES = {
  dashboard: 'Dashboard Overview',
  analytics: 'Analytics & Trends',
  users: 'User Management',
  orders: 'Order Management',
  delivery: 'Delivery Operations',
  menu: 'Menu Items',
  addons: 'Addons & Variations',
  events: 'Events',
  rewards: 'Rewards & Redemptions',
  marketplace: 'Marketplace',
  promos: 'Promo Code Management',
  abandoned: 'Abandoned Carts',
  orderlocks: 'Order Locks',
  challenges: 'Challenges',
  freecredits: 'Free Side Credits',
  exclusivespin: 'Exclusive Spin Admin',
  hp: 'HP & Multipliers',
  notifications: 'Notification Blasts',
  leaderboard: 'Leaderboard & Hall of Fame',
  departments: 'Departments & Academic Levels',
  storefront: 'Storefront Banners',
  reviews: 'Reviews',
  catering: 'Catering Management',
  onboarding: 'Onboarding & Graduation',
  flags: 'Feature Flags',
  settings: 'System Settings',
  system: 'System — Cron & Audit',
};

export default function Admin() {
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('hg_admin_collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authed, setAuthed] = useState(isAuthenticated());

  useEffect(() => { localStorage.setItem('hg_admin_collapsed', collapsed); }, [collapsed]);

  if (!authed) return <Navigate to="/login" state={{ from: '/admin' }} replace />;

  const renderSection = () => {
    switch (active) {
      case 'dashboard': return <AdminDashboard />;
      case 'analytics': return <AdminAnalytics />;
      case 'users': return <AdminUsers />;
      case 'orders': return <AdminOrders />;
      case 'delivery': return <AdminDelivery />;
      case 'menu': return <AdminMenu />;
      case 'addons': return <AdminAddons />;
      case 'events': return <AdminEvents />;
      case 'rewards': return <AdminRewards />;
      case 'marketplace': return <AdminMarketplace />;
      case 'promos': return <AdminPromos />;
      case 'challenges': return <AdminChallenges />;
      case 'abandoned': return <AdminAbandonedCarts />;
      case 'orderlocks': return <AdminOrderLocks />;
      case 'freecredits': return <AdminFreeCredits />;
      case 'exclusivespin': return <AdminExclusiveSpin />;
      case 'hp': return <AdminHpMultipliers />;
      case 'notifications': return <AdminNotifications />;
      case 'leaderboard': return <AdminLeaderboard />;
      case 'departments': return <AdminDepartments />;
      case 'storefront': return <AdminStorefront />;
      case 'reviews': return <AdminReviews />;
      case 'catering': return <AdminCatering />;
      case 'onboarding': return <AdminOnboarding />;
      case 'flags': return <FeatureFlags />;
      case 'settings': return <SystemSettings />;
      case 'system': return <AdminSystem />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-cocoa-50">
      <AdminSidebar
        active={active}
        onSelect={setActive}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-[76px]' : 'lg:ml-64'}`}>
        <AdminHeader
          title={TITLES[active] || 'Admin'}
          subtitle="Holy Grills · Admin Panel"
          onOpenMobile={() => setMobileOpen(true)}
          onSignOut={() => { clearTokens(); setAuthed(false); }}
          onNavigate={setActive}
        />

        <div className="p-4 lg:p-8">
          <SectionErrorBoundary sectionName={active}>
            {renderSection()}
          </SectionErrorBoundary>
        </div>
      </div>
    </div>
  );
}