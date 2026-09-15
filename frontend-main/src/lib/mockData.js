// HolyGrill Mock Data — matches exact backend field structures from API spec

export const TIERS = [
  { id: "tier_ember", name: "Ember", slug: "ember", min_points: 0, earn_multiplier: 1.00, color: "#A8301A", icon: "🔥" },
  { id: "tier_flame", name: "Flame", slug: "flame", min_points: 2500, earn_multiplier: 1.08, color: "#FF6B1A", icon: "🕯️" },
  { id: "tier_blaze", name: "Blaze", slug: "blaze", min_points: 7500, earn_multiplier: 1.15, color: "#FF4E2D", icon: "💥" },
  { id: "tier_holy", name: "Holy", slug: "holy", min_points: 20000, earn_multiplier: 1.25, color: "#FFD700", icon: "👑" },
];

export const MENU_CATEGORIES = [
  { id: "cat_burgers", name: "Burgers", slug: "burgers", sort_order: 1 },
  { id: "cat_wings", name: "Wings", slug: "wings", sort_order: 2 },
  { id: "cat_kebabs", name: "Kebabs", slug: "kebabs", sort_order: 3 },
  { id: "cat_sides", name: "Sides", slug: "sides", sort_order: 4 },
  { id: "cat_drinks", name: "Drinks", slug: "drinks", sort_order: 5 },
  { id: "cat_combos", name: "Combos", slug: "combos", sort_order: 6 },
];

export const MENU_ITEMS = [
  {
    id: "mi_holy_wings",
    name: "Holy Wings 🔥",
    price: 1800.00,
    category_id: "cat_wings",
    description: "Open flame only. Marinated deep, basted repeatedly, grilled until the crust is real. Shareable. Unstoppable.",
    daily_limit: 50,
    daily_remaining: 32,
    is_sold_out: false,
    is_available: true,
    is_featured: true,
    hp_earn_value: 12,
    image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80",
    menu_categories: { name: "Wings", slug: "wings" },
  },
  {
    id: "mi_holy_kebabs",
    name: "Holy Kebabs 🔥",
    price: 1900.00,
    category_id: "cat_kebabs",
    description: "Bold. Flame-grilled. Built for the student who wants something that hits differently. Every kebab, basted until the flavour has nowhere left to go.",
    daily_limit: 40,
    daily_remaining: 18,
    is_sold_out: false,
    is_available: true,
    is_featured: true,
    hp_earn_value: 14,
    image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
    menu_categories: { name: "Kebabs", slug: "kebabs" },
  },
  {
    id: "mi_holy_cut",
    name: "Holy Cut 🔥",
    price: 2000.00,
    category_id: "cat_burgers",
    description: "The classic. Real flame. Real baste. Real flavour that surprises you every single time — because the Holy Flame Method doesn't take shortcuts.",
    daily_limit: 45,
    daily_remaining: 8,
    is_sold_out: false,
    is_available: true,
    is_featured: true,
    hp_earn_value: 15,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    menu_categories: { name: "Burgers", slug: "burgers" },
  },
  {
    id: "mi_flame_burger",
    name: "Flame Burger",
    price: 2500.00,
    category_id: "cat_burgers",
    description: "Grilled chicken patty with lettuce, tomato, and our signature Holy Sauce. Flame-grilled to perfection.",
    daily_limit: 50,
    daily_remaining: 32,
    is_sold_out: false,
    is_available: true,
    is_featured: false,
    hp_earn_value: 25,
    image_url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80",
    menu_categories: { name: "Burgers", slug: "burgers" },
  },
  {
    id: "mi_inferno_burger",
    name: "Inferno Burger",
    price: 2800.00,
    category_id: "cat_burgers",
    description: "Double patty, double flame, double heat. For those who dare the Holy Flame.",
    daily_limit: 30,
    daily_remaining: 0,
    is_sold_out: true,
    is_available: false,
    is_featured: false,
    hp_earn_value: 28,
    image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80",
    menu_categories: { name: "Burgers", slug: "burgers" },
  },
  {
    id: "mi_plantain",
    name: "Crispy Plantain",
    price: 800.00,
    category_id: "cat_sides",
    description: "Golden fried plantain. Crispy outside, sweet inside. The perfect sidekick.",
    daily_limit: 100,
    daily_remaining: 67,
    is_sold_out: false,
    is_available: true,
    is_featured: false,
    hp_earn_value: 8,
    image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
    menu_categories: { name: "Sides", slug: "sides" },
  },
  {
    id: "mi_coleslaw",
    name: "Creamy Coleslaw",
    price: 700.00,
    category_id: "cat_sides",
    description: "Fresh cabbage, carrots, and our creamy dressing. Cool contrast to the flame.",
    daily_limit: 80,
    daily_remaining: 54,
    is_sold_out: false,
    is_available: true,
    is_featured: false,
    hp_earn_value: 7,
    image_url: "https://images.unsplash.com/photo-1604908554007-1e90c0a3c3c3?w=600&q=80",
    menu_categories: { name: "Sides", slug: "sides" },
  },
  {
    id: "mi_fries",
    name: "Holy Fries",
    price: 1000.00,
    category_id: "cat_sides",
    description: "Crispy, golden, seasoned with our secret Holy Spice blend. Best fries on campus.",
    daily_limit: 100,
    daily_remaining: 89,
    is_sold_out: false,
    is_available: true,
    is_featured: true,
    hp_earn_value: 10,
    image_url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&q=80",
    menu_categories: { name: "Sides", slug: "sides" },
  },
  {
    id: "mi_combo_feast",
    name: "Holy Feast Combo",
    price: 4500.00,
    category_id: "cat_combos",
    description: "Holy Wings + Holy Cut + Holy Fries + Drink. The complete flame experience for you and your squad.",
    daily_limit: 25,
    daily_remaining: 12,
    is_sold_out: false,
    is_available: true,
    is_featured: true,
    hp_earn_value: 45,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
    menu_categories: { name: "Combos", slug: "combos" },
  },
  {
    id: "mi_zobo",
    name: "Holy Zobo",
    price: 500.00,
    category_id: "cat_drinks",
    description: "Ice-cold hibiscus brew, naturally sweetened. Refreshes after the flame.",
    daily_limit: 200,
    daily_remaining: 156,
    is_sold_out: false,
    is_available: true,
    is_featured: false,
    hp_earn_value: 5,
    image_url: "https://images.unsplash.com/photo-1597306622489-d957bc89c7e1?w=600&q=80",
    menu_categories: { name: "Drinks", slug: "drinks" },
  },
];

export const VARIATION_GROUPS = {
  "mi_holy_wings": [
    {
      id: "vg_wings_spice",
      name: "Spice Level",
      is_required: true,
      min_selections: 1,
      max_selections: 1,
      options: [
        { id: "opt_mild", name: "Mild", price_delta: 0 },
        { id: "opt_medium", name: "Medium", price_delta: 0 },
        { id: "opt_hot", name: "Hot 🔥", price_delta: 0 },
        { id: "opt_inferno", name: "Inferno 🔥🔥🔥", price_delta: 200 },
      ],
    },
    {
      id: "vg_wings_count",
      name: "How many wings?",
      is_required: true,
      min_selections: 1,
      max_selections: 1,
      options: [
        { id: "opt_5pcs", name: "5 pieces", price_delta: 0 },
        { id: "opt_10pcs", name: "10 pieces", price_delta: 1200 },
        { id: "opt_15pcs", name: "15 pieces", price_delta: 2200 },
      ],
    },
  ],
  "mi_flame_burger": [
    {
      id: "vg_burger_side",
      name: "Choose your side",
      is_required: true,
      min_selections: 1,
      max_selections: 1,
      options: [
        { id: "opt_coleslaw", name: "Coleslaw", price_delta: 0 },
        { id: "opt_plantain", name: "Plantain", price_delta: 200 },
        { id: "opt_fries", name: "Holy Fries", price_delta: 300 },
      ],
    },
  ],
  "mi_combo_feast": [
    {
      id: "vg_combo_drink",
      name: "Pick your drink",
      is_required: true,
      min_selections: 1,
      max_selections: 1,
      options: [
        { id: "opt_zobo", name: "Holy Zobo", price_delta: 0 },
        { id: "opt_coke", name: "Coca-Cola", price_delta: 100 },
        { id: "opt_water", name: "Water", price_delta: -200 },
      ],
    },
  ],
};

export const ADDON_GROUPS = {
  "mi_holy_wings": [
    {
      id: "ag_wings_sauce",
      name: "Extra Sauces",
      is_required: false,
      min_select: 0,
      max_select: 3,
      addons: [
        { id: "add_bbq", name: "BBQ Sauce", price: 150 },
        { id: "add_peri", name: "Peri-peri Sauce", price: 150 },
        { id: "add_garlic", name: "Garlic Mayo", price: 200 },
      ],
    },
  ],
  "mi_flame_burger": [
    {
      id: "ag_burger_extras",
      name: "Make it bigger",
      is_required: true,
      min_select: 1,
      max_select: 3,
      addons: [
        { id: "add_cheese", name: "Extra Cheese", price: 200 },
        { id: "add_bacon", name: "Grilled Bacon", price: 400 },
        { id: "add_egg", name: "Fried Egg", price: 200 },
      ],
    },
  ],
  "mi_holy_kebabs": [
    {
      id: "ag_kebab_extras",
      name: "Add-ons",
      is_required: false,
      min_select: 0,
      max_select: 2,
      addons: [
        { id: "add_onions", name: "Extra Onions", price: 100 },
        { id: "add_pepper", name: "Extra Pepper", price: 100 },
      ],
    },
  ],
};

export const GLOBAL_ADDONS = [
  { id: "add_extra_sauce", name: "Extra Sauce", price: 150, is_available: true },
  { id: "add_extra_spice", name: "Extra Holy Spice", price: 100, is_available: true },
  { id: "add_packaging", name: "Premium Packaging", price: 200, is_available: true },
];

export const DELIVERY_WINDOWS = [
  {
    id: "dw_morning",
    label: "Morning Window",
    starts_at: "2025-07-14T08:00:00Z",
    ends_at: "2025-07-14T12:00:00Z",
    status: "open",
    capacity: 50,
    orders_count: 32,
  },
  {
    id: "dw_afternoon",
    label: "Afternoon Window",
    starts_at: "2025-07-14T12:00:00Z",
    ends_at: "2025-07-14T16:00:00Z",
    status: "open",
    capacity: 60,
    orders_count: 45,
  },
  {
    id: "dw_evening",
    label: "Evening Window",
    starts_at: "2025-07-14T16:00:00Z",
    ends_at: "2025-07-14T22:00:00Z",
    status: "open",
    capacity: 80,
    orders_count: 68,
  },
  {
    id: "dw_tomorrow",
    label: "Tomorrow Morning",
    starts_at: "2025-07-15T08:00:00Z",
    ends_at: "2025-07-15T12:00:00Z",
    status: "scheduled",
    capacity: 50,
    orders_count: 5,
  },
];

export const ON_CAMPUS_GATES = [
  { id: "gate_north", name: "North Gate (Obanla)", lat: 7.2985, lng: 5.1421 },
  { id: "gate_south", name: "South Gate (Obakekere)", lat: 7.2935, lng: 5.1371 },
  { id: "gate_west", name: "West Gate", lat: 7.2960, lng: 5.1350 },
  { id: "gate_east", name: "East Gate", lat: 7.3010, lng: 5.1450 },
];

export const ON_CAMPUS_LOCATIONS = [
  { id: "loc_hall1", name: "Hall 1", gate_id: "gate_north" },
  { id: "loc_hall2", name: "Hall 2", gate_id: "gate_north" },
  { id: "loc_hall3", name: "Hall 3", gate_id: "gate_north" },
  { id: "loc_hall4", name: "Hall 4", gate_id: "gate_south" },
  { id: "loc_hall5", name: "Hall 5", gate_id: "gate_south" },
  { id: "loc_hall6", name: "Hall 6", gate_id: "gate_south" },
  { id: "loc_library", name: "Albert Ilemobade Library", gate_id: "gate_west" },
  { id: "loc_lecture", name: "Lecture Theatre", gate_id: "gate_east" },
  { id: "loc_sport", name: "Sports Complex", gate_id: "gate_east" },
  { id: "loc_chapel", name: "Chapel of Peace", gate_id: "gate_west" },
];

export const MOCK_ORDERS = [
  {
    id: "ord_001",
    status: "delivered",
    total_amount: 5000.00,
    subtotal: 5200.00,
    discount_amount: 200.00,
    delivery_fee: 0,
    wallet_amount_used: 5000.00,
    card_amount_used: 0,
    hp_redeemed: 50,
    hp_earned: 75,
    payment_status: "paid",
    created_at: "2025-07-10T10:00:00Z",
    delivered_at: "2025-07-10T11:30:00Z",
    delivery_type: "on_campus",
    delivery_window_id: "dw_morning",
    delivery_address: { line1: "Hall 3, North Gate", city: "Akure", state: "Ondo" },
    order_items: [
      { name_snapshot: "Holy Wings 🔥", quantity: 2, price_snapshot: 1800.00, line_total: 3600.00 },
      { name_snapshot: "Holy Fries", quantity: 1, price_snapshot: 1000.00, line_total: 1000.00 },
    ],
    delivery_window: { label: "Morning Window" },
    delivery_batch: { rider_id: "rider_01", status: "completed" },
  },
  {
    id: "ord_002",
    status: "delivered",
    total_amount: 2800.00,
    subtotal: 2800.00,
    discount_amount: 0,
    delivery_fee: 0,
    wallet_amount_used: 2800.00,
    card_amount_used: 0,
    hp_redeemed: 0,
    hp_earned: 28,
    payment_status: "paid",
    created_at: "2025-07-07T14:00:00Z",
    delivered_at: "2025-07-07T15:15:00Z",
    delivery_type: "on_campus",
    delivery_window_id: "dw_afternoon",
    delivery_address: { line1: "Hall 5, South Gate", city: "Akure", state: "Ondo" },
    order_items: [
      { name_snapshot: "Inferno Burger", quantity: 1, price_snapshot: 2800.00, line_total: 2800.00 },
    ],
    delivery_window: { label: "Afternoon Window" },
    delivery_batch: { rider_id: "rider_02", status: "completed" },
  },
  {
    id: "ord_003",
    status: "preparing",
    total_amount: 4500.00,
    subtotal: 4500.00,
    discount_amount: 0,
    delivery_fee: 0,
    wallet_amount_used: 4500.00,
    card_amount_used: 0,
    hp_redeemed: 0,
    hp_earned: 0,
    payment_status: "paid",
    created_at: "2025-07-14T09:30:00Z",
    delivered_at: null,
    delivery_type: "on_campus",
    delivery_window_id: "dw_morning",
    delivery_address: { line1: "Library, West Gate", city: "Akure", state: "Ondo" },
    order_items: [
      { name_snapshot: "Holy Feast Combo", quantity: 1, price_snapshot: 4500.00, line_total: 4500.00 },
    ],
    delivery_window: { label: "Morning Window" },
    delivery_batch: null,
    preparing_at: "2025-07-14T09:35:00Z",
  },
];

export const MOCK_EVENTS = [
  {
    id: "evt_techfest",
    title: "FUTA Tech Fest 2025",
    description: "Annual tech gathering featuring innovations, startups, and Holy Grill catering. Check in to earn 40 HP!",
    location: "Main Auditorium",
    starts_at: "2025-07-20T10:00:00Z",
    ends_at: "2025-07-20T18:00:00Z",
    hp_per_attendee: 40,
    max_attendees: 200,
    ticket_price_wallet: 1000.00,
    ticket_price_hp: 50,
    checkin_count: 45,
    is_published: true,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  },
  {
    id: "evt_sportsday",
    title: "Inter-Faculty Sports Day",
    description: "Battle of the faculties! Holy Grill will be on-site grilling. Check in for HP and free wings samples.",
    location: "Sports Complex",
    starts_at: "2025-07-18T08:00:00Z",
    ends_at: "2025-07-18T17:00:00Z",
    hp_per_attendee: 30,
    max_attendees: 500,
    ticket_price_wallet: 0,
    ticket_price_hp: 0,
    checkin_count: 0,
    is_published: true,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  },
  {
    id: "evt_freshers",
    title: "Freshers' Welcome Party",
    description: "Welcome to FUTA! Holy Grill is sponsoring the freshers' party. Free food + HP for all attendees.",
    location: "Student Union Building",
    starts_at: "2025-07-25T16:00:00Z",
    ends_at: "2025-07-25T22:00:00Z",
    hp_per_attendee: 50,
    max_attendees: 300,
    ticket_price_wallet: 500.00,
    ticket_price_hp: 25,
    checkin_count: 0,
    is_published: true,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  },
];

export const MOCK_REWARDS = [
  { id: "rw_freepizza", name: "Free Holy Cut", hp_cost: 200, reward_type: "food", stock_quantity: 50, min_tier_id: "tier_ember", expires_at: "2025-12-31T23:59:59Z", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { id: "rw_freeside", name: "Free Holy Fries", hp_cost: 100, reward_type: "food", stock_quantity: 100, min_tier_id: "tier_ember", expires_at: "2025-12-31T23:59:59Z", image_url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80" },
  { id: "rw_freewings", name: "Free Holy Wings", hp_cost: 180, reward_type: "food", stock_quantity: 30, min_tier_id: "tier_flame", expires_at: "2025-12-31T23:59:59Z", image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80" },
  { id: "rw_discount", name: "₦500 Off Next Order", hp_cost: 150, reward_type: "discount", stock_quantity: 200, min_tier_id: "tier_ember", expires_at: "2025-12-31T23:59:59Z", image_url: null },
  { id: "rw_combo", name: "Free Feast Combo", hp_cost: 450, reward_type: "food", stock_quantity: 10, min_tier_id: "tier_blaze", expires_at: "2025-12-31T23:59:59Z", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80" },
  { id: "rw_vip", name: "VIP Event Access", hp_cost: 800, reward_type: "experience", stock_quantity: 5, min_tier_id: "tier_holy", expires_at: "2025-12-31T23:59:59Z", image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80" },
];

export const MOCK_MARKETPLACE = [
  { id: "mp_chair", title: "Gaming Chair", listing_type: "product", price: 50000.00, hp_price: 500, vendor_name: "Tech Store", codes_remaining: 10, image_url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80", description: "Ergonomic gaming chair, perfect for those long study sessions." },
  { id: "mp_airpods", title: "AirPods Pro (Fair)", listing_type: "product", price: 80000.00, hp_price: 800, vendor_name: "Tech Exchange", codes_remaining: 3, image_url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80", description: "Used AirPods Pro in fair condition. Tested and working." },
  { id: "mp_textbook", title: "Engineering Textbooks Bundle", listing_type: "product", price: 15000.00, hp_price: 150, vendor_name: "Book Bank", codes_remaining: 5, image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80", description: "Complete set of 200-level engineering textbooks. Barely used." },
  { id: "mp_data", title: "100GB Data Bundle", listing_type: "digital", price: 20000.00, hp_price: 200, vendor_name: "DataPlug", codes_remaining: 50, image_url: "https://images.unsplash.com/photo-1592833167001-55b8a8b41a0d?w=600&q=80", description: "100GB data valid for 30 days. All networks supported." },
  { id: "mp_sneakers", title: "Vintage Sneakers", listing_type: "product", price: 25000.00, hp_price: 250, vendor_name: "Thrifty Soles", codes_remaining: 2, image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80", description: "Clean vintage sneakers. Size 42." },
  { id: "mp_powerbank", title: "20000mAh Power Bank", listing_type: "product", price: 18000.00, hp_price: 180, vendor_name: "GadgetHub", codes_remaining: 8, image_url: "https://images.unsplash.com/photo-1609592424823-1a1ddb5d7c5e?w=600&q=80", description: "Fast-charging 20000mAh power bank. Never run out of juice." },
];

export const MOCK_LEADERBOARD = {
  monthly: [
    { rank: 1, user_id: "u_001", full_name: "Adunni B.", hp_total: 5200, tier: "blaze" },
    { rank: 2, user_id: "u_002", full_name: "Tunde O.", hp_total: 4100, tier: "flame" },
    { rank: 3, user_id: "u_003", full_name: "Zainab M.", hp_total: 3800, tier: "flame" },
    { rank: 4, user_id: "u_004", full_name: "Chidi E.", hp_total: 3200, tier: "flame" },
    { rank: 5, user_id: "current_user", full_name: "You (John D.)", hp_total: 2900, tier: "flame", is_current_user: true },
    { rank: 6, user_id: "u_006", full_name: "Fatima A.", hp_total: 2600, tier: "flame" },
    { rank: 7, user_id: "u_007", full_name: "Emeka N.", hp_total: 2200, tier: "ember" },
    { rank: 8, user_id: "u_008", full_name: "Grace O.", hp_total: 1900, tier: "ember" },
    { rank: 9, user_id: "u_009", full_name: "Ibrahim S.", hp_total: 1500, tier: "ember" },
    { rank: 10, user_id: "u_010", full_name: "Bola A.", hp_total: 1200, tier: "ember" },
  ],
  weekly: [
    { rank: 1, user_id: "u_003", full_name: "Zainab M.", hp_total: 420, tier: "flame" },
    { rank: 2, user_id: "u_001", full_name: "Adunni B.", hp_total: 380, tier: "blaze" },
    { rank: 3, user_id: "u_005", full_name: "You (John D.)", hp_total: 290, tier: "flame", is_current_user: true },
    { rank: 4, user_id: "u_002", full_name: "Tunde O.", hp_total: 250, tier: "flame" },
    { rank: 5, user_id: "u_007", full_name: "Emeka N.", hp_total: 180, tier: "ember" },
  ],
  all_time: [
    { rank: 1, user_id: "u_100", full_name: "David K.", hp_total: 45000, tier: "holy" },
    { rank: 2, user_id: "u_101", full_name: "Sarah L.", hp_total: 38000, tier: "holy" },
    { rank: 3, user_id: "u_102", full_name: "Michael R.", hp_total: 32000, tier: "holy" },
    { rank: 4, user_id: "u_001", full_name: "Adunni B.", hp_total: 28000, tier: "blaze" },
    { rank: 5, user_id: "u_005", full_name: "You (John D.)", hp_total: 3200, tier: "flame", is_current_user: true },
  ],
};

export const MOCK_SQUAD_LEADERBOARD = [
  { rank: 1, squad_name: "Flame Squad", total_hp: 8500, squad_order_count: 12, squad_size: 5 },
  { rank: 2, squad_name: "Holy Four", total_hp: 6200, squad_order_count: 8, squad_size: 4 },
  { rank: 3, squad_name: "Team Awesome", total_hp: 5000, squad_order_count: 5, squad_size: 4 },
  { rank: 4, squad_name: "Blaze Boys", total_hp: 3800, squad_order_count: 4, squad_size: 3 },
  { rank: 5, squad_name: "Ember Elite", total_hp: 2100, squad_order_count: 3, squad_size: 4 },
];

export const MOCK_HALL_OF_FAME = [
  { period_key: "2025-07", winner: { user_id: "u_001", full_name: "Adunni B.", hp_total: 5200, streak_count: 3 } },
  { period_key: "2025-06", winner: { user_id: "u_100", full_name: "David K.", hp_total: 8100, streak_count: 4 } },
  { period_key: "2025-05", winner: { user_id: "u_003", full_name: "Zainab M.", hp_total: 6300, streak_count: 3 } },
];

export const MOCK_HP_TRANSACTIONS = [
  { id: "hpt_001", amount: 40, type: "earn", status: "pending", source: "event_checkin", reference_id: "evt_techfest", created_at: "2025-07-14T10:00:00Z" },
  { id: "hpt_002", amount: 75, type: "earn", status: "active", source: "food_order", reference_id: "ord_001", created_at: "2025-07-10T11:30:00Z" },
  { id: "hpt_003", amount: 25, type: "earn", status: "pending", source: "social_share", reference_id: "ord_001", created_at: "2025-07-10T12:00:00Z" },
  { id: "hpt_004", amount: 50, type: "spend", status: "completed", source: "order_discount", reference_id: "ord_001", created_at: "2025-07-10T10:00:00Z" },
  { id: "hpt_005", amount: 20, type: "earn", status: "pending", source: "review", reference_id: "ord_002", created_at: "2025-07-07T15:30:00Z" },
  { id: "hpt_006", amount: 28, type: "earn", status: "active", source: "food_order", reference_id: "ord_002", created_at: "2025-07-07T15:15:00Z" },
  { id: "hpt_007", amount: 25, type: "earn", status: "pending", source: "login_streak", reference_id: "streak_w2", created_at: "2025-07-07T08:00:00Z" },
  { id: "hpt_008", amount: 50, type: "earn", status: "active", source: "wallet_topup", reference_id: "wt_001", created_at: "2025-07-05T14:00:00Z" },
  { id: "hpt_009", amount: 50, type: "earn", status: "active", source: "welcome_bonus", reference_id: "ord_first", created_at: "2025-06-15T10:00:00Z" },
];

export const MOCK_WALLET_TRANSACTIONS = [
  { id: "wt_001", type: "debit", amount: 5000.00, balance_after: 0, reason: "Order payment", reference_type: "order_payment", created_at: "2025-07-10T10:00:00Z" },
  { id: "wt_002", type: "credit", amount: 10000.00, balance_after: 5000.00, reason: "Wallet top-up (Bank Transfer)", reference_type: "bank_transfer", created_at: "2025-07-09T16:00:00Z" },
  { id: "wt_003", type: "debit", amount: 2800.00, balance_after: 0, reason: "Order payment", reference_type: "order_payment", created_at: "2025-07-07T14:00:00Z" },
  { id: "wt_004", type: "credit", amount: 5000.00, balance_after: 2800.00, reason: "Wallet top-up (Card)", reference_type: "topup", created_at: "2025-07-05T14:00:00Z" },
  { id: "wt_005", type: "credit", amount: 5000.00, balance_after: 0, reason: "Refund - Order cancelled", reference_type: "refund", created_at: "2025-07-03T12:00:00Z" },
];

export const MOCK_NOTIFICATIONS = [
  { id: "ntf_001", type: "birthday", title: "🎉 Happy Birthday!", body: "Holy Grill wishes you an amazing day! You've been gifted 150 HP. Order something special!", action_url: "/hp", read_at: null, created_at: "2025-07-14T08:00:00Z", metadata: { reference_id: "bday_001", urgency: "high" } },
  { id: "ntf_002", type: "order_status", title: "Order Preparing 🔥", body: "Your order #ORD003 is now being prepared by the kitchen.", action_url: "/orders/ord_003", read_at: null, created_at: "2025-07-14T09:35:00Z", metadata: { reference_id: "ord_003", urgency: "normal" } },
  { id: "ntf_003", type: "hp_earned", title: "+40 HP (Pending)", body: "You earned 40 HP for checking in to FUTA Tech Fest 2025!", action_url: "/hp", read_at: null, created_at: "2025-07-14T10:00:00Z", metadata: { reference_id: "hpt_001", urgency: "low" } },
  { id: "ntf_004", type: "streak_reminder", title: "🔥 Login Streak Day 7!", body: "You're on a 7-day login streak! Don't break the chain — order today to keep your HP multiplier.", action_url: "/menu", read_at: "2025-07-13T08:00:00Z", created_at: "2025-07-13T08:00:00Z", metadata: { reference_id: "streak_7", urgency: "normal" } },
  { id: "ntf_005", type: "event_reminder", title: "Event Tomorrow!", body: "FUTA Tech Fest 2025 starts tomorrow at 10:00 AM. Don't forget to check in for 40 HP!", action_url: "/events/evt_techfest", read_at: "2025-07-12T18:00:00Z", created_at: "2025-07-12T18:00:00Z", metadata: { reference_id: "evt_techfest", urgency: "normal" } },
  { id: "ntf_006", type: "promo", title: "Flash Redeem Alert! ⚡", body: "Select rewards are now 50% off in HP for the next 24 hours. Tap to grab yours!", action_url: "/rewards", read_at: "2025-07-11T10:00:00Z", created_at: "2025-07-11T10:00:00Z", metadata: { reference_id: "flash_001", urgency: "low" } },
];

export const MOCK_ADDRESSES = [
  { id: "addr_001", label: "Hostel", line1: "Hall 3, North Gate, FUTA", city: "Akure", state: "Ondo", is_default: true, type: "on_campus", gate_id: "gate_north", location_id: "loc_hall3" },
  { id: "addr_002", label: "Off-Campus", line1: "12 Alagbaka Estate Road", city: "Akure", state: "Ondo", is_default: false, type: "off_campus" },
];

export const MOCK_KITCHEN_QUEUE = [
  {
    id: "ord_003", status: "preparing", notes: "Extra crispy", received_at: "2025-07-14T09:30:00Z", preparing_at: "2025-07-14T09:35:00Z",
    customer_name: "John Doe", delivery_type: "on_campus", created_at: "2025-07-14T09:30:00Z",
    delivery_windows: { label: "Morning Window" },
    order_items: [{ name_snapshot: "Holy Feast Combo", quantity: 1 }],
  },
  {
    id: "ord_004", status: "received", notes: "No onions", received_at: "2025-07-14T09:45:00Z", preparing_at: null,
    customer_name: "Adunni B.", delivery_type: "on_campus", created_at: "2025-07-14T09:45:00Z",
    delivery_windows: { label: "Morning Window" },
    order_items: [{ name_snapshot: "Holy Wings 🔥", quantity: 2 }, { name_snapshot: "Holy Fries", quantity: 1 }],
  },
  {
    id: "ord_005", status: "received", notes: "", received_at: "2025-07-14T09:50:00Z", preparing_at: null,
    customer_name: "Tunde O.", delivery_type: "off_campus", created_at: "2025-07-14T09:50:00Z",
    delivery_windows: { label: "Morning Window" },
    order_items: [{ name_snapshot: "Flame Burger", quantity: 1 }, { name_snapshot: "Crispy Plantain", quantity: 2 }],
  },
  {
    id: "ord_006", status: "ready", notes: "Extra sauce on side", received_at: "2025-07-14T09:15:00Z", preparing_at: "2025-07-14T09:20:00Z",
    customer_name: "Zainab M.", delivery_type: "on_campus", created_at: "2025-07-14T09:15:00Z",
    delivery_windows: { label: "Morning Window" },
    order_items: [{ name_snapshot: "Holy Kebabs 🔥", quantity: 3 }],
  },
];

export const MOCK_KITCHEN_SCHEDULED = {
  scheduled_orders: [
    {
      id: "ord_007", scheduled_for: "2025-07-15T10:00:00Z",
      delivery_windows: { label: "Tomorrow Morning" },
      order_items: [{ name_snapshot: "Holy Feast Combo", quantity: 2 }, { name_snapshot: "Holy Wings 🔥", quantity: 3 }],
    },
    {
      id: "ord_008", scheduled_for: "2025-07-15T10:00:00Z",
      delivery_windows: { label: "Tomorrow Morning" },
      order_items: [{ name_snapshot: "Flame Burger", quantity: 5 }],
    },
  ],
  count: 2,
};

export const MOCK_RIDER_BATCH = {
  batch: {
    id: "batch_001", zone: "North", status: "assigned",
    delivery_window: { label: "Morning Window" },
  },
  orders: [
    { id: "ord_006", customer_name: "John Doe", delivery_address: "Hall 3, North Gate", items: [{ name_snapshot: "Holy Kebabs 🔥", quantity: 3 }], distance_km: 1.2, delivery_rank: 1, delivery_hint: "Order #ORD006 — 1.2 km (deliver first)" },
    { id: "ord_009", customer_name: "Adunni B.", delivery_address: "Hall 1, North Gate", items: [{ name_snapshot: "Flame Burger", quantity: 2 }], distance_km: 1.8, delivery_rank: 2, delivery_hint: "Order #ORD009 — 1.8 km" },
    { id: "ord_010", customer_name: "Tunde O.", delivery_address: "Hall 2, North Gate", items: [{ name_snapshot: "Holy Wings 🔥", quantity: 1 }], distance_km: 2.3, delivery_rank: 3, delivery_hint: "Order #ORD010 — 2.3 km (deliver last)" },
  ],
};

export const MOCK_RIDER_EARNINGS = {
  period: "week", total_deliveries: 15, total_earnings: 7500.00,
  deliveries: [
    { order_id: "ord_006", amount: 500.00, delivered_at: "2025-07-14T11:00:00Z" },
    { order_id: "ord_011", amount: 500.00, delivered_at: "2025-07-13T11:30:00Z" },
    { order_id: "ord_012", amount: 500.00, delivered_at: "2025-07-12T12:00:00Z" },
    { order_id: "ord_013", amount: 500.00, delivered_at: "2025-07-11T10:30:00Z" },
    { order_id: "ord_014", amount: 500.00, delivered_at: "2025-07-10T11:15:00Z" },
  ],
};

export const MOCK_ADMIN_USERS = [
  { id: "u_001", full_name: "Adunni Bello", phone: "+2348012345678", role: "student", is_active: true, hp_balance: 5200, wallet_balance: 3200.00, current_tier_id: "tier_blaze" },
  { id: "u_002", full_name: "Tunde Okafor", phone: "+2348023456789", role: "student", is_active: true, hp_balance: 4100, wallet_balance: 1500.00, current_tier_id: "tier_flame" },
  { id: "u_003", full_name: "Zainab Mohammed", phone: "+2348034567890", role: "student", is_active: true, hp_balance: 3800, wallet_balance: 0, current_tier_id: "tier_flame" },
  { id: "u_004", full_name: "Chidi Eze", phone: "+2348045678901", role: "student", is_active: false, hp_balance: 3200, wallet_balance: 800.00, current_tier_id: "tier_flame" },
  { id: "u_005", full_name: "John Doe", phone: "+2348056789012", role: "student", is_active: true, hp_balance: 290, wallet_balance: 5000.00, current_tier_id: "tier_flame" },
  { id: "u_admin", full_name: "Admin User", phone: "+2348000000000", role: "admin", is_active: true, hp_balance: 0, wallet_balance: 0, current_tier_id: "tier_ember" },
  { id: "u_kitchen", full_name: "Kitchen Staff", phone: "+2348111111111", role: "kitchen", is_active: true, hp_balance: 0, wallet_balance: 0, current_tier_id: "tier_ember" },
  { id: "u_rider", full_name: "Rider Mike", phone: "+2348222222222", role: "rider", is_active: true, hp_balance: 150, wallet_balance: 7500.00, current_tier_id: "tier_ember" },
];

export const MOCK_PROMO_CODES = [
  { id: "pc_001", code: "SAVE10", discount_type: "percentage", discount_value: 10, min_order_amount: 1000.00, max_uses: 100, max_uses_per_user: 1, uses_count: 45, starts_at: "2025-07-01T00:00:00Z", ends_at: "2025-07-31T23:59:59Z", is_active: true },
  { id: "pc_002", code: "WELCOME50", discount_type: "fixed", discount_value: 500, min_order_amount: 2000.00, max_uses: 1000, max_uses_per_user: 1, uses_count: 234, starts_at: "2025-06-01T00:00:00Z", ends_at: "2025-12-31T23:59:59Z", is_active: true },
  { id: "pc_003", code: "FLAME20", discount_type: "percentage", discount_value: 20, min_order_amount: 3000.00, max_uses: 50, max_uses_per_user: 1, uses_count: 50, starts_at: "2025-07-01T00:00:00Z", ends_at: "2025-07-07T23:59:59Z", is_active: false },
];

export const MOCK_BADGES = [
  { id: "bdg_first_order", trigger_type: "first_order", trigger_value: 1, hp_award: 0, badge_icon: "🎯", name: "First Flame", description: "Placed your first order", earned: true, earned_at: "2025-06-15T10:00:00Z" },
  { id: "bdg_order_5", trigger_type: "order_count", trigger_value: 5, hp_award: 50, badge_icon: "🔥", name: "Loyal Customer", description: "Placed 5 orders", earned: true, earned_at: "2025-07-01T14:00:00Z" },
  { id: "bdg_review_3", trigger_type: "review_count", trigger_value: 3, hp_award: 60, badge_icon: "⭐", name: "Review Master", description: "Left 3 reviews", earned: true, earned_at: "2025-07-05T16:00:00Z" },
  { id: "bdg_referral_1", trigger_type: "first_referral", trigger_value: 1, hp_award: 0, badge_icon: "🤝", name: "Squad Builder", description: "Made your first referral", earned: true, earned_at: "2025-06-20T12:00:00Z" },
  { id: "bdg_event_1", trigger_type: "first_event", trigger_value: 1, hp_award: 0, badge_icon: "🎟️", name: "Event Goer", description: "Checked in to your first event", earned: true, earned_at: "2025-07-10T10:00:00Z" },
  { id: "bdg_order_10", trigger_type: "order_count", trigger_value: 10, hp_award: 100, badge_icon: "💥", name: "Blaze Master", description: "Placed 10 orders", earned: false, progress: 3, target: 10 },
  { id: "bdg_referral_5", trigger_type: "referral_count", trigger_value: 5, hp_award: 150, badge_icon: "👑", name: "Influencer", description: "Referred 5 friends", earned: false, progress: 1, target: 5 },
  { id: "bdg_squad_1", trigger_type: "first_squad", trigger_value: 1, hp_award: 0, badge_icon: "👥", name: "Squad Up", description: "Placed your first squad order", earned: false, progress: 0, target: 1 },
  { id: "bdg_streak_4", trigger_type: "order_streak_weeks", trigger_value: 4, hp_award: 80, badge_icon: "📅", name: "Streak Keeper", description: "4-week order streak", earned: false, progress: 2, target: 4 },
  { id: "bdg_graduation", trigger_type: "graduation", trigger_value: 1, hp_award: 1000, badge_icon: "🎓", name: "Graduate", description: "Self-declared graduation", earned: false, progress: 0, target: 1 },
];

export const MOCK_CHALLENGES = [
  { id: "ch_weekly_orders", name: "Weekly Flame Challenge", description: "Order 3 times this week", trigger_type: "order_count", target: 3, progress: 2, hp_award: 60, time_window: "weekly", expires_at: "2025-07-21T00:00:00Z" },
  { id: "ch_review_streak", name: "Review Streak", description: "Leave a review for your last 3 orders", trigger_type: "review_count", target: 3, progress: 1, hp_award: 40, time_window: "weekly", expires_at: "2025-07-21T00:00:00Z" },
  { id: "ch_squad_up", name: "Squad Challenge", description: "Place 2 squad orders this month", trigger_type: "squad_orders", target: 2, progress: 0, hp_award: 80, time_window: "monthly", expires_at: "2025-08-01T00:00:00Z" },
  { id: "ch_event_hopper", name: "Event Hopper", description: "Check in to 2 events this month", trigger_type: "event_checkins", target: 2, progress: 1, hp_award: 50, time_window: "monthly", expires_at: "2025-08-01T00:00:00Z" },
];

export const MOCK_ORDER_LOCKS = [
  {
    id: "lock_001", order_id: null, status: "active", discount_pct: 10,
    item_name: "Holy Feast Combo", locked_price: 4050.00, original_price: 4500.00,
    savings: 450.00, expires_at: "2025-07-21T10:00:00Z", created_at: "2025-07-14T10:00:00Z",
    reminders: [{ at: 10, sent: true }, { at: 7, sent: true }, { at: 3, sent: false }, { at: 1, sent: false }],
  },
];

export const MOCK_ANALYTICS = {
  as_of: "2025-07-14T12:00:00Z",
  today: {
    total_orders: 50,
    active_orders: 10,
    delivered_orders: 40,
    revenue_delivered: 200000.00,
    orders_by_status: { received: 3, preparing: 4, ready: 1, assigned: 2, out_for_delivery: 0, delivered: 40 },
    orders_by_payment_method: { wallet: 35, card: 12, split: 3 },
  },
  delivery_pipeline: {
    open_windows: [
      { id: "dw_morning", label: "Morning", order_count: 18 },
      { id: "dw_afternoon", label: "Afternoon", order_count: 15 },
      { id: "dw_evening", label: "Evening", order_count: 12 },
    ],
    active_batches: [
      { id: "batch_001", zone: "North", order_count: 3 },
      { id: "batch_002", zone: "South", order_count: 4 },
    ],
    unassigned_orders: 3,
  },
  sales: {
    from_date: "2025-07-01",
    to_date: "2025-07-14",
    total_revenue: 850000.00,
    order_count: 210,
    average_order_value: 4047.62,
    wallet_revenue: 620000.00,
    card_revenue: 230000.00,
  },
  items: [
    { item_name: "Holy Feast Combo", total_quantity: 85, total_revenue: 382500.00 },
    { item_name: "Holy Wings 🔥", total_quantity: 120, total_revenue: 216000.00 },
    { item_name: "Flame Burger", total_quantity: 75, total_revenue: 187500.00 },
    { item_name: "Holy Cut 🔥", total_quantity: 60, total_revenue: 120000.00 },
    { item_name: "Holy Fries", total_quantity: 95, total_revenue: 95000.00 },
  ],
  users: { dau: 200, mau: 1500, by_tier: { ember: 500, flame: 300, blaze: 150, holy: 50 } },
  retention: [{ cohort: "2025-06", week_1: 80, week_2: 60, week_4: 40 }, { cohort: "2025-07", week_1: 85, week_2: 70, week_4: null }],
};

export const MOCK_REDEMPTIONS = [
  { id: "rdm_001", status: "fulfilled", hp_cost_snapshot: 200, created_at: "2025-07-05T15:00:00Z", rewards: { name: "Free Holy Cut" } },
  { id: "rdm_002", status: "pending", hp_cost_snapshot: 100, created_at: "2025-07-12T18:00:00Z", rewards: { name: "Free Holy Fries" } },
];

export const FEATURE_FLAGS = [
  // Spec §20 feature flags (DB-configurable, override env)
  { feature_name: "squad_order_enabled", is_active: true, description: "Squad ordering flow — when false, squad fields ignored" },
  { feature_name: "hp_multiplier_active", is_active: true, description: "Live HP earn multiplier (1x/2x/3x) — value set in system settings" },
  { feature_name: "ordering_window_open_time", is_active: true, description: "Ordering open time toggle (WAT)" },
  { feature_name: "ordering_window_close_time", is_active: true, description: "Ordering close time toggle (WAT)" },
  { feature_name: "spin_prizes", is_active: true, description: "Spin wheel enabled with configured prizes" },
  { feature_name: "monthly_pending_cap", is_active: true, description: "Monthly free-activity HP cap enforcement" },
  { feature_name: "hp_transfer_min_orders", is_active: true, description: "Min completed orders gate for P2P HP transfer" },
  { feature_name: "order_lock_max_discount", is_active: true, description: "Order-lock max % discount enforcement" },
  { feature_name: "graduation_min_level", is_active: true, description: "Academic-level gate for graduation HP claim" },
  // Legacy product flags
  { feature_name: "leaderboard_prizes", is_active: true, description: "Prize payout logic after monthly reset" },
  { feature_name: "free_side_credits", is_active: true, description: "Free side credit issuance at checkout" },
  { feature_name: "exclusive_spin", is_active: true, description: "Exclusive spin for top-10 leaderboard" },
  { feature_name: "hall_of_fame", is_active: true, description: "Hall of Fame data recording" },
  { feature_name: "badge_system", is_active: true, description: "Badge engine — award logic, HP triggers" },
  { feature_name: "marketplace_general", is_active: false, description: "Opens marketplace to students" },
  { feature_name: "hp_transfer", is_active: false, description: "Peer-to-peer HP transfer" },
  { feature_name: "flash_redemptions", is_active: false, description: "Time-limited HP discount drops" },
  { feature_name: "referral_milestones", is_active: true, description: "Milestone HP awards (5, 10, 20…)" },
  { feature_name: "subscription_codes", is_active: false, description: "Subscription code redemption" },
  { feature_name: "hp_expiry_warnings", is_active: true, description: "Depreciation warning push notifications" },
  { feature_name: "birthday_hp", is_active: true, description: "Automatic birthday HP award job" },
  { feature_name: "scheduled_orders", is_active: true, description: "Future order scheduling" },
  { feature_name: "abandoned_cart_nudge", is_active: false, description: "Recovery nudge after 30 min inactivity" },
  { feature_name: "daily_checkin", is_active: true, description: "Explicit daily check-in button" },
  { feature_name: "event_ticket_tiers", is_active: true, description: "Multi-tier event ticket pricing" },
];

export const MOCK_SYSTEM_SETTINGS = [
  // HP economy amounts (spec §11 — configurable via env / system_settings)
  { key: "signup_bonus_hp", value: 0, description: "HP awarded on registration" },
  { key: "welcome_bonus_hp", value: 50, description: "HP awarded on first order delivered" },
  { key: "referral_hp", value: 75, description: "HP for referrer on referee's first delivered order" },
  { key: "birthday_hp", value: 150, description: "HP awarded on user birthday (cron)" },
  { key: "review_hp", value: 20, description: "HP awarded per order review" },
  { key: "social_share_hp", value: 25, description: "HP per social share (daily)" },
  { key: "event_checkin_hp", value: 40, description: "Default HP per event check-in" },
  { key: "wallet_topup_hp", value: 5, description: "HP per wallet top-up" },
  // HP economy caps & limits (spec §11, §20)
  { key: "monthly_pending_cap", value: 800, description: "Max pending HP per user per month" },
  { key: "hp_transfer_min_orders", value: 3, description: "Min completed orders to transfer HP" },
  { key: "hp_transfer_min_amount", value: 10, description: "Minimum HP in P2P transfer" },
  { key: "spin_cost_hp", value: 10, description: "HP cost for non-first spins" },
  { key: "graduation_min_level", value: 400, description: "Min academic level to claim graduation HP" },
  { key: "order_lock_max_discount", value: 50, description: "Max % discount on order locks" },
  // Wallet & ordering (spec §7, §20)
  { key: "min_topup_amount", value: 500, description: "Minimum wallet top-up (NGN)" },
  { key: "min_withdrawal_amount", value: 1000, description: "Minimum withdrawal (NGN) — withdrawal UI disabled" },
  { key: "ordering_window_open_time", value: "08:00", description: "HH:MM (WAT) when ordering opens" },
  { key: "ordering_window_close_time", value: "16:00", description: "HH:MM (WAT) when ordering closes" },
  // Feature toggles stored as settings (spec §20)
  { key: "squad_order_enabled", value: true, description: "Enable squad ordering flow" },
  { key: "hp_multiplier_active", value: 1, description: "Live HP multiplier (1x, 2x, 3x)" },
  { key: "spin_prizes", value: ["5 HP", "10 HP", "25 HP", "50 HP", "100 HP", "200 HP"], description: "JSON array of spin wheel prizes" },
  // Notifications (spec §8)
  { key: "notification_gap_minutes", value: 30, description: "Min minutes between push notifications" },
  { key: "notification_daily_cap", value: 10, description: "Max pushes per user per day" },
  // Legacy display config
  { key: "free_side_options", value: ["Fries", "Coleslaw", "Plantain", "Gizzard"], description: "Available free side choices" },
];

export const MOCK_DELIVERY_BATCHES = [
  { id: "batch_001", window_id: "dw_morning", rider_id: "u_rider", rider_name: "Rider Mike", zone: "North Campus", status: "out_for_delivery", order_count: 3, created_at: "2025-07-14T11:00:00Z" },
  { id: "batch_002", window_id: "dw_morning", rider_id: null, rider_name: null, zone: "South Campus", status: "assigned", order_count: 4, created_at: "2025-07-14T12:00:00Z" },
  { id: "batch_003", window_id: "dw_afternoon", rider_id: null, rider_name: null, zone: "East Campus", status: "pending", order_count: 0, created_at: null },
];

export const MOCK_ABANDONED_CARTS = [
  { id: "cart_001", user_id: "u_002", user_name: "Tunde Okafor", item_count: 2, total_value: 4500.00, last_activity: "2025-07-14T11:20:00Z", nudged: false },
  { id: "cart_002", user_id: "u_003", user_name: "Zainab Mohammed", item_count: 1, total_value: 2500.00, last_activity: "2025-07-14T10:45:00Z", nudged: true },
  { id: "cart_003", user_id: "u_004", user_name: "Chidi Eze", item_count: 3, total_value: 6800.00, last_activity: "2025-07-14T09:30:00Z", nudged: false },
];

// 14-day sales trend for charts
export const MOCK_SALES_TREND = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date("2025-07-14");
  date.setDate(date.getDate() - (13 - i));
  const base = 18000 + Math.round(Math.sin(i / 2) * 6000) + i * 1200;
  const revenue = Math.max(8000, base + Math.round(Math.random() * 4000));
  return {
    date: date.toISOString().slice(5, 10),
    revenue,
    orders: Math.round(revenue / 4200),
    wallet_revenue: Math.round(revenue * 0.72),
    card_revenue: Math.round(revenue * 0.28),
  };
});

export const MOCK_HP_ECONOMY = {
  issued_total: 124500,
  issued_30day: 28400,
  spent_30day: 19800,
  expired_30day: 4200,
  active_balance_all_users: 86500,
  pending_balance_all_users: 14200,
  trend: MOCK_SALES_TREND.map((d) => ({ date: d.date, issued: Math.round(d.revenue / 100), spent: Math.round(d.revenue / 200) })),
};

export const MOCK_REFERRAL_ANALYTICS = {
  total_referrals: 84,
  completed_referrals: 61,
  completion_rate: 72.6,
  hp_awarded: 4575,
  trend: MOCK_SALES_TREND.map((d) => ({ date: d.date, referrals: Math.round(2 + Math.random() * 5) })),
};

export const MOCK_DEPARTMENTS = [
  { id: "dept_cs", name: "Computer Science", faculty: "SE", is_active: true },
  { id: "dept_ece", name: "Electrical & Computer Engineering", faculty: "SE", is_active: true },
  { id: "dept_me", name: "Mechanical Engineering", faculty: "SE", is_active: true },
  { id: "dept_cve", name: "Civil Engineering", faculty: "SE", is_active: true },
  { id: "dept_bio", name: "Biology", faculty: "SS", is_active: true },
  { id: "dept_acc", name: "Accounting", faculty: "SMS", is_active: true },
  { id: "dept_arch", name: "Architecture", faculty: "SE", is_active: true },
];

export const MOCK_ACADEMIC_LEVELS = [
  { id: "lvl_100", name: "100 Level", value: 100, is_active: true },
  { id: "lvl_200", name: "200 Level", value: 200, is_active: true },
  { id: "lvl_300", name: "300 Level", value: 300, is_active: true },
  { id: "lvl_400", name: "400 Level", value: 400, is_active: true },
  { id: "lvl_500", name: "500 Level", value: 500, is_active: true },
];

export const MOCK_BANNERS = [
  { id: "bnr_home", slot: "home_hero", title: "Welcome to Holy Grill", subtitle: "Flame-grilled. Earn HP. Own the leaderboard.", image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=1200&q=80", active: true },
  { id: "bnr_menu_top", slot: "menu_top", title: "Daily Specials", subtitle: "Holy Wings at 10% off this week", image_url: null, active: true },
  { id: "bnr_rewards", slot: "rewards_top", title: "Redeem your HP", subtitle: "Fries, wings, combos all yours.", image_url: null, active: false },
];

export const MOCK_EARLY_SUPPORTERS = [
  { id: "es_001", user_id: "u_005", full_name: "John Doe", joined_at: "2025-06-15", badge_awarded: true, bonus_hp: 100 },
  { id: "es_002", user_id: "u_001", full_name: "Adunni Bello", joined_at: "2025-06-16", badge_awarded: true, bonus_hp: 100 },
];

export const MOCK_LEADERBOARD_PRIZES = [
  { id: "lp_m1", period_key: "monthly", rank: 1, prize: "₦5,000 wallet credit + 200 HP", hp_award: 200, wallet_award: 5000, is_active: true },
  { id: "lp_m2", period_key: "monthly", rank: 2, prize: "₦3,000 wallet credit + 100 HP", hp_award: 100, wallet_award: 3000, is_active: true },
  { id: "lp_m3", period_key: "monthly", rank: 3, prize: "₦1,500 wallet credit + 50 HP", hp_award: 50, wallet_award: 1500, is_active: true },
  { id: "lp_w1", period_key: "weekly", rank: 1, prize: "Free Holy Cut + 30 HP", hp_award: 30, wallet_award: 0, is_active: true },
];

export const MOCK_HALL_OF_FAME_REWARDS = [
  { id: "hfr_001", period_label: "Monthly Champion", reward_type: "wallet", amount: 10000, is_active: true },
  { id: "hfr_002", period_label: "Monthly Runner-up", reward_type: "wallet", amount: 5000, is_active: true },
  { id: "hfr_003", period_label: "3-Month Streak Holder", reward_type: "hp", amount: 500, is_active: false },
];

export const MOCK_NOTIFICATION_BLASTS = [
  { id: "nb_001", segment: "all", title: "Flash Redeem Alert!", body: "50% off HP for select rewards for 24h only!", sent_at: "2025-07-11T10:00:00Z", recipients: 1500 },
  { id: "nb_002", segment: "tier_holy", title: "VIP Spin Available", body: "Exclusive spin now live for Holy tier members.", sent_at: "2025-07-09T14:00:00Z", recipients: 50 },
];

export const MOCK_FIRST_ORDER_GIFT = {
  enabled: true,
  welcome_bonus_hp: 50,
  gift_item_id: "mi_fries",
  gift_item_name: "Holy Fries",
  reward_hp_on_first_order: 0,
};

export const MOCK_GRADUATION_CLAIMS = [
  { id: "grd_001", user_id: "u_001", full_name: "Adunni Bello", department: "Computer Science", level: "500", claimed_at: "2025-07-12T09:00:00Z", status: "pending", evidence_url: null, hp_awarded: 0 },
  { id: "grd_002", user_id: "u_003", full_name: "Zainab Mohammed", department: "Biology", level: "400", claimed_at: "2025-07-10T11:00:00Z", status: "approved", hp_awarded: 1000 },
];

export const MOCK_LISTING_REQUESTS = [
  { id: "lr_001", user_id: "u_002", user_name: "Tunde Okafor", listing_type: "product", title: "Graphing Calculator FX-991", price: 8000, hp_price: 80, submitted_at: "2025-07-13T10:00:00Z", status: "pending" },
  { id: "lr_002", user_id: "u_004", user_name: "Chidi Eze", listing_type: "digital", title: "50GB Data Code", price: 10000, hp_price: 100, submitted_at: "2025-07-12T15:00:00Z", status: "approved" },
];

export const MOCK_KITCHEN_SETTINGS = {
  daily_order_capacity: 200,
  is_accepting_orders: true,
  ordering_window_open_time: "08:00",
  ordering_window_close_time: "16:00",
  avg_prep_target_minutes: 15,
  auto_assign_riders: true,
};

export const MOCK_RIDER_HISTORY = [
  { id: "hist_001", order_id: "ord_001", customer_name: "John Doe", delivery_address: "Hall 3, North Gate", delivered_at: "2025-07-10T11:30:00Z", amount: 500.00, distance_km: 1.2, status: "delivered" },
  { id: "hist_002", order_id: "ord_002", customer_name: "Adunni B.", delivery_address: "Hall 5, South Gate", delivered_at: "2025-07-07T15:15:00Z", amount: 500.00, distance_km: 2.1, status: "delivered" },
  { id: "hist_003", order_id: "ord_011", customer_name: "Tunde O.", delivery_address: "Hall 1, North Gate", delivered_at: "2025-07-13T11:30:00Z", amount: 500.00, distance_km: 1.5, status: "delivered" },
  { id: "hist_004", order_id: "ord_012", customer_name: "Zainab M.", delivery_address: "Albert Ilemobade Library, West Gate", delivered_at: "2025-07-12T12:00:00Z", amount: 500.00, distance_km: 0.8, status: "delivered" },
  { id: "hist_005", order_id: "ord_015", customer_name: "Emeka N.", delivery_address: "Hall 2, North Gate", delivered_at: "2025-07-09T13:00:00Z", amount: 500.00, distance_km: 1.9, status: "delivery_attempted" },
];

// On-campus hostels with delivery fee (spec: GET /delivery/hostels -> {id,name,delivery_fee})
export const MOCK_DELIVERY_HOSTELS = ON_CAMPUS_LOCATIONS.map((loc, i) => ({
  id: loc.id,
  name: loc.name,
  gate_id: loc.gate_id,
  delivery_fee: 300,
}));

// Off-campus gates with base fee (spec: GET /delivery/gates -> {id,name,base_fee})
export const MOCK_DELIVERY_GATES = ON_CAMPUS_GATES.map((g) => ({
  ...g,
  base_fee: 400,
}));

// Newsletter subscribers (spec: GET /storefront/newsletter — admin)
export const MOCK_NEWSLETTER_SUBSCRIBERS = [
  { id: "sub_001", email: "aderemi@futa.edu.ng", full_name: "Aderemi O.", source: "home", subscribed_at: "2025-07-13T10:00:00Z" },
  { id: "sub_002", email: "bola@gmail.com", full_name: "Bola A.", source: "footer", subscribed_at: "2025-07-11T14:00:00Z" },
  { id: "sub_003", email: "chioma@futa.edu.ng", full_name: "Chioma E.", source: "home", subscribed_at: "2025-07-09T09:00:00Z" },
];

// First-order gifts to fulfill (spec: GET /admin/first-order-gifts, PATCH /admin/first-order-gifts/:id)
export const MOCK_FIRST_ORDER_GIFTS = [
  { id: "fog_001", user_id: "u_002", user_name: "Tunde Okafor", gift_item_name: "Holy Fries", order_id: "ord_002", status: "pending", created_at: "2025-07-07T15:15:00Z" },
  { id: "fog_002", user_id: "u_003", user_name: "Zainab Mohammed", gift_item_name: "Holy Fries", order_id: "ord_004", status: "fulfilled", created_at: "2025-06-20T12:00:00Z" },
  { id: "fog_003", user_id: "u_004", user_name: "Chidi Eze", gift_item_name: "Holy Fries", order_id: "ord_005", status: "pending", created_at: "2025-07-01T16:00:00Z" },
];

// Admin-managed challenges + badges (spec: GET/POST/PATCH/DELETE /challenges/admin)
export const MOCK_CHALLENGES_ADMIN = [
  { id: "ms_order5", title: "Order Streak", description: "Place 5 orders this week", trigger_type: "orders_count", trigger_value: 5, hp_awarded: 60, time_window: "weekly", is_active: true, completions: 42 },
  { id: "ms_hp1000", title: "HP Earner", description: "Earn 1000 HP this month", trigger_type: "hp_earned", trigger_value: 1000, hp_awarded: 100, time_window: "monthly", is_active: true, completions: 18 },
  { id: "ms_ref3", title: "Squad Builder", description: "Refer 3 friends", trigger_type: "referrals_count", trigger_value: 3, hp_awarded: 150, time_window: null, is_active: true, completions: 9 },
  { id: "ms_review3", title: "Review Master", description: "Leave 3 reviews", trigger_type: "reviews_count", trigger_value: 3, hp_awarded: 60, time_window: "weekly", is_active: false, completions: 27 },
  { id: "bdg_first", title: "First Flame", description: "Placed your first order", trigger_type: "orders_count", trigger_value: 1, hp_awarded: 0, time_window: null, is_active: true, is_badge: true, completions: 312 },
  { id: "bdg_follow", title: "Social Follow", description: "Followed Holy Grills on social", trigger_type: "social_follow", trigger_value: 1, hp_awarded: 25, time_window: null, is_active: true, is_badge: true, completions: 188 },
];

// Per-promo usage log (spec: GET /admin/promo-codes/:id/uses)
export const MOCK_PROMO_CODE_USES = [
  { id: "use_001", user_id: "u_001", user_name: "Adunni Bello", order_id: "ord_001", discount_applied: 520, used_at: "2025-07-10T10:00:00Z" },
  { id: "use_002", user_id: "u_005", user_name: "John Doe", order_id: "ord_003", discount_applied: 450, used_at: "2025-07-08T11:00:00Z" },
  { id: "use_003", user_id: "u_002", user_name: "Tunde Okafor", order_id: "ord_006", discount_applied: 500, used_at: "2025-07-05T13:00:00Z" },
];

// HP economy report (spec: GET /admin/hp/report)
export const MOCK_HP_REPORT = {
  active_balance_all_users: 86500,
  pending_balance_all_users: 14200,
  issued_30day: 28400,
  spent_30day: 19800,
  expired_30day: 4200,
  transferred_30day: 3200,
  monthly_cap_per_user: 800,
  by_source_30day: {
    food_order: 12400, review: 2400, referral: 5400, welcome_bonus: 1800,
    birthday: 900, social_share: 2100, event_checkin: 2600, spin_wheel: 800, admin_grant: 1200,
  },
  top_holders: [
    { user_id: "u_001", full_name: "Adunni Bello", active: 5200, tier: "blaze" },
    { user_id: "u_002", full_name: "Tunde Okafor", active: 4100, tier: "flame" },
    { user_id: "u_003", full_name: "Zainab Mohammed", active: 3800, tier: "flame" },
  ],
};