export interface MenuItemSize {
  label: string;
  price: number;
  description?: string;
}

export interface MenuItemExtra {
  title: string;
  price: number;
  imageUrl: string;
}

export interface MenuItemReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
  rewardHP?: number;
}

export interface MenuItemVariationOption {
  id: string;
  variation_group_id?: string;
  name: string;
  price_delta: number;
  is_available: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface MenuItemVariationGroup {
  id: string;
  menu_item_id?: string;
  name: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  sort_order?: number;
  created_at?: string;
  options?: MenuItemVariationOption[];
}

export interface MenuAddon {
  id: string;
  group_id?: string;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  is_archived?: boolean;
  sort_order?: number;
}

export interface MenuAddonGroup {
  id: string;
  menu_item_id?: string;
  name: string;
  is_required: boolean;
  min_select: number;
  max_select: number;
  sort_order?: number;
  addons?: MenuAddon[];
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface KitchenCapacity {
  daily_order_capacity?: number;
  current_orders?: number;
  [key: string]: unknown;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  hpValue: number;
  isAvailable: boolean;
  isSecret?: boolean;
  hpMultiplier?: number;
  dailyLimit?: number;
  sizes?: MenuItemSize[];
  tagLine?: string;
  slashedPrice?: number;
  percentageOff?: number;
  extras?: MenuItemExtra[];
  reviews?: MenuItemReview[];
  variationGroups?: MenuItemVariationGroup[];
  addonGroups?: MenuAddonGroup[];
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface DeliveryAddress {
  streetAddress: string;
  city: string;
  landmark?: string;
  phone: string;
}

export interface StatusEvent {
  status: OrderStatus;
  timestamp: string;
}

export interface RiderInfo {
  name: string;
  phone: string;
  vehicle: string;
  etaMinutes: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: DeliveryAddress;
  paystackRef: string;
  hpEarned: number;
  estimatedDelivery: string;
  prepDeadline?: string;
  rider?: RiderInfo;
  statusHistory: StatusEvent[];
  createdAt: string;
  cancelReason?: string;
  refundedAt?: string;
}

export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  orderId: string;
  paystackRef: string;
  amount: number;
  status: PaymentStatus;
  channel: 'card' | 'bank_transfer' | 'ussd' | 'wallet';
  customerEmail: string;
  customerPhone: string;
  paidAt: string;
  refundedAt?: string;
  metadata?: Record<string, unknown>;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketMessage {
  id: string;
  sender: 'customer' | 'admin';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  totalHP: number;
}

export interface CartItem {
  id: string;
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  hpValue: number;
  sizeLabel?: string;
  extras?: string[];
}

export interface RewardTier {
  name: string;
  minHP: number;
  maxHP?: number;
  perk: string;
  badge: string;
}

export interface RewardChallenge {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardHP: number;
}

export interface RewardRedemption {
  id: string;
  title: string;
  description: string;
  hpCost: number;
  locked?: boolean;
}

export interface RewardTransaction {
  id: string;
  label: string;
  type: 'earned' | 'redeemed' | 'bonus';
  hp: number;
  date: string;
}

export interface DeliveryWindow {
  day: number;
  label: string;
  opensAt: string;
  closesAt: string;
  closed?: boolean;
}

export type DeliveryWindowStatus = 'open' | 'closing_soon' | 'closed';

export interface DeliveryWindowInfo {
  status: DeliveryWindowStatus;
  message: string;
  detail: string;
  nextChangeLabel: string;
  countdownSeconds: number;
}

export interface DashboardStat {
  label: string;
  value: string;
  helper: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  hp: number;
  streak: number;
  avatarSeed: string;
}

export interface WalletTransaction {
  id: string;
  label: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
}

export interface EventDiscoveryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: string;
  imageUrl?: string;
  hpReward?: number;
  ticketPrice?: number;
  featured?: boolean;
}

export interface ReferralMilestone {
  label: string;
  referrals: number;
  reward: string;
}

export interface MarketplaceVendor {
  id: string;
  name: string;
  category: string;
  hpPrice: number;
  cashPrice?: number;
  locked: boolean;
  description: string;
  imageUrl?: string;
  stock?: number;
  listingType?: 'product' | 'digital';
}

export interface AdminTableRow {
  id: string;
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
}

export interface HeroCTA {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  description: string;
  ctaButtons: HeroCTA[];
  imageUrl: string;
  isActive: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  trigger_type: string;
  trigger_value: number;
  hp_awarded: number;
  time_window?: 'weekly' | 'monthly' | string | null;
  icon_won?: string | null;
  icon_locked?: string | null;
  is_active?: boolean;
  social_link?: string | null;
  trigger_meta?: Record<string, unknown> | null;
}

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  completed_at: string;
  hp_awarded: number;
  period_key?: string | null;
}

export interface ChallengeBadge {
  id?: string;
  title?: string;
  icon_won?: string;
  earned?: boolean;
  earned_at?: string;
  hp_awarded?: number;
  [key: string]: unknown;
}

export interface ChallengesMyResponse {
  badges: ChallengeBadge[];
  challenges_available: Milestone[];
  challenges_completed: Milestone[];
}

export interface ChallengeCompleteResponse {
  success?: boolean;
  milestone?: string;
  hp_awarded?: number;
  already_completed?: boolean;
  message?: string;
  error?: string;
}

export interface PWAPushBonusStatus {
  pwa_install: boolean;
  push_subscribe: boolean;
  bonus_completed: boolean;
  eligible: boolean;
}

export interface PushSubscriptionPayload {
  subscription: Record<string, unknown>;
  device_label?: string;
}

export interface ReferredUser {
  id: string;
  referred_user_id?: string;
  name?: string;
  email?: string;
  status: 'pending' | 'completed' | string;
  hp_awarded: number;
  created_at: string;
}

export interface ReferralStats {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_hp_earned: number;
}

export interface ReferralDataResponse {
  stats: ReferralStats;
  referrals: ReferredUser[];
}
