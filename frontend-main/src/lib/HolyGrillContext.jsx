import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { liveApi, isAuthenticated, clearTokens } from './liveApi';
import { loadSystemSettings, loadFeatureFlags, getSetting } from './featureConfig';

// Holy Grills app context — real JWT auth against the live backend.
// No demo auto-login. Authenticated users hit the server-side cart; guests
// get a local cart (localStorage) so they can browse + order without an account.
const HolyGrillContext = createContext();
const GUEST_CART_KEY = 'hg_guest_cart';

const readGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]'); } catch { return []; }
};
const writeGuestCart = (items) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));

const computeCart = (items) => ({
  items,
  subtotal: items.reduce((s, ci) => s + (ci.menu_items?.price || 0) * ci.quantity, 0),
  item_count: items.length,
  hp_earn_preview: items.reduce((s, ci) => s + (ci.menu_items?.hp_earn_value || 0) * (ci.menu_items?.hp_multiplier || 1) * ci.quantity, 0),
  has_unavailable_items: items.some((ci) => ci.menu_items?.is_available === false),
});

const EMPTY_CART = { items: [], subtotal: 0, item_count: 0, hp_earn_preview: 0, has_unavailable_items: false };

export const HolyGrillProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState(EMPTY_CART);
  const [cartCount, setCartCount] = useState(0);
  const [hpBalance, setHpBalance] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streak, setStreak] = useState(null);
  const [systemSettings, setSystemSettings] = useState({});
  const [authed, setAuthed] = useState(isAuthenticated());
  const [savedItems, setSavedItems] = useState([]);

  const loadGuestCart = useCallback(() => {
    const items = readGuestCart();
    setCart(computeCart(items));
    setCartCount(items.length);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated()) { loadGuestCart(); return; }
    try {
      const c = await liveApi.cart.get();
      const rawItems = c.items || c.cart_items || [];
      const items = rawItems.map((ci) => {
        const mi = ci.menu_items || ci.menu_item || { name: ci.name, price: ci.price, hp_earn_value: ci.hp_earn_value, is_available: ci.is_available !== false };
        return {
          id: ci.id,
          menu_item_id: ci.menu_item_id,
          quantity: ci.quantity,
          notes: ci.notes || '',
          selected_variations: ci.selected_variations || [],
          selected_addons: ci.selected_addons || [],
          menu_items: mi,
          is_unavailable: ci.is_unavailable || mi.is_available === false,
        };
      });
      setCart({
        items,
        subtotal: c.subtotal ?? items.reduce((s, ci) => s + (ci.menu_items?.price || 0) * ci.quantity, 0),
        item_count: c.item_count ?? items.length,
        hp_earn_preview: c.hp_earn_preview ?? items.reduce((s, ci) => s + (ci.menu_items?.hp_earn_value || 0) * (ci.menu_items?.hp_multiplier || 1) * ci.quantity, 0),
        has_unavailable_items: c.has_unavailable_items ?? items.some((ci) => ci.menu_items?.is_available === false),
      });
      setCartCount(c.item_count ?? items.length);
    } catch (e) { console.error('Cart refresh failed:', e); }
  }, [loadGuestCart]);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const n = await liveApi.notifications.list({ limit: 30 });
      setNotifications(n.notifications || n.items || []);
      setUnreadCount(n.unread_count ?? 0);
    } catch (e) { console.error('Notif refresh failed:', e); }
  }, []);

  const refreshHp = useCallback(async () => {
    if (!isAuthenticated()) return;
    try { setHpBalance(await liveApi.hp.getBalance()); } catch (e) { /* ignore */ }
  }, []);

  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated()) return;
    try { setWallet(await liveApi.wallet.get()); } catch (e) { /* ignore */ }
  }, []);

  // Saved-for-later items — server-backed (/saved) for authenticated users.
  // Guests have no server list; savedItems stays empty and the heart prompts login.
  const refreshSavedItems = useCallback(async () => {
    if (!isAuthenticated()) { setSavedItems([]); return; }
    try { setSavedItems(await liveApi.saved.list()); } catch (e) { /* ignore */ }
  }, []);

  const toggleSavedItem = useCallback(async (item) => {
    if (!isAuthenticated()) return false;
    const existing = savedItems.find((s) => s.menu_item_id === item.id);
    try {
      if (existing) { await liveApi.saved.remove(existing.id); setSavedItems((prev) => prev.filter((s) => s.id !== existing.id)); return false; }
      await liveApi.saved.add({ menu_item_id: item.id, name: item.name, price: item.price, hp_earn_value: item.hp_earn_value, image_url: item.image_url });
      await refreshSavedItems();
      return true;
    } catch (e) { return existing ? true : false; }
  }, [savedItems, refreshSavedItems]);

  const removeSavedItem = useCallback(async (savedId) => {
    if (!isAuthenticated()) return;
    try { await liveApi.saved.remove(savedId); setSavedItems((prev) => prev.filter((s) => s.id !== savedId)); } catch (e) { /* ignore */ }
  }, []);

  const moveSavedToCart = useCallback(async (saved) => {
    try {
      await liveApi.cart.add({ menu_item_id: saved.menu_item_id, quantity: saved.quantity || 1 });
      await liveApi.saved.remove(saved.id);
      setSavedItems((prev) => prev.filter((s) => s.id !== saved.id));
      await refreshCart();
    } catch (e) { /* ignore */ }
  }, [refreshCart]);

  const isSavedItem = useCallback((menuItemId) => savedItems.some((s) => s.menu_item_id === menuItemId), [savedItems]);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const profile = await liveApi.auth.me();
      setUser(profile);
      setHpBalance(profile.hp_balance || null);
      setWallet(profile.wallet || null);
    } catch (e) { /* ignore */ }
  }, []);

  const refreshStreak = useCallback(async () => {
    if (!isAuthenticated()) return;
    try { setStreak(await liveApi.auth.getStreak()); } catch (e) { /* ignore */ }
  }, []);

  // Restore session on load — real token → fetch profile; no token → guest cart.
  useEffect(() => {
    const init = async () => {
      if (isAuthenticated()) {
        try {
          const profile = await liveApi.auth.me();
          setUser(profile);
          setHpBalance(profile.hp_balance || null);
          setWallet(profile.wallet || null);
          setAuthed(true);
          // Unblock the UI immediately — fire background refreshes in
          // parallel so a slow/cold backend never traps the user behind a
          // full-screen spinner. Each one swallows its own errors.
          setIsLoading(false);
          Promise.allSettled([
            refreshCart(),
            refreshNotifications(),
            refreshHp(),
            refreshSavedItems(),
            liveApi.auth.getStreak().then(setStreak).catch(() => {}),
            loadSystemSettings().then(setSystemSettings).catch(() => {}),
            loadFeatureFlags().catch(() => {}),
          ]);
        } catch (e) {
          clearTokens();
          setAuthed(false);
          loadGuestCart();
          setIsLoading(false);
        }
      } else {
        loadGuestCart();
        setIsLoading(false);
        // Guests still need public system settings (WhatsApp number, streak
        // rewards, etc.) — load them in the background so the floating WhatsApp
        // button and other config-driven UI read the admin-configured values.
        loadSystemSettings().then(setSystemSettings).catch(() => {});
        loadFeatureFlags().catch(() => {});
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    const data = await liveApi.auth.login({ email, password });
    const profile = await liveApi.auth.me();
    setUser(profile);
    setHpBalance(profile.hp_balance || null);
    setWallet(profile.wallet || null);
    setAuthed(true);
    // Migrate any guest cart items into the now-authenticated server cart.
    const guestItems = readGuestCart();
    if (guestItems.length) {
      await Promise.all(guestItems.map((ci) => liveApi.cart.add({ menu_item_id: ci.menu_item_id, quantity: ci.quantity, notes: ci.notes }))).catch(() => {});
      writeGuestCart([]);
    }
    // Fire background refreshes in parallel — don't block the login redirect
    // on slow/cold backend calls. The user gets to their dashboard instantly.
    Promise.allSettled([refreshCart(), refreshNotifications(), refreshHp(), refreshSavedItems(), liveApi.auth.getStreak().then(setStreak).catch(() => {}), loadSystemSettings().then(setSystemSettings).catch(() => {}), loadFeatureFlags().catch(() => {})]);
    return { ...data, role: profile.role || data?.user?.role || 'student' };
  };

  const register = async (body) => {
    const data = await liveApi.auth.register(body);
    const profile = await liveApi.auth.me();
    setUser(profile);
    setHpBalance(profile.hp_balance || null);
    setWallet(profile.wallet || null);
    setAuthed(true);
    await refreshCart();
    return { ...data, role: profile.role || data?.user?.role || 'student' };
  };

  const logout = async () => {
    try { await liveApi.auth.logout(); } catch { /* ignore */ }
    clearTokens();
    setUser(null); setHpBalance(null); setWallet(null);
    setNotifications([]); setUnreadCount(0); setStreak(null); setSavedItems([]);
    setAuthed(false);
    loadGuestCart();
  };

  const addToCart = async (body) => {
    if (isAuthenticated()) {
      await liveApi.cart.add(body);
      await refreshCart();
    } else {
      const items = readGuestCart();
      let snap = { name: 'Item', price: 0, hp_earn_value: 0, is_available: true };
      try {
        const it = await liveApi.menu.getItem(body.menu_item_id);
        snap = { name: it.name, price: it.price, hp_earn_value: it.hp_earn_value, is_available: it.is_available !== false };
      } catch { /* ignore */ }
      const existing = items.find((ci) => ci.menu_item_id === body.menu_item_id);
      if (existing) existing.quantity += body.quantity || 1;
      else items.push({ id: `gci_${Date.now()}`, menu_item_id: body.menu_item_id, quantity: body.quantity || 1, notes: body.notes || '', selected_variations: body.selected_variations || [], selected_addons: body.selected_addons || [], menu_items: snap });
      writeGuestCart(items);
      loadGuestCart();
    }
  };

  const updateCartItem = async (itemId, body) => {
    if (isAuthenticated()) {
      await liveApi.cart.update(itemId, body);
      await refreshCart();
    } else {
      let items = readGuestCart();
      if (body.quantity === 0) items = items.filter((ci) => ci.id !== itemId);
      else { const it = items.find((ci) => ci.id === itemId); if (it) { if (body.quantity) it.quantity = body.quantity; if (body.notes !== undefined) it.notes = body.notes; } }
      writeGuestCart(items);
      loadGuestCart();
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated()) {
      await liveApi.cart.remove(itemId);
      await refreshCart();
    } else {
      writeGuestCart(readGuestCart().filter((ci) => ci.id !== itemId));
      loadGuestCart();
    }
  };

  const clearCart = async () => {
    if (isAuthenticated()) {
      await liveApi.cart.clear();
      await refreshCart();
    } else {
      writeGuestCart([]);
      loadGuestCart();
    }
  };

  const markNotificationRead = async (id) => { await liveApi.notifications.markRead(id); await refreshNotifications(); };
  const markAllNotificationsRead = async () => { await liveApi.notifications.markAllRead(); await refreshNotifications(); };

  return (
    <HolyGrillContext.Provider value={{
      user, isLoading, cart, cartCount, hpBalance, wallet, notifications, unreadCount, streak, systemSettings, getSetting,
      savedItems, isAuthenticated: authed,
      login, register, logout, refreshUser, refreshStreak, refreshCart, refreshHp, refreshWallet, refreshNotifications, refreshSavedItems,
      addToCart, updateCartItem, removeFromCart, clearCart,
      toggleSavedItem, removeSavedItem, moveSavedToCart, isSavedItem,
      markNotificationRead, markAllNotificationsRead,
    }}>
      {children}
    </HolyGrillContext.Provider>
  );
};

export const useHolyGrill = () => {
  const ctx = useContext(HolyGrillContext);
  if (!ctx) throw new Error('useHolyGrill must be used within HolyGrillProvider');
  return ctx;
};