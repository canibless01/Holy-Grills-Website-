// HolyGrill utility helpers
import { TIERS } from './mockData';

export const formatNaira = (amount) => {
  return `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatHp = (amount) => {
  return `${amount || 0} HP`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

export const getTier = (hpEarned120Day) => {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (hpEarned120Day >= tier.min_points) current = tier;
  }
  return current;
};

export const getNextTier = (hpEarned120Day) => {
  for (const tier of TIERS) {
    if (hpEarned120Day < tier.min_points) return tier;
  }
  return null;
};

export const getTierProgress = (hpEarned120Day) => {
  const current = getTier(hpEarned120Day);
  const next = getNextTier(hpEarned120Day);
  if (!next) return { current, next: null, progress: 100, remaining: 0 };
  const range = next.min_points - current.min_points;
  const earned = hpEarned120Day - current.min_points;
  return { current, next, progress: Math.min(100, (earned / range) * 100), remaining: next.min_points - hpEarned120Day };
};

export const ORDER_STATUS_FLOW = ['received', 'preparing', 'ready', 'assigned', 'out_for_delivery', 'delivered'];

export const ORDER_STATUS_LABELS = {
  received: 'Order Received',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  assigned: 'Rider Assigned',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  delivery_attempted: 'Delivery Attempted',
  unclaimed: 'Unclaimed',
  scheduled: 'Scheduled',
};

export const ORDER_STATUS_COLORS = {
  received: 'flame-gradient text-white',
  preparing: 'flame-gradient text-white',
  ready: 'flame-gradient text-white',
  assigned: 'flame-gradient text-white',
  out_for_delivery: 'flame-gradient text-white',
  delivered: 'bg-gold-400 text-white',
  cancelled: 'bg-flame-700 text-white',
  refunded: 'bg-flame-700 text-white',
  delivery_attempted: 'flame-gradient text-white',
  unclaimed: 'bg-flame-700 text-white',
  scheduled: 'flame-gradient text-white',
};

// Extract the ordering student's identity (name / phone / email) from an order
// object across every field shape the backend has been seen to return.
// Used by the Kitchen, Admin, Rider, and Student panels so they all surface
// "who placed this order" consistently — the order carries the info, the panels
// just have to read it out of the right field.
export const getOrderCustomer = (o) => {
  if (!o) return { name: '', phone: '', email: '', display: 'Walk-in' };
  const name =
    o.customer_name ||
    (o.customer && (o.customer.name || o.customer.full_name)) ||
    (o.delivery_contact && (o.delivery_contact.full_name || o.delivery_contact.name)) ||
    o.delivery_contact_name ||
    (o.user && (o.user.full_name || o.user.name)) ||
    o.guest_name ||
    o.user_name ||
    '';
  const phone =
    o.customer_phone ||
    (o.customer && o.customer.phone) ||
    (o.delivery_contact && o.delivery_contact.phone) ||
    o.delivery_contact_phone ||
    o.guest_phone ||
    (o.user && o.user.phone) ||
    '';
  const email =
    o.customer_email ||
    (o.customer && o.customer.email) ||
    (o.delivery_contact && o.delivery_contact.email) ||
    (o.user && o.user.email) ||
    o.user_email ||
    '';
  const display = name || (phone ? phone : 'Walk-in');
  return { name: name || '', phone: phone || '', email: email || '', display };
};

export const NOTIFICATION_ICONS = {
  order_status: '📦',
  order_confirmed: '✅',
  hp_earned: '🔥',
  streak_reminder: '📅',
  event_reminder: '🎟️',
  birthday: '🎂',
  promo: '⚡',
  delivery_update: '🛵',
};

export const HP_SOURCE_LABELS = {
  // Backend source values → user-friendly descriptions (Confirmed Business Logic · HP History)
  food_order: 'Food Order',
  welcome: 'Welcome Bonus',
  welcome_bonus: 'Welcome Bonus',
  referral: 'Referral Bonus',
  review: 'Order Review',
  event: 'Event Check-in',
  event_checkin: 'Event Check-in',
  social: 'Social Share',
  social_share: 'Social Share',
  birthday: 'Birthday Bonus',
  wallet_topup: 'Wallet Top-up',
  daily_checkin: 'Daily Check-in',
  streak: 'Login Streak',
  login_streak: 'Login Streak',
  squad_bonus: 'Squad Bonus',
  unlock: 'Pending HP Unlocked',
  // Additional sources seen in the ledger
  spin_wheel: 'Spin Wheel',
  signup_bonus: 'Sign-up Bonus',
  order_discount: 'Order Discount',
  admin_grant: 'Admin Grant',
  challenge: 'Challenge',
  flash_redeem: 'Flash Redeem',
};

// Map a raw HP transaction source to its friendly label.
export const getHpSourceLabel = (source) =>
  HP_SOURCE_LABELS[source] || (source ? source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');

// ── TIER ACCENT SYSTEM ──
// Maps each tier to a cohesive accent palette used across the dashboard,
// header avatar ring, and greeting icon. Classes are literal strings so
// Tailwind's JIT scanner picks them up from this source file.
export const TIER_ACCENTS = {
  ember: {
    slug: 'ember',
    icon: '🔥',
    text: 'text-flame-600',
    bg: 'bg-flame-600',
    gradient: 'flame-gradient',
    ring: 'ring-flame-500',
    light: 'bg-flame-50',
    lightBorder: 'border-flame-100',
  },
  flame: {
    slug: 'flame',
    icon: '🕯️',
    text: 'text-orange-600',
    bg: 'bg-orange-600',
    gradient: 'bg-gradient-to-br from-orange-500 to-amber-600',
    ring: 'ring-orange-500',
    light: 'bg-orange-50',
    lightBorder: 'border-orange-200',
  },
  blaze: {
    slug: 'blaze',
    icon: '💥',
    text: 'text-gold-600',
    bg: 'bg-gold-500',
    gradient: 'bg-gradient-to-br from-gold-400 to-gold-600',
    ring: 'ring-gold-500',
    light: 'bg-gold-50',
    lightBorder: 'border-gold-200',
  },
  holy: {
    slug: 'holy',
    icon: '👑',
    text: 'text-gold-600',
    bg: 'bg-gold-500',
    gradient: 'tier-shimmer-holy',
    ring: 'ring-gold-400',
    light: 'bg-gold-50',
    lightBorder: 'border-gold-200',
    shimmer: true,
  },
};

export const getTierAccent = (hpEarned120Day) => {
  const tier = getTier(hpEarned120Day);
  return TIER_ACCENTS[tier.slug] || TIER_ACCENTS.ember;
};