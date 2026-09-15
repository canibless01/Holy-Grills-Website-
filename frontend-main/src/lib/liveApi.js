// HolyGrill Live API — drop-in replacement for mockApi that calls the real backend.
// Every method mirrors mockApi's signature so components only change their import.
// Base URL + JWT token handling live in ./apiClient. Verified against the live
// backend at https://holy-grills-backend.onrender.com/api (Aug 2026).
import { apiClient, ApiError, login as apiLogin, clearTokens, isAuthenticated } from './apiClient';
import { getOrderCustomer } from './hgUtils';

// Many list endpoints wrap the array in a keyed object (e.g. { hostels: [...] },
// { departments: [...] }, { levels: [...] }). This pulls the array out so every
// admin list view receives a plain array and `.map()` never crashes.
const unwrap = (res, ...keys) => {
  if (Array.isArray(res)) return res;
  for (const k of keys) {
    if (res && Array.isArray(res[k])) return res[k];
  }
  return [];
};

// Endpoints documented in the API guide but NOT implemented on the live backend
// (verified 404). Reads degrade to an empty list so panels render an honest empty
// state; writes fail loudly so an action is never silently dropped.
const naList = () => [];
const naWrite = (method) => () => {
  throw new ApiError(404, `${method} — not implemented on the live backend yet`);
};

// ========== AUTH ==========
const auth = {
  async login(body) {
    const data = await apiLogin(body.email, body.password);
    return data;
  },
  async me() { return apiClient.get('/auth/me'); },
  async register(body) { return apiClient.post('/auth/register', body); },
  async refresh() { return apiClient.post('/auth/refresh', { refresh_token: localStorage.getItem('hg_refresh_token') }); },
  async updateProfile(body) { return apiClient.patch('/auth/profile', body); },
  async changePassword(body) { return apiClient.post('/auth/change-password', body); },
  async logout() { const r = await apiClient.post('/auth/logout'); clearTokens(); return r; },
  async logoutAll() { const r = await apiClient.post('/auth/logout-all-devices'); clearTokens(); return r; },
  async deleteAccount(body) { const r = await apiClient.delete('/auth/account'); clearTokens(); return r; },
  async resetPassword(body) { return apiClient.post('/auth/reset-password', body); },
  async verifyEmail(body) { return apiClient.post('/auth/verify-email', body); },
  async deviceToken(body) { return apiClient.post('/auth/device-token', body); },
  async getStreak() { return apiClient.get('/auth/streak'); },
  async dailyCheckin() { return apiClient.post('/checkin'); },
  async getCheckinHistory() {
    const res = await apiClient.get('/checkin/history');
    // Spec: { checkins, total, checked_in_today } — preserve the full object so
    // consumers can read checked_in_today + total, not just the array.
    if (res && typeof res === 'object' && !Array.isArray(res)) {
      const checkins = res.checkins || res.history || [];
      return { checkins, total: res.total ?? checkins.length, checked_in_today: res.checked_in_today ?? false, ...res };
    }
    return { checkins: Array.isArray(res) ? res : [], total: Array.isArray(res) ? res.length : 0, checked_in_today: false };
  },
};

// ========== ADDRESSES ==========
const addresses = {
  async list() { return apiClient.get('/auth/addresses'); },
  async create(body) { return apiClient.post('/auth/addresses', body); },
  async update(id, body) { return apiClient.patch(`/auth/addresses/${id}`, body); },
  async delete(id) { return apiClient.delete(`/auth/addresses/${id}`); },
};

// ========== MENU ==========
const menu = {
  async getItems(params = {}) { return apiClient.get('/menu/items', params); },
  async getItem(id) { return apiClient.get(`/menu/items/${id}`); },
  async getAddons(id) { return apiClient.get(`/menu/items/${id}/addons`); },
  async getCategories() { return apiClient.get('/menu/categories'); },
  async getGlobalAddons() { return apiClient.get('/menu/addons'); },
  async getKitchenCapacity() { return apiClient.get('/menu/kitchen-capacity'); },
};

// ========== CART ==========
const cart = {
  async get() { return apiClient.get('/cart'); },
  async add(body) { return apiClient.post('/cart', body); },
  async update(itemId, body) { return apiClient.patch(`/cart/${itemId}`, body); },
  async remove(itemId) { return apiClient.delete(`/cart/${itemId}`); },
  async clear() { return apiClient.delete('/cart'); },
};

// ========== ORDERS ==========
// Normalise a live order to the shape the student pages expect
// (order_items[].name_snapshot / delivery_address.line1 / delivery_window.label).
const normOrder = (o) => {
  if (!o) return o;
  const items = (o.order_items || o.items || []).map((it) => ({
    ...it,
    name_snapshot: it.name_snapshot || it.name,
    quantity: it.quantity || 1,
    line_total: it.line_total ?? (it.unit_price || it.price_snapshot || it.price || 0) * (it.quantity || 1),
  }));
  return {
    ...o,
    order_items: items,
    items,
    delivery_address: o.delivery_address || (o.delivery_location ? { line1: typeof o.delivery_location === 'string' ? o.delivery_location : o.delivery_location.name } : { line1: '' }),
    delivery_window: o.delivery_window || o.delivery_windows || null,
    total_amount: o.total_amount ?? o.total ?? 0,
  };
};
const orders = {
  async create(body) {
    const res = await apiClient.post('/orders', body);
    return normOrder(res?.order || res);
  },
  async list(params = {}) { return unwrap(await apiClient.get('/orders', params), 'orders'); },
  async get(id, params = {}) { return normOrder(await apiClient.get(`/orders/${id}`, params)); },
  async updateStatus(id, body) { return apiClient.patch(`/orders/${id}/status`, body); },
  async walk(id, body) { return apiClient.post(`/orders/${id}/walk`, body); },
  async cancel(id, body) { return apiClient.post(`/orders/${id}/cancel`, body); },
  async review(id, body) { return apiClient.post(`/orders/${id}/review`, body); },
  async validatePromo(body) { return apiClient.post('/orders/validate-promo', body); },
  async getDeliveryWindows() { return apiClient.get('/orders/delivery-windows'); },
  async getDeliveryWindowStatus() {
    const res = await apiClient.get('/orders/delivery-windows/status');
    const windows = res.available_windows || res.windows || res.scheduled_windows || [];
    const open = windows.filter((w) => w.status === 'open');
    // Backend returns next_window_starts_at (timestamp) when closed — normalise
    // into a next_window object so the KitchenClosedPopup countdown can read it.
    const nextStartsAt = res.next_window_starts_at || res.next_window?.starts_at || null;
    return {
      is_open: res.is_open ?? open.length > 0,
      active_window: res.active_window || open[0] || null,
      can_schedule: res.can_schedule ?? true,
      scheduled_windows: res.scheduled_windows || windows,
      available_windows: windows,
      next_window: res.next_window || (nextStartsAt ? { starts_at: nextStartsAt } : null),
      next_window_starts_at: nextStartsAt,
      message: res.message || (res.is_open ? 'Ordering is open' : 'Ordering is currently closed. You can schedule for a future window.'),
    };
  },
  async reorder(id) { return apiClient.post(`/orders/${id}/reorder`); },
  async share(id, body) { return apiClient.post(`/orders/${id}/share`, body); },
  async addSquadMembers(id, body) { return apiClient.post(`/orders/${id}/squad-members`, body); },
  async refund(id, body) { return apiClient.post(`/orders/${id}/refund`, body); },
  async getHistory(id) { return apiClient.get(`/orders/${id}/history`); },
  async shareHp(id, body) { return apiClient.post(`/orders/${id}/share-hp`, body); },
  // Guest order claiming — one-time link of a guest order to a registered account.
  async claim(id, body) { return apiClient.post(`/orders/${id}/claim`, body); },
  // Active orders only — dedicated endpoint (orders.py /api/orders/active).
  async getActive() { return unwrap(await apiClient.get('/orders/active'), 'orders'); },
  // Cancel a scheduled (future-window) order — DELETE /api/orders/{id}/scheduled.
  async cancelScheduled(id) { return apiClient.delete(`/orders/${id}/scheduled`); },
};

// ========== EVENTS ==========
const events = {
  async list() { return apiClient.get('/events'); },
  async get(id) { return apiClient.get(`/events/${id}`); },
  async register(id, body) { return apiClient.post(`/events/${id}/register`, body); },
  async checkin(id, body) { return apiClient.post(`/events/${id}/checkin`, body); },
  async generateQR(id) { return apiClient.post(`/events/${id}/qr`); },
  async cateringRequest(body) { return apiClient.post('/events/catering-requests', body); },
  async getTiers(id) { return unwrap(await apiClient.get(`/events/${id}/tiers`), 'tiers'); },
};

// ========== HP ==========
const hp = {
  async getBalance() { return apiClient.get('/hp/balance'); },
  async getTransactions(params = {}) { return apiClient.get('/hp/transactions', params); },
  async getTiers() { return apiClient.get('/hp/tiers'); },
  async transfer(body) { return apiClient.post('/hp/transfer', body); },
  async spin() { return apiClient.post('/hp/spin'); },
  async flashRedeem(rewardId) { return apiClient.post(`/hp/flash-redeem/${rewardId}`); },
  async getSpinHistory(params = {}) { return unwrap(await apiClient.get('/hp/spin/history', params), 'spins', 'history'); },
  async getUnlockHistory(params = {}) { return unwrap(await apiClient.get('/hp/unlock-history', params), 'unlocks', 'history'); },
  // Exclusive Spin — the leaderboard spin. Top earners get free spins (30-day
  // expiry); the prizes are the exclusive gift set (free items, HP jackpots,
  // Double-HP badge). There is no buy-extra-spin option.
  async getExclusiveSpinStatus() { return apiClient.get('/exclusive-spin'); },
  async exclusiveSpin() { return apiClient.post('/exclusive-spin/spin'); },
  async getExclusiveSpinHistory(params = {}) { return unwrap(await apiClient.get('/hp/exclusive-spin/history', params), 'spins', 'history'); },
};

// ========== REWARDS ==========
const rewards = {
  async list(params = {}) { return apiClient.get('/rewards', params); },
  async redeem(rewardId) { return apiClient.post(`/rewards/${rewardId}/redeem`); },
  async getRedemptions() { return apiClient.get('/rewards/redemptions'); },
  // Free side credits — count + 60-day expiry shown in Profile / Rewards Dashboard,
  // decremented server-side when a free side is spent at checkout.
  async getFreeSideCredits() { return apiClient.get('/rewards/free-side-credits'); },
};

// ========== MARKETPLACE ==========
const marketplace = {
  async list(params = {}) { return apiClient.get('/marketplace', params); },
  async purchase(listingId, body) { return apiClient.post(`/marketplace/${listingId}/purchase`, body); },
  // Student "request a product" — POST /api/marketplace/requests (marketplace.py).
  async request(body) { return apiClient.post('/marketplace/requests', body); },
};

// ========== WALLET ==========
const wallet = {
  async get() { return apiClient.get('/wallet'); },
  async fundCard(body) { return apiClient.post('/wallet/fund/card', body); },
  async fundBank(body) { return apiClient.post('/wallet/fund/bank', body); },
  async withdraw(body) { return apiClient.post('/wallet/withdraw', body); },
  async getTransactions(params = {}) { return apiClient.get('/wallet/transactions', params); },
  async verify(reference) { return apiClient.get(`/wallet/verify/${reference}`); },
};

// ========== NOTIFICATIONS ==========
const notifications = {
  async list(params = {}) { return apiClient.get('/notifications', params); },
  async markRead(id) { return apiClient.post(`/notifications/${id}/read`); },
  async markAllRead() { return apiClient.post('/notifications/read-all'); },
  async getPreferences() { return apiClient.get('/notifications/preferences'); },
  async updatePreferences(body) { return apiClient.patch('/notifications/preferences', body); },
};

// ========== LEADERBOARD ==========
const leaderboard = {
  async get(params = {}) { return apiClient.get('/leaderboard', params); },
  async getMyRank(params = {}) { return apiClient.get('/leaderboard/my-rank', params); },
  async getSquad(params = {}) { return apiClient.get('/leaderboard/squad', params); },
  async getHallOfFame() { return apiClient.get('/leaderboard/hall-of-fame'); },
  // Shareable Hall of Fame inductee card — GET /api/leaderboard/hall-of-fame/inductees/{id}/card.
  async getHallOfFameCard(id) { return apiClient.get(`/leaderboard/hall-of-fame/inductees/${id}/card`); },
  // Leaderboard prizes — free sides + exclusive spin per rank, shown as medals.
  async getPrizes(params = {}) { return unwrap(await apiClient.get('/leaderboard/prizes', params), 'prizes'); },
};

// Normalise a kitchen order's item list to the shape the Kitchen panel expects
// (it reads order.order_items[].name_snapshot / received_at / delivery_windows.label).
const normKitchenOrder = (o) => {
  const c = getOrderCustomer(o);
  return {
    ...o,
    order_items: (o.order_items || o.items || []).map((it) => ({ ...it, name_snapshot: it.name_snapshot || it.name, quantity: it.quantity || 1 })),
    received_at: o.received_at || o.created_at,
    delivery_windows: o.delivery_windows || o.delivery_window,
    customer_name: c.display,
    customer_phone: c.phone,
  };
};

// ========== KITCHEN ==========
const kitchen = {
  // /kitchen/queue may return a flat array, a {received, preparing, ready} status
  // map, or an explicit wrapper ({orders|queue|data|items: [...]}). Flatten all
  // of them to a plain array. As a safety net we also pull /orders/active and
  // merge any kitchen-relevant orders (received/preparing/ready) that the queue
  // endpoint missed — this is the fix for the bug where a freshly placed order
  // showed on Admin but never reached the Kitchen queue.
  async getQueue(params = {}) {
    let arr = [];
    try {
      const res = await apiClient.get('/kitchen/queue', params);
      if (Array.isArray(res)) {
        arr = res;
      } else if (res && typeof res === 'object') {
        for (const k of ['orders', 'queue', 'data', 'items']) {
          if (Array.isArray(res[k])) arr = arr.concat(res[k].map((o) => ({ ...o, status: o.status || 'received' })));
        }
        if (!arr.length) {
          for (const status of Object.keys(res)) {
            if (Array.isArray(res[status])) arr = arr.concat(res[status].map((o) => ({ ...o, status: o.status || status })));
          }
        }
      }
    } catch (e) { arr = []; }

    // Fallback merge — active orders the queue endpoint may have missed.
    const kitchenStatuses = ['received', 'preparing', 'ready'];
    try {
      let active = await apiClient.get('/orders/active');
      if (active && !Array.isArray(active)) active = active.orders || active.active_orders || [];
      active = (active || []).filter((o) => kitchenStatuses.includes(o.status));
      // Kitchen queue wins on conflicts; active fills any gaps.
      const byId = new Map();
      for (const o of active) byId.set(o.id, o);
      for (const o of arr) byId.set(o.id, o);
      arr = Array.from(byId.values());
    } catch (e) { /* active endpoint unavailable — keep queue result */ }

    const rank = { received: 0, preparing: 1, ready: 2 };
    arr.sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || new Date(a.received_at || a.created_at) - new Date(b.received_at || b.created_at));
    return arr.map(normKitchenOrder);
  },
  async getScheduled() {
    const res = await apiClient.get('/kitchen/scheduled');
    if (Array.isArray(res)) return { count: res.length, scheduled_orders: res.map(normKitchenOrder) };
    if (res && Array.isArray(res.scheduled_orders)) return { ...res, scheduled_orders: res.scheduled_orders.map(normKitchenOrder) };
    if (res && Array.isArray(res.orders)) return { count: res.count ?? res.orders.length, scheduled_orders: res.orders.map(normKitchenOrder) };
    return { count: 0, scheduled_orders: [] };
  },
  async getBatchSummary(windowId) {
    const res = await apiClient.get(`/kitchen/batch-summary/${windowId}`);
    if (res && Array.isArray(res.summary)) return res;
    if (res && Array.isArray(res.items)) return { total_orders: res.total_orders ?? res.items.length, summary: res.items.map((i) => ({ item_name: i.item_name || i.name, total_quantity: i.total_quantity || i.quantity || 0 })) };
    return { total_orders: (res && res.total_orders) || 0, summary: (res && res.summary) || [] };
  },
  async getMetrics() { return apiClient.get('/kitchen/metrics'); },
  async getWindows() { return unwrap(await apiClient.get('/kitchen/windows'), 'windows'); },
  async getSettings() {
    const res = await apiClient.get('/kitchen/settings');
    return {
      is_accepting_orders: res?.is_accepting_orders ?? true,
      is_closed_for_day: res?.is_closed_for_day ?? res?.closed_for_day ?? false,
      daily_order_capacity: res?.daily_order_capacity ?? 100,
      ordering_window_open_time: res?.ordering_window_open_time ?? '08:00',
      ordering_window_close_time: res?.ordering_window_close_time ?? '16:00',
      avg_prep_target_minutes: res?.avg_prep_target_minutes ?? res?.prep_time_minutes ?? 15,
      auto_assign_riders: res?.auto_assign_riders ?? false,
      ...(res || {}),
    };
  },
  async updateSettings(body) { return apiClient.patch('/kitchen/settings', body); },
  async batchAdvanceStatus(windowId, body) { return apiClient.post(`/kitchen/batch/${windowId}/advance`, body); },
  async markItemUnavailable(itemId) { return apiClient.patch(`/menu/items/${itemId}`, { is_available: false, is_sold_out: true }); },
  async markItemAvailable(itemId) { return apiClient.patch(`/menu/items/${itemId}`, { is_available: true, is_sold_out: false }); },
};

// ========== RIDERS ==========
const riders = {
  async getMyBatch() {
    const res = await apiClient.get('/riders/my-batch');
    if (res && res.batch) return res; // already panel shape { batch, orders }
    // Flat live shape: { batch_id, zone, status, delivery_window, orders: [...] }
    const orders = (res && res.orders ? res.orders : []).map((o) => {
      const cust = getOrderCustomer(o);
      return {
      ...o,
      id: o.id || o.order_id,
      customer_name: cust.display,
      customer_phone: cust.phone,
      customer_email: cust.email,
      delivery_address: typeof o.delivery_address === 'string'
        ? o.delivery_address
        : [o.delivery_address && o.delivery_address.hostel, o.delivery_address && o.delivery_address.room].filter(Boolean).join(' ') || o.delivery_location || '',
      items: (o.items || o.order_items || []).map((it) => ({ ...it, name_snapshot: it.name_snapshot || it.name })),
      distance_km: o.distance_km ?? '',
      delivery_rank: o.delivery_rank ?? '',
      delivery_hint: o.delivery_hint || o.notes || '',
      };
    });
    return { batch: { id: (res && (res.batch_id || res.id)) || '', zone: res && res.zone, status: res && res.status, delivery_window: res && res.delivery_window }, orders };
  },
  async pickup(orderId) { return apiClient.post(`/riders/orders/${orderId}/pickup`); },
  async deliver(orderId) { return apiClient.post(`/riders/orders/${orderId}/deliver`); },
  async attempt(orderId, body) { return apiClient.post(`/riders/orders/${orderId}/attempt`, body); },
  async setAvailability(body) { return apiClient.patch('/riders/availability', body); },
  async getEarnings(params = {}) {
    const res = await apiClient.get('/riders/earnings', params);
    if (Array.isArray(res)) return { total_earnings: 0, total_deliveries: res.length, deliveries: res };
    return {
      total_earnings: res?.total_earnings ?? 0,
      total_deliveries: res?.total_deliveries ?? 0,
      deliveries: Array.isArray(res?.deliveries) ? res.deliveries : [],
      ...(res || {}),
    };
  },
  async getStats() {
    // Spec §6.7: { rider_id, total_batches, completed_batches, completion_rate (0-100),
    // total_orders_delivered, zones_served[], is_available, availability_updated_at }.
    const res = await apiClient.get('/riders/stats');
    if (!res) return {};
    return {
      total_batches: res.total_batches ?? 0,
      completed_batches: res.completed_batches ?? 0,
      completion_rate: Number(res.completion_rate ?? 0),
      total_orders_delivered: res.total_orders_delivered ?? 0,
      zones_served: Array.isArray(res.zones_served) ? res.zones_served : [],
      is_available: res.is_available ?? false,
      availability_updated_at: res.availability_updated_at ?? null,
      ...(res || {}),
    };
  },
  async getHistory() { return unwrap(await apiClient.get('/riders/history'), 'deliveries', 'history'); },
  async getCallLink(orderId) {
    const res = await apiClient.get(`/riders/call/${orderId}`);
    return { call_link: (res && (res.call_link || res.call_url || res.callLink)) || '', ...(res || {}) };
  },
  async batchDeliver(body) {
    // No batch endpoint — deliver each order individually
    const ids = body.order_ids || [];
    const results = await Promise.allSettled(ids.map(id => apiClient.post(`/riders/orders/${id}/deliver`)));
    return { message: 'Batch delivery confirmed', delivered_count: results.filter(r => r.status === 'fulfilled').length };
  },
};

// ========== ANALYTICS ==========
// Pass-through — the exact response shapes are admin-only (401 without an admin
// token) and could not be verified. AdminDashboard guards every field so it
// renders live values where the shape matches and degrades gracefully otherwise.
const analytics = {
  async dashboard() { return apiClient.get('/analytics/dashboard'); },
  async sales(params = {}) { return apiClient.get('/analytics/sales', params); },
  async orders(params = {}) { return apiClient.get('/analytics/orders', params); },
  async items(params = {}) { return apiClient.get('/analytics/items', params); },
  async users() { return apiClient.get('/analytics/users'); },
  async retention() { return apiClient.get('/analytics/retention'); },
};

// ========== ADMIN ==========
const admin = {
  // --- Users (verified: /admin/users, /admin/users/:id, role/deactivate/activate, hp, wallet, orders) ---
  async getUsers(params = {}) { return unwrap(await apiClient.get('/admin/users', params), 'users'); },
  async getUser(userId) { return apiClient.get(`/admin/users/${userId}`); },
  async updateRole(userId, body) { return apiClient.patch(`/admin/users/${userId}/role`, body); },
  async deactivateUser(userId) { return apiClient.post(`/admin/users/${userId}/deactivate`); },
  async activateUser(userId) { return apiClient.post(`/admin/users/${userId}/activate`); },
  async getUserHp(userId) {
    const r = await apiClient.get(`/admin/users/${userId}/hp`);
    const tx = Array.isArray(r?.transactions) ? r.transactions : Array.isArray(r?.hp_transactions) ? r.hp_transactions : Array.isArray(r?.history) ? r.history : Array.isArray(r?.ledger) ? r.ledger : [];
    // Live shape: { count, hp_balance: { active, pending, total_visible, tier, tier_bonus_multiplier, ... }, transactions, user }
    // hp_balance is an OBJECT — returning it as `total` made the UI show "[object Object]".
    const bal = r?.hp_balance && typeof r.hp_balance === 'object' && !Array.isArray(r.hp_balance) ? r.hp_balance : null;
    return {
      total: bal ? (bal.total_visible ?? bal.active ?? 0) : (r?.total ?? r?.balance ?? 0),
      active: bal ? (bal.active ?? 0) : (r?.active ?? r?.active_hp ?? r?.total ?? r?.balance ?? 0),
      pending: bal ? (bal.pending ?? 0) : (r?.pending ?? r?.pending_hp ?? r?.reserved ?? 0),
      tier: bal?.tier ?? null,
      monthly_hp_earned: bal?.monthly_hp_earned ?? 0,
      hp_earned_120day: bal?.hp_earned_120day ?? 0,
      transactions: tx,
    };
  },
  async getUserWallet(userId) { return apiClient.get(`/admin/users/${userId}/wallet`); },
  async getUserOrders(userId) { return unwrap(await apiClient.get(`/admin/users/${userId}/orders`), 'orders'); },
  async bulkGrantHp(body) { return apiClient.post('/admin/hp/bulk-grant', body); },
  async getHpReport() { return apiClient.get('/admin/hp/report'); },
  async grantHpToUser(userId, body) { return apiClient.post('/admin/hp/grant', { user_id: userId, ...body }); },
  async expireHpFromUser(userId, body) { return apiClient.post('/admin/hp/expire', { user_id: userId, ...body }); },

  // --- Orders (verified: /admin/orders, /orders/:id/status, /orders/:id/refund, /orders/:id/history) ---
  async getAdminOrders(params = {}) { return unwrap(await apiClient.get('/admin/orders', params), 'orders'); },
  async overrideOrderStatus(id, body) { return apiClient.patch(`/orders/${id}/status`, body); },
  async refund(id, body) { return apiClient.post(`/orders/${id}/refund`, body); },
  async getOrderHistory(id) { return apiClient.get(`/orders/${id}/history`); },

  // --- Delivery Windows (verified: /admin/delivery-windows + close/reopen) ---
  async getDeliveryWindows() { return unwrap(await apiClient.get('/admin/delivery-windows'), 'windows', 'delivery_windows'); },
  async createDeliveryWindow(body) { return apiClient.post('/admin/delivery-windows', body); },
  async closeWindow(id) { return apiClient.post(`/admin/delivery-windows/${id}/close`); },
  async reopenWindow(id) { return apiClient.post(`/admin/delivery-windows/${id}/reopen`); },

  // --- Delivery Batches (verified: /admin/delivery-batches + /:id/orders) ---
  async getDeliveryBatches() { return unwrap(await apiClient.get('/admin/delivery-batches'), 'batches', 'delivery_batches'); },
  async createDeliveryBatch(body) { return apiClient.post('/admin/delivery-batches', body); },
  async updateDeliveryBatch(id, body) { return apiClient.patch(`/admin/delivery-batches/${id}`, body); },
  async deleteDeliveryBatch(id) { return apiClient.delete(`/admin/delivery-batches/${id}`); },
  async getDeliveryBatchOrders(id) { return unwrap(await apiClient.get(`/admin/delivery-batches/${id}/orders`), 'orders'); },

  // --- Abandoned Carts (verified: /admin/abandoned-carts + /:id/nudge) ---
  async getAbandonedCarts() { return unwrap(await apiClient.get('/admin/abandoned-carts'), 'carts', 'abandoned_carts'); },
  async nudgeAbandonedCart(id) { return apiClient.post(`/admin/abandoned-carts/${id}/nudge`); },
  // --- Order Locks Admin (verified: /order-locks/admin/all) ---
  async getOrderLocks(params = {}) { return unwrap(await apiClient.get('/order-locks/admin/all', params), 'locks', 'order_locks'); },

  // --- Promo Codes (verified: /admin/promo-codes, /:id, /:id/uses) ---
  async getPromoCodes() { return unwrap(await apiClient.get('/admin/promo-codes'), 'promo_codes', 'codes'); },
  async createPromoCode(body) { return apiClient.post('/admin/promo-codes', body); },
  async updatePromoCode(id, body) { return apiClient.patch(`/admin/promo-codes/${id}`, body); },
  async togglePromoCode(id) {
    const codes = unwrap(await apiClient.get('/admin/promo-codes'), 'promo_codes', 'codes');
    const p = codes.find(c => c.id === id);
    if (!p) throw new ApiError(404, 'Promo code not found');
    return apiClient.patch(`/admin/promo-codes/${id}`, { is_active: !p.is_active });
  },
  async getPromoCodeUses(id) { return unwrap(await apiClient.get(`/admin/promo-codes/${id}/uses`), 'uses'); },

  // --- Audit Log & Cron (verified: /admin/audit-log, /admin/cron/status, /admin/cron/:job) ---
  async getAuditLog() { return unwrap(await apiClient.get('/admin/audit-log'), 'logs', 'audit_log', 'entries'); },
  async triggerCron(jobName) { return apiClient.post(`/admin/cron/${jobName}`); },
  async getCronStatus() {
    const res = await apiClient.get('/admin/cron/status');
    if (Array.isArray(res)) return res;
    // Live shape: { checked_at, jobs: { "birthday-hp": {cadence,status,last_triggered,...}, ... }, summary }
    const jobs = res?.jobs;
    if (jobs && typeof jobs === 'object' && !Array.isArray(jobs)) {
      return Object.entries(jobs).map(([job, info]) => {
        const o = (info && typeof info === 'object') ? info : { status: info };
        return { job, status: o.status || (o.last_triggered ? 'ok' : 'never_run'), last_triggered: o.last_triggered || o.last_run || null, cadence: o.cadence || o.schedule || '—', last_result: o.last_result ?? null, triggered_by: o.triggered_by ?? null };
      });
    }
    if (Array.isArray(jobs)) return jobs;
    if (res && Array.isArray(res.cron_jobs)) return res.cron_jobs;
    if (res && typeof res === 'object' && !jobs) {
      return Object.entries(res).map(([job, info]) => {
        const o = (info && typeof info === 'object') ? info : { status: info };
        return { job, status: o.status || (o.last_triggered ? 'ok' : 'never_run'), last_triggered: o.last_triggered || o.last_run || null, cadence: o.cadence || o.schedule || '—' };
      });
    }
    return [];
  },

  // --- System Settings (verified: /admin/settings, /admin/settings/:key) ---
  async getSystemSettings() { return unwrap(await apiClient.get('/admin/settings'), 'settings'); },
  async updateSystemSetting(key, body) {
    // Upsert: if the setting doesn't exist (404 on PATCH), create it via POST.
    try { return await apiClient.patch(`/admin/settings/${key}`, body); }
    catch (e) { if (e.status === 404) return apiClient.post('/admin/settings', { key, ...body }); throw e; }
  },
  // Gift settings — GET /admin/gifts/settings returns first_order_gift_enabled, launch_window_end_date, first_order_gift_item_name.
  async getGiftSettings() { const res = await apiClient.get('/admin/gifts/settings'); return res && res.settings ? res.settings : (res || {}); },
  async updateGiftSetting(key, body) {
    try { return await apiClient.patch(`/admin/gifts/settings/${key}`, body); }
    catch (e) { if (e.status === 404) return apiClient.post('/admin/gifts/settings', { key, ...body }); throw e; }
  },

  // --- Menu Items (verified: /menu/items, /menu/items/:id, archive, bulk-availability, kitchen-capacity) ---
  async getMenuItems(params = {}) { return unwrap(await apiClient.get('/menu/items', params), 'items'); },
  async createMenuItem(body) { return apiClient.post('/menu/items', body); },
  async updateMenuItem(id, body) { return apiClient.patch(`/menu/items/${id}`, body); },
  async toggleMenuItemAvailability(id) {
    const items = unwrap(await apiClient.get('/menu/items'), 'items');
    const item = items.find(i => i.id === id);
    if (!item) throw new ApiError(404, 'Item not found');
    return apiClient.patch(`/menu/items/${id}`, { is_available: !item.is_available, is_sold_out: !!item.is_available });
  },
  async deleteMenuItem(id) { return apiClient.post(`/menu/items/${id}/archive`); },
  async bulkToggleMenuItemAvailability(ids, is_available) {
    return apiClient.patch('/menu/items/bulk-availability', { item_ids: ids, is_available });
  },
  async updateMenuItemHpMultiplier(id, body) {
    return apiClient.patch(`/menu/items/${id}`, { hp_multiplier: body.multiplier });
  },
  async bulkUpdateMenuItemHpMultiplier(ids, multiplier) {
    const results = await Promise.allSettled(ids.map(id => apiClient.patch(`/menu/items/${id}`, { hp_multiplier: multiplier })));
    return { updated_count: results.filter(r => r.status === 'fulfilled').length };
  },
  async getMenuCapacitySettings() { return apiClient.get('/menu/kitchen-capacity'); },
  async updateMenuCapacitySettings(body) { return apiClient.patch('/menu/kitchen-capacity', body); },

  // --- Addons & Variations (verified: /menu/addons, /menu/items/:id/variation-groups(+options), /menu/items/:id/addon-groups) ---
  async getAddonsConfig() {
    const addons = await apiClient.get('/menu/addons');
    return { global_addons: unwrap(addons, 'addons', 'global_addons'), variation_groups: {}, addon_groups: {} };
  },
  async createGlobalAddon(body) { return apiClient.post('/menu/addons', body); },
  async updateGlobalAddon(id, body) { return apiClient.patch(`/menu/addons/${id}`, body); },
  async deleteGlobalAddon(id) { return apiClient.post(`/menu/addons/${id}/archive`); },
  async saveItemModifiers(itemId, body) {
    const results = { variation_groups: [], addon_groups: [] };
    for (const vg of (body.variation_groups || [])) {
      if (vg.id && !vg.id.startsWith('vg_')) {
        results.variation_groups.push(await apiClient.patch(`/menu/items/${itemId}/variation-groups/${vg.id}`, vg));
      } else {
        results.variation_groups.push(await apiClient.post(`/menu/items/${itemId}/variation-groups`, vg));
      }
    }
    for (const ag of (body.addon_groups || [])) {
      if (ag.id && !ag.id.startsWith('ag_')) {
        results.addon_groups.push(await apiClient.patch(`/menu/items/${itemId}/addon-groups/${ag.id}`, ag));
      } else {
        results.addon_groups.push(await apiClient.post(`/menu/items/${itemId}/addon-groups`, ag));
      }
    }
    return { message: 'Modifiers saved', item_id: itemId, ...results };
  },

  // --- Events (verified: /events/admin, /events/:id, /events/:id/qr) ---
  async getEvents() { return unwrap(await apiClient.get('/events/admin'), 'events'); },
  async createEvent(body) { return apiClient.post('/events', body); },
  async updateEvent(id, body) { return apiClient.patch(`/events/${id}`, body); },
  async toggleEventPublish(id) {
    const eventsList = unwrap(await apiClient.get('/events/admin'), 'events');
    const ev = eventsList.find(e => e.id === id);
    if (!ev) throw new ApiError(404, 'Event not found');
    return apiClient.patch(`/events/${id}`, { is_published: !ev.is_published });
  },
  async deleteEvent(id) { return apiClient.delete(`/events/${id}`); },
  async getEventRegistrations(id) {
    // /events/:id/registrants returns 404 on the live backend — fall back to any
    // registrations embedded in the event detail, else an empty list.
    try {
      const ev = await apiClient.get(`/events/${id}`);
      return unwrap(ev.registrations || ev.attendees || ev.registrants, 'registrations', 'attendees');
    } catch { return []; }
  },
  async generateEventQR(id) { return apiClient.post(`/events/${id}/qr`); },
  // Event ticket tiers (GET /events/:id/tiers, POST /events/:id/tiers, PATCH /events/:id/tiers/:tier_id)
  async getEventTicketTiers(id) { return unwrap(await apiClient.get(`/events/${id}/tiers`), 'tiers'); },
  async createEventTicketTier(id, body) { return apiClient.post(`/events/${id}/tiers`, body); },
  async updateEventTicketTier(eventId, tierId, body) { return apiClient.patch(`/events/${eventId}/tiers/${tierId}`, body); },
  async deleteEventTicketTier(eventId, tierId) { return apiClient.delete(`/events/${eventId}/tiers/${tierId}`); },
  async getEventTicketSales(id) { return apiClient.get(`/events/${id}/tickets`); },
  // Event registrant export / email-to-host (GET /admin/events/:id/tickets, /export, POST send-to-host)
  async getEventRegistrants(id, params = {}) { return unwrap(await apiClient.get(`/admin/events/${id}/tickets`, params), 'registrants', 'tickets'); },
  async exportEventRegistrations(id) { return apiClient.get(`/admin/events/${id}/tickets/export`); },
  async emailEventRegistrationsToHost(id, body) { return apiClient.post(`/admin/events/${id}/tickets/send-to-host`, body); },

  // --- Rewards (verified: /rewards, /rewards/admin/redemptions) ---
  async getRewards() { return unwrap(await apiClient.get('/rewards'), 'rewards'); },
  async createReward(body) { return apiClient.post('/rewards', body); },
  async updateReward(id, body) { return apiClient.patch(`/rewards/${id}`, body); },
  async deleteReward(id) { return apiClient.delete(`/rewards/${id}`); },
  async getRedemptions() { return unwrap(await apiClient.get('/rewards/admin/redemptions'), 'redemptions'); },
  async fulfillRedemption(id) { return apiClient.patch(`/rewards/admin/redemptions/${id}`, { status: 'fulfilled' }); },

  // --- Marketplace (verified: /marketplace/admin/listings, /requests, /purchases, /codes/:id) ---
  async getMarketplaceListings() { return unwrap(await apiClient.get('/marketplace/admin/listings'), 'listings'); },
  async createListing(body) { return apiClient.post('/marketplace/admin/listings', body); },
  async updateListing(id, body) { return apiClient.patch(`/marketplace/admin/listings/${id}`, body); },
  async deleteListing(id) { return apiClient.delete(`/marketplace/admin/listings/${id}`); },
  async getListingRequests() { return unwrap(await apiClient.get('/marketplace/admin/requests'), 'requests'); },
  async approveListingRequest(id) { return apiClient.patch(`/marketplace/admin/requests/${id}`, { status: 'approved' }); },
  async rejectListingRequest(id) { return apiClient.patch(`/marketplace/admin/requests/${id}`, { status: 'rejected' }); },
  async uploadListingCodes(listingId, body) { return apiClient.post(`/marketplace/admin/codes/${listingId}`, body); },
  async getMarketplacePurchases() { return unwrap(await apiClient.get('/marketplace/admin/purchases'), 'purchases'); },
  async fulfillMarketplacePurchase(id) { return apiClient.patch(`/marketplace/admin/purchases/${id}`, { status: 'completed' }); },

  // --- Notifications (verified: /notifications/blasts) ---
  async sendNotificationBlast(body) { return apiClient.post('/notifications/blasts', body); },
  async getNotificationBlasts() { return unwrap(await apiClient.get('/notifications/blasts'), 'blasts'); },

  // --- Feature Flags (GET /admin/feature-flags, PATCH /admin/feature-flags/:name) ---
  async getFeatureFlags(params = {}) { return unwrap(await apiClient.get('/admin/feature-flags', params), 'flags', 'feature_flags'); },
  async toggleFeatureFlag(name, body) { return apiClient.patch(`/admin/feature-flags/${name}`, body); },
  async createFeatureFlag(body) { return apiClient.post('/admin/feature-flags', body); },

  // --- Leaderboard Rewards Fulfillment (GET /admin/leaderboard-rewards, POST /:id/fulfill) ---
  async getLeaderboardRewards(params = {}) { return unwrap(await apiClient.get('/admin/leaderboard-prizes', params), 'rewards'); },
  async fulfillLeaderboardReward(id, body = {}) { return apiClient.patch(`/admin/leaderboard-prizes/${id}`, { status: 'fulfilled', ...body }); },
  // --- Hall of Fame Fulfillment (GET /admin/hall-of-fame-rewards?status=, PATCH /:id {status, notes}) ---
  // Status flow: pending → box_prepared → fulfilled. Admin advances status + adds notes.
  async getHallOfFameRewards(params = {}) { return unwrap(await apiClient.get('/admin/hall-of-fame-rewards', params), 'inductees', 'rewards', 'hall_of_fame_rewards'); },
  async updateHallOfFameReward(id, body) { return apiClient.patch(`/admin/hall-of-fame-rewards/${id}`, body); },

  // --- Reviews Admin (GET /admin/reviews, PATCH /admin/reviews/:id/promote) ---
  async getReviews(params = {}) { return unwrap(await apiClient.get('/admin/reviews', params), 'reviews'); },
  async promoteReview(id) { return apiClient.post(`/admin/reviews/${id}/promote`); },

  // --- Catering Requests (GET/POST /events/catering-requests, PATCH /:id) ---
  async getCateringRequests(params = {}) { return unwrap(await apiClient.get('/events/catering-requests', params), 'requests', 'catering_requests'); },
  async getCateringRequest(id) { return apiClient.get(`/events/catering-requests/${id}`); },
  async updateCateringRequest(id, body) { return apiClient.patch(`/events/catering-requests/${id}`, body); },
  // Event registrant export / email-to-host
  async getEventRegistrantList(id, params = {}) { return unwrap(await apiClient.get(`/events/${id}/registrants`, params), 'registrants', 'attendees'); },
  async sendRegistrantsToHost(id, body) { return apiClient.post(`/events/${id}/send-registrants-to-host`, body); },

  // No dedicated server-side search endpoint — aggregate across the four list
  // endpoints with the query term (spec: users, orders, menu items, promo codes).
  async globalSearch(q) {
    const [u, o, m, p, s] = await Promise.allSettled([
      apiClient.get('/admin/users', { q }),
      apiClient.get('/admin/orders', { q }),
      apiClient.get('/menu/items', { q }),
      apiClient.get('/admin/promo-codes', { q }),
      apiClient.get('/admin/gifts/settings'),
    ]);
    return {
      users: u.status === 'fulfilled' ? unwrap(u.value, 'users') : [],
      orders: o.status === 'fulfilled' ? unwrap(o.value, 'orders') : [],
      menu: m.status === 'fulfilled' ? unwrap(m.value, 'items') : [],
      promos: p.status === 'fulfilled' ? unwrap(p.value, 'promo_codes', 'codes') : [],
      settings: s.status === 'fulfilled' ? (s.value && typeof s.value === 'object' && !Array.isArray(s.value) ? Object.entries(s.value).map(([key, val]) => ({ key, value: val, title: key.replace(/_/g, ' ') })) : []) : [],
    };
  },

  // --- Storefront Sections (GET/POST/PATCH/DELETE /storefront/sections) ---
  // Full storefront lifecycle: hero, banner, promo, testimonial, share_template.
  async getStorefrontSections(params = {}) { return unwrap(await apiClient.get('/storefront/sections', params), 'sections'); },
  async createStorefrontSection(body) { return apiClient.post('/storefront/sections', body); },
  async updateStorefrontSection(id, body) { return apiClient.patch(`/storefront/sections/${id}`, body); },
  async deleteStorefrontSection(id) { return apiClient.delete(`/storefront/sections/${id}`); },

  // --- Departments & Academic Levels (verified: /admin/departments, /admin/academic-levels) ---
  async getDepartments() { return unwrap(await apiClient.get('/admin/departments'), 'departments'); },
  async createDepartment(body) { return apiClient.post('/admin/departments', body); },
  async updateDepartment(id, body) { return apiClient.patch(`/admin/departments/${id}`, body); },
  async deleteDepartment(id) { return apiClient.delete(`/admin/departments/${id}`); },
  async getAcademicLevels() { return unwrap(await apiClient.get('/admin/academic-levels'), 'levels', 'academic_levels'); },
  async createAcademicLevel(body) { return apiClient.post('/admin/academic-levels', body); },
  async updateAcademicLevel(id, body) { return apiClient.patch(`/admin/academic-levels/${id}`, body); },
  async deleteAcademicLevel(id) { return apiClient.delete(`/admin/academic-levels/${id}`); },

  // --- Storefront (verified: /storefront/banners, /early-supporters, /newsletter) ---
  async getBanners() { return unwrap(await apiClient.get('/storefront/banners'), 'banners'); },
  async updateBanner(id, body) { return apiClient.patch(`/storefront/banners/${id}`, body); },
  async createBanner(body) { return apiClient.post('/storefront/banners', body); },
  async getEarlySupporters() { return unwrap(await apiClient.get('/storefront/early-supporters'), 'early_supporters', 'sections'); },
  async addEarlySupporter(body) { return apiClient.post('/storefront/early-supporters', body); },
  async removeEarlySupporter(id) { return apiClient.delete(`/storefront/early-supporters/${id}`); },
  async getNewsletterSubscribers() { return unwrap(await apiClient.get('/storefront/newsletter'), 'subscribers', 'newsletter'); },
  async unsubscribeNewsletter(body) { return apiClient.post('/storefront/newsletter/unsubscribe', body); },

  // --- Onboarding / Gifts (GET /admin/gifts/first-order, PATCH /:id; settings via /admin/gifts/settings/:key) ---
  async getFirstOrderGifts() { return unwrap(await apiClient.get('/admin/gifts/first-order'), 'gifts', 'first_order_gifts'); },
  async updateFirstOrderGiftStatus(id, body) { return apiClient.patch(`/admin/gifts/first-order/${id}`, body); },
  // Graduation claims admin — NOT on live backend (only user-side POST /graduation/claim exists)
  getGraduationClaims: naList,
  approveGraduationClaim: naWrite('approveGraduationClaim'),
  rejectGraduationClaim: naWrite('rejectGraduationClaim'),

  // --- Challenges / Milestones (POST /admin/milestones, PATCH /:id, DELETE /:id) ---
  // Challenges = milestones with time_window weekly/monthly; badges = window null.
  async getChallengesAdmin() { return unwrap(await apiClient.get('/admin/milestones'), 'challenges', 'milestones'); },
  async createChallenge(body) { return apiClient.post('/admin/milestones', body); },
  async updateChallenge(id, body) { return apiClient.patch(`/admin/milestones/${id}`, body); },
  async deleteChallenge(id) { return apiClient.delete(`/admin/milestones/${id}`); },
  async grantChallenge(id, body) { return apiClient.post(`/admin/milestones/${id}/grant`, body); },

  // --- Analytics (verified: /analytics/sales, /hp, /referrals, /export) ---
  async getSalesTrend(params = {}) { return apiClient.get('/analytics/sales', params); },
  async getAnalyticsHp() {
    // /analytics/hp reports mostly-structural totals (often 0); the richer, live HRT
    // figures (net HP in system, total spent, issued today, users-by-tier, top earners)
    // come from /admin/hp/report. Merge both so the HP card + multiplier page show real
    // circulation / spends instead of zeros.
    const [hpP, repP] = await Promise.allSettled([apiClient.get('/analytics/hp'), apiClient.get('/admin/hp/report')]);
    const r = hpP.status === 'fulfilled' ? (hpP.value || {}) : {};
    if (!r || typeof r !== 'object' || Array.isArray(r)) return { hp_earned_active: 0, hp_spent: repP.status === 'fulfilled' ? (repP.value?.total_hp_spent ?? 0) : 0, hp_expired: 0, hp_pending: 0, hp_in_circulation: repP.status === 'fulfilled' ? (repP.value?.net_hp_in_system ?? 0) : 0, redemption_rate: 0, tier_distribution: repP.status === 'fulfilled' ? (repP.value?.users_by_tier ?? {}) : {}, hp_issued_today: 0, total_hp_issued: 0, top_earners: [] };
    const rep = repP.status === 'fulfilled' ? (repP.value || {}) : {};
    const sub = r.summary || r.totals || r.hp || r.analytics || r.data || {};
    const pick = (keys) => { for (const k of keys) { const v = r[k] ?? sub[k]; if (v != null && v !== '') { const n = Number(v); if (!isNaN(n)) return n; } } return 0; };
    // /analytics/hp returns tier_distribution as an array of {tier, count}
    // objects (per spec), but the dashboard expects a flat {tierName: count} map.
    // Normalize both the array form and the object form into the flat map.
    const rawTd = r.tier_distribution ?? rep.users_by_tier ?? {};
    const td = Array.isArray(rawTd)
      ? rawTd.reduce((acc, row) => { if (row && row.tier != null) acc[row.tier] = (acc[row.tier] ?? 0) + (row.count ?? 0); return acc; }, {})
      : (rawTd && typeof rawTd === 'object' ? rawTd : {});
    // Brand spec: HP in circulation = active + pending (all HP that exists in
    // the system). The backend returns active-only; override client-side.
    const hp_earned_active = pick(['hp_earned_active', 'hp_earned', 'earned_active', 'total_earned', 'earned', 'hp_earned_total', 'total_hp_earned']) || rep.total_hp_issued || 0;
    const hp_spent = rep.total_hp_spent ?? pick(['hp_spent', 'spent', 'total_spent', 'hp_redeemed', 'redeemed', 'total_hp_spent']);
    const hp_expired = pick(['hp_expired', 'expired', 'total_expired']);
    const hp_pending = pick(['hp_pending', 'pending', 'hp_reserved', 'reserved', 'pending_hp']);
    const hp_in_circulation = (hp_earned_active - hp_spent - hp_expired) + hp_pending;
    return {
      hp_earned_active,
      hp_spent,
      hp_expired,
      hp_pending,
      hp_in_circulation,
      redemption_rate: pick(['redemption_rate', 'redemption', 'rate']),
      tier_distribution: td,
      hp_issued_today: rep.hp_issued_today ?? pick(['hp_issued_today']),
      total_hp_issued: rep.total_hp_issued ?? pick(['total_hp_issued']),
      top_earners: rep.top_earners || [],
    };
  },
  async getAnalyticsReferrals() { return apiClient.get('/analytics/referrals'); },
  async exportAnalytics(type, params = {}) {
    return apiClient.get('/analytics/export', { type, ...params });
  },

  // --- Delivery Zones (verified: /delivery/admin/hostels, /delivery/admin/gates) ---
  async getDeliveryHostels() { return unwrap(await apiClient.get('/delivery/admin/hostels'), 'hostels'); },
  async createDeliveryHostel(body) { return apiClient.post('/delivery/admin/hostels', body); },
  async updateDeliveryHostel(id, body) { return apiClient.patch(`/delivery/admin/hostels/${id}`, body); },
  async deleteDeliveryHostel(id) { return apiClient.delete(`/delivery/admin/hostels/${id}`); },
  async getDeliveryGates() { return unwrap(await apiClient.get('/delivery/admin/gates'), 'gates'); },
  async createDeliveryGate(body) { return apiClient.post('/delivery/admin/gates', body); },
  async updateDeliveryGate(id, body) { return apiClient.patch(`/delivery/admin/gates/${id}`, body); },
  async deleteDeliveryGate(id) { return apiClient.delete(`/delivery/admin/gates/${id}`); },
  async restoreDeliveryGate(id) { return apiClient.patch(`/delivery/admin/gates/${id}`, { is_active: true }); },

  // --- Free Side Credits Admin (GET /admin/free-credits, PATCH /admin/settings/...) ---
  async getFreeSideCreditsAdmin() { return unwrap(await apiClient.get('/admin/free-credits'), 'credits', 'users'); },
  async updateFreeSideOptions(body) { return apiClient.patch('/admin/settings/free_side_options', body); },
  async updateFreeSideValidityDays(body) { return apiClient.patch('/admin/settings/free_side_credits_validity_days', body); },

  // --- Exclusive Spin Admin (GET/PATCH /admin/exclusive-spin/template, PATCH settings, GET history) ---
  async getExclusiveSpinTemplate() { return unwrap(await apiClient.get('/admin/exclusive-spin/template'), 'items', 'template_items'); },
  async updateExclusiveSpinTemplateItem(id, body) { return apiClient.patch(`/admin/exclusive-spin/template/${id}`, body); },
  async createExclusiveSpinTemplateItem(body) { return apiClient.post('/admin/exclusive-spin/template', body); },
  async deleteExclusiveSpinTemplateItem(id) { return apiClient.delete(`/admin/exclusive-spin/template/${id}`); },
  async updateExclusiveSpinExtraCost(body) { return apiClient.patch('/admin/settings/exclusive_spin_extra_cost', body); },
  async updateExclusiveSpinValidityDays(body) { return apiClient.patch('/admin/settings/exclusive_spin_validity_days', body); },
  async getExclusiveSpinHistoryAdmin(params = {}) { return unwrap(await apiClient.get('/admin/exclusive-spin/history', params), 'spins', 'history'); },
};

// ========== DEPARTMENTS & ACADEMIC LEVELS (student-facing) ==========
// Public student endpoints (departments.py / academic_levels.py) — NOT the
// /admin/* versions. Used by Profile to let students pick their department + level.
const departments = {
  async list() { return unwrap(await apiClient.get('/departments'), 'departments'); },
};
const academicLevels = {
  async list() { return unwrap(await apiClient.get('/academic-levels'), 'levels', 'academic_levels'); },
};

// ========== DELIVERY ==========
const delivery = {
  async getHostels() { return unwrap(await apiClient.get('/delivery/hostels'), 'hostels'); },
  async getGates() { return unwrap(await apiClient.get('/delivery/gates'), 'gates'); },
  async calculateFee(body) { return apiClient.post('/delivery/calculate-fee', body); },
};

// ========== ORDER LOCKS ==========
const orderLocks = {
  async list() { return apiClient.get('/order-locks'); },
  async create(body) { return apiClient.post('/order-locks', body); },
  async cancel(id) { return apiClient.delete(`/order-locks/${id}`); },
  async reschedule(id, body) { return apiClient.patch(`/order-locks/${id}/reschedule`, body); },
};

// ========== SAVED ITEMS ==========
const saved = {
  async list() { return unwrap(await apiClient.get('/saved'), 'saved', 'items'); },
  async add(body) { return apiClient.post('/saved', body); },
  async remove(id) { return apiClient.delete(`/saved/${id}`); },
  async moveToCart(id) { return apiClient.post(`/saved/${id}/move-to-cart`); },
  // Save a cart item for later in one call — POST /api/saved/from-cart/{cart_item_id}.
  async fromCart(cartItemId) { return apiClient.post(`/saved/from-cart/${cartItemId}`); },
};

// ========== CHALLENGES ==========
const challenges = {
  async list(params = {}) { return unwrap(await apiClient.get('/challenges', params), 'challenges'); },
  async my(params = {}) { return unwrap(await apiClient.get('/challenges/my', params), 'challenges'); },
  async get(id) { return apiClient.get(`/challenges/${id}`); },
  async complete(id, body) { return apiClient.post(`/challenges/${id}/complete`, body); },
  async socialFollow(id, body) { return apiClient.post(`/challenges/${id}/social-follow`, body); },
};

// ========== GRADUATION ==========
const graduation = {
  async claim(body) { return apiClient.post('/graduation/claim', body); },
  async getStatus() { return apiClient.get('/graduation/status'); },
};

// ========== PUSH ==========
const push = {
  async subscribe(body) { return apiClient.post('/push/subscribe', body); },
  async unsubscribe(body) { return apiClient.delete('/push/subscribe', { ...body }); },
};

// ========== STOREFRONT (public) ==========
// Public storefront sections — used by the share-with-image flow to fetch the
// admin-uploaded base template (section_type='share_template') and by the
// homepage for banners / early-supporter content.
const storefront = {
  async getSections(params = {}) { return unwrap(await apiClient.get('/storefront/sections', params), 'sections'); },
};

// ========== PUBLIC CONFIG ==========
// Public, unauthenticated system settings (WhatsApp number, streak rewards,
// free-side options, etc.). Students cannot read /admin/settings, so this is
// the student-facing source of configurable values. Falls back gracefully.
const config = {
  async getPublic() { return unwrap(await apiClient.get('/settings'), 'settings'); },
  // /storefront/config — public, unauthenticated config (WhatsApp number, app
  // name, app_tagline, currency). Used by loadSystemSettings so the WhatsApp
  // floating button and other student-facing config read the live admin value.
  async getStorefrontConfig() { return apiClient.get('/storefront/config'); },
};

// Export unified API — same interface as mockApi
export const liveApi = {
  auth, addresses, menu, cart, orders, events, hp, rewards, marketplace,
  wallet, notifications, leaderboard, kitchen, riders, analytics, admin, delivery, orderLocks,
  saved, challenges, graduation, push, departments, academicLevels, storefront, config,
  demoLogin() {
    // No-op for live API — use login() instead
    console.warn('demoLogin is not available with the live API. Use login() instead.');
  },
  getState() { return null; },
};

export { isAuthenticated, clearTokens };