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

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  hpValue: number;
  isAvailable: boolean;
  sizes?: MenuItemSize[];
  tagLine?: string;
  slashedPrice?: number;
  percentageOff?: number;
  extras?: MenuItemExtra[];
  reviews?: MenuItemReview[];
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
