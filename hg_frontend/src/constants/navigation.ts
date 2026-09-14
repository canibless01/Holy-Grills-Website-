export const DESKTOP_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/events', label: 'Events' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/orders', label: 'My Orders' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/rewards', label: 'Rewards' },
] as const;

export const MOBILE_TAB_LINKS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/menu', label: 'Menu', icon: 'menu' },
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
  { to: '/cart', label: 'Cart', icon: 'cart' },
] as const;

export const DASHBOARD_SIDEBAR_LINKS = [
  { to: '/dashboard', label: 'My HP' },
  { to: '/orders', label: 'My Orders' },
  { to: '/wallet', label: 'Wallet' },
  { to: '/referrals', label: 'Referrals' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/streak', label: 'Streak' },
  { to: '/hall-of-fame', label: 'Hall of Fame' },
  { to: '/order-locks', label: 'Order Locks' },
  { to: '/addresses', label: 'Addresses' },
  { to: '/profile', label: 'Profile Settings' },
] as const;
