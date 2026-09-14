import type {
  AdminTableRow,
  DashboardStat,
  DeliveryWindow,
  EventDiscoveryItem,
  LeaderboardEntry,
  MarketplaceVendor,
  ReferralMilestone,
  RewardChallenge,
  RewardRedemption,
  RewardTier,
  RewardTransaction,
  WalletTransaction,
} from '@/types';

export const OPERATING_HOURS: DeliveryWindow[] = [
  { day: 0, label: 'Sunday', opensAt: '12:00', closesAt: '21:00' },
  { day: 1, label: 'Monday', opensAt: '10:00', closesAt: '22:00' },
  { day: 2, label: 'Tuesday', opensAt: '10:00', closesAt: '22:00' },
  { day: 3, label: 'Wednesday', opensAt: '10:00', closesAt: '22:00' },
  { day: 4, label: 'Thursday', opensAt: '10:00', closesAt: '22:00' },
  { day: 5, label: 'Friday', opensAt: '10:00', closesAt: '23:00' },
  { day: 6, label: 'Saturday', opensAt: '11:00', closesAt: '23:00' },
];

export const DASHBOARD_STATS: DashboardStat[] = [
  { label: 'Current HP', value: '248 HP', helper: '22 HP until Holy Eater' },
  { label: 'Weekly streak', value: '3 days', helper: 'Stay active for a bonus' },
  { label: 'Orders this month', value: '9', helper: '2 currently active' },
  { label: 'Referral wins', value: '3', helper: '₦1,500 bonus earned' },
];

export const REWARD_TIERS: RewardTier[] = [
  { name: 'Rookie', minHP: 0, maxHP: 99, perk: 'Early access drops', badge: 'Starter' },
  { name: 'Hungry', minHP: 100, maxHP: 249, perk: 'Free delivery windows', badge: 'Silver' },
  { name: 'Holy Eater', minHP: 250, maxHP: 499, perk: 'Priority squad orders', badge: 'Gold' },
  { name: 'Grill Master', minHP: 500, perk: 'Members-only drops', badge: 'Black' },
];

export const REWARD_REDEMPTIONS: RewardRedemption[] = [
  { id: 'reward-1', title: 'Free zobo add-on', description: 'Redeem on any meal order above ₦3,000.', hpCost: 45 },
  { id: 'reward-2', title: '₦1,500 off combo', description: 'Stack on combo bowls and platters.', hpCost: 120 },
  { id: 'reward-3', title: 'Free side swap', description: 'Unlock premium fries or plantain upgrades.', hpCost: 180 },
  { id: 'reward-4', title: 'Campus VIP drop', description: 'Reserved same-day delivery slot.', hpCost: 260, locked: true },
];

export const REWARD_CHALLENGES: RewardChallenge[] = [
  { id: 'challenge-1', title: '3 orders this week', description: 'Place one more order to unlock a 25 HP streak bonus.', current: 2, target: 3, rewardHP: 25 },
  { id: 'challenge-2', title: 'Review your last meal', description: 'Share feedback and earn bonus HP for the squad.', current: 0, target: 1, rewardHP: 10 },
  { id: 'challenge-3', title: 'Bring a friend', description: 'One successful referral unlocks an extra HP perk.', current: 1, target: 2, rewardHP: 40 },
];

export const HP_TRANSACTIONS: RewardTransaction[] = [
  { id: 'tx-1', label: 'Campus BBQ Stack order', type: 'earned', hp: 28, date: 'Today · 12:30 PM' },
  { id: 'tx-2', label: 'Weekly streak bonus', type: 'bonus', hp: 15, date: 'Yesterday · 8:10 PM' },
  { id: 'tx-3', label: 'Redeemed free zobo add-on', type: 'redeemed', hp: -45, date: 'Mon · 5:15 PM' },
  { id: 'tx-4', label: 'Referral reward', type: 'bonus', hp: 35, date: 'Sun · 2:44 PM' },
];

export const LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { id: 'usr-002', name: 'Funmilayo Adebayo', hp: 420, streak: 6, avatarSeed: 'F' },
  { id: 'usr-006', name: 'Nneka Uche', hp: 390, streak: 4, avatarSeed: 'N' },
  { id: 'usr-001', name: 'Adewale Johnson', hp: 248, streak: 3, avatarSeed: 'A' },
  { id: 'usr-004', name: 'Blessing Eze', hp: 220, streak: 5, avatarSeed: 'B' },
  { id: 'usr-003', name: 'Chinedu Okonkwo', hp: 188, streak: 2, avatarSeed: 'C' },
];

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'wallet-1', label: 'Wallet top-up', amount: 10000, type: 'credit', date: 'Today · 11:02 AM' },
  { id: 'wallet-2', label: 'Order #ORD-002', amount: -7400, type: 'debit', date: 'Today · 12:35 PM' },
  { id: 'wallet-3', label: 'Referral cashback', amount: 1500, type: 'credit', date: 'Yesterday · 6:30 PM' },
];

export const EVENT_DISCOVERY_ITEMS: EventDiscoveryItem[] = [
  {
    id: 'event-1',
    title: 'Midnight Grill Run',
    description: 'Late-night pickup collab for exam week.',
    date: 'Friday, May 22, 2026 · 9:00 PM',
    location: 'FUTA South Gate',
    capacity: '40 seats',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
    hpReward: 30,
    ticketPrice: 1500,
    featured: true,
  },
  {
    id: 'event-2',
    title: 'Squad Feast Friday',
    description: 'Curated combo menu for hostel squads.',
    date: 'Saturday, May 23, 2026 · 6:00 PM',
    location: 'Aule Common Room',
    capacity: 'Limited catering slots',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop&q=80',
    hpReward: 24,
    ticketPrice: 0,
    featured: false,
  },
];

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  { label: 'Starter bonus', referrals: 1, reward: '15 HP' },
  { label: 'Squad unlock', referrals: 3, reward: '₦1,500 order discount' },
  { label: 'Campus ambassador', referrals: 5, reward: 'Exclusive merch drop' },
];

export const MARKETPLACE_VENDORS: MarketplaceVendor[] = [
  {
    id: 'vendor-1',
    name: 'Holy Merch Pack',
    category: 'Merch',
    hpPrice: 250,
    cashPrice: 2200,
    description: 'Sticker pack, tote, and lanyard.',
    locked: false,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&auto=format&fit=crop&q=80',
    stock: 12,
    listingType: 'product',
  },
  {
    id: 'vendor-2',
    name: 'Study Fuel Bundle',
    category: 'Bundles',
    hpPrice: 420,
    cashPrice: 3500,
    description: 'Snack combo for late-night grinds.',
    locked: true,
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&auto=format&fit=crop&q=80',
    stock: 3,
    listingType: 'product',
  },
  {
    id: 'vendor-3',
    name: 'Vendor Pop-up Pass',
    category: 'Experiences',
    hpPrice: 300,
    cashPrice: 2800,
    description: 'Priority access for campus pop-up drops.',
    locked: false,
    imageUrl: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200&auto=format&fit=crop&q=80',
    stock: 8,
    listingType: 'digital',
  },
];

export const ADMIN_MODULE_ROWS: Record<string, AdminTableRow[]> = {
  'delivery-windows': [
    { id: 'dw-1', name: 'Weekday Lunch Window', status: 'Active', owner: 'Ops team', updatedAt: '10 mins ago' },
    { id: 'dw-2', name: 'Weekend Late Hours', status: 'Draft', owner: 'Ops team', updatedAt: 'Yesterday' },
  ],
  notifications: [
    { id: 'nt-1', name: 'Order ready push', status: 'Scheduled', owner: 'Growth', updatedAt: '5 mins ago' },
    { id: 'nt-2', name: 'HP streak reminder', status: 'Active', owner: 'Growth', updatedAt: 'Today' },
  ],
  'abandoned-carts': [
    { id: 'ac-1', name: 'Dorm pickup discount', status: 'Active', owner: 'CRM', updatedAt: 'Today' },
    { id: 'ac-2', name: '3-hour follow-up', status: 'Paused', owner: 'CRM', updatedAt: 'Yesterday' },
  ],
  hp: [
    { id: 'hp-1', name: 'Review reward rule', status: 'Active', owner: 'Loyalty', updatedAt: 'Today' },
    { id: 'hp-2', name: 'Referral multiplier', status: 'Draft', owner: 'Loyalty', updatedAt: 'Mon' },
  ],
  rewards: [
    { id: 'rw-1', name: 'Free zobo add-on', status: 'Live', owner: 'Loyalty', updatedAt: 'Today' },
    { id: 'rw-2', name: 'Campus VIP drop', status: 'Locked', owner: 'Loyalty', updatedAt: 'Today' },
  ],
  riders: [
    { id: 'rd-1', name: 'Tobi Rider', status: 'Online', owner: 'Dispatch', updatedAt: '2 mins ago' },
    { id: 'rd-2', name: 'Aisha Rider', status: 'Off shift', owner: 'Dispatch', updatedAt: 'Today' },
  ],
  events: [
    { id: 'ev-1', name: 'Semester kickoff catering', status: 'Approved', owner: 'Events', updatedAt: 'Today' },
    { id: 'ev-2', name: 'Faculty hangout booth', status: 'Pending', owner: 'Events', updatedAt: 'Yesterday' },
  ],
  challenges: [
    { id: 'ch-1', name: 'Review and earn', status: 'Live', owner: 'Loyalty', updatedAt: 'Today' },
    { id: 'ch-2', name: 'Weekly squad streak', status: 'Draft', owner: 'Loyalty', updatedAt: 'Tue' },
  ],
  marketplace: [
    { id: 'mk-1', name: 'Merch pack drop', status: 'Preview', owner: 'Marketplace', updatedAt: 'Today' },
    { id: 'mk-2', name: 'Study fuel bundle', status: 'Locked', owner: 'Marketplace', updatedAt: 'Today' },
  ],
  'leaderboard-controls': [
    { id: 'lb-1', name: 'Weekly reset job', status: 'Healthy', owner: 'Growth', updatedAt: 'Today' },
    { id: 'lb-2', name: 'Prize pool', status: 'Configured', owner: 'Growth', updatedAt: 'Today' },
  ],
  'operating-hours': [
    { id: 'oh-1', name: 'Exam week late close', status: 'Planned', owner: 'Ops team', updatedAt: 'Today' },
    { id: 'oh-2', name: 'Sunday brunch window', status: 'Active', owner: 'Ops team', updatedAt: 'Yesterday' },
  ],
};
