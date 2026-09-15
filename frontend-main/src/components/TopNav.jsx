import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ShoppingCart, Bell, User, ChevronDown, Wallet, MapPin, Settings, Gift, LogOut, LayoutDashboard, ClipboardList, Award } from 'lucide-react';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { getTierProgress, getTierAccent } from '@/lib/hgUtils';

/**
 * Refined desktop-first top navigation.
 *
 *  · Left  — wordmark + tagline
 *  · Center— six core links with an animated active indicator
 *  · Right — cart, notifications, profile menu with tier card + account links
 *
 * The header is intentionally airy, slim and quiet so the page content
 * beneath it can breathe. The flame accent only appears where it earns
 * attention: the logo mark, the active link, and the tier ring.
 */
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/orders', label: 'My Orders' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/rewards', label: 'Rewards' },
];

export default function TopNav() {
  const { user, hpBalance, cartCount, unreadCount, logout } = useHolyGrill();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  const tierInfo = hpBalance ? getTierProgress(hpBalance.hp_earned_120day) : null;
  const tierAccent = hpBalance ? getTierAccent(hpBalance.hp_earned_120day) : null;
  const hpActive = hpBalance?.active ?? 0;

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-cocoa-100/80">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 rounded-xl flame-gradient flex items-center justify-center shadow-lg shadow-flame-600/25 transition-transform group-hover:scale-105">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none hidden sm:block">
            <div className="font-heading font-extrabold text-[17px] tracking-tight text-cocoa-800">HOLY GRILLS</div>
            <div className="text-[9px] text-cocoa-400 font-semibold tracking-[0.18em] mt-0.5">FUTA'S FLAME GRILL</div>
          </div>
        </Link>

        {/* Centre nav — desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                  active ? 'text-flame-600' : 'text-cocoa-500 hover:text-cocoa-800'
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2.5 -bottom-px h-[2.5px] rounded-full flame-gradient"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* HP pill — quiet status, only for signed-in users */}
          {user && (
            <button
              onClick={() => navigate('/hp-education')}
              className="hidden sm:flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-flame-50 border border-flame-100 hover:bg-flame-100 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-flame-500" />
              <span className="text-xs font-bold text-flame-600 tabular-nums">{hpActive}</span>
            </button>
          )}

          {/* Cart */}
          <button onClick={() => navigate('/cart')} className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-cocoa-100/70 active:scale-95 transition-all" aria-label="Cart">
            <ShoppingCart className="w-[18px] h-[18px] text-cocoa-600" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-flame-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')} className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-cocoa-100/70 active:scale-95 transition-all" aria-label="Notifications">
            <Bell className="w-[18px] h-[18px] text-cocoa-600" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-flame-600 text-white text-[10px] font-bold ring-2 ring-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Profile dropdown — or Sign In for guests */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-cocoa-100/70 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flame-gradient flex items-center justify-center text-white text-xs font-bold ring-2 ${tierAccent?.ring || 'ring-flame-500/30'}`}>
                  {user?.full_name?.charAt(0) || 'J'}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-cocoa-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl shadow-cocoa-900/10 border border-cocoa-100 overflow-hidden"
                  >
                    {user && tierInfo && (
                      <div className="p-4 bg-gradient-to-br from-cocoa-800 to-cocoa-900 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full flame-gradient flex items-center justify-center text-white font-bold text-base shrink-0">
                            {user.full_name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{user.full_name}</div>
                            <div className="text-[11px] text-cocoa-300 truncate">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3.5">
                          <span className="text-lg">{tierInfo.current.icon}</span>
                          <div className="flex-1">
                            <div className="text-[10px] uppercase tracking-wider text-cocoa-300">Tier</div>
                            <div className="font-bold text-sm">{tierInfo.current.name} · {tierInfo.current.earn_multiplier}x</div>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-cocoa-700/60 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${tierInfo.progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full flame-gradient rounded-full"
                          />
                        </div>
                        {tierInfo.next && (
                          <div className="text-[10px] text-cocoa-300 mt-1.5">{tierInfo.remaining} HP to {tierInfo.next.name}</div>
                        )}
                      </div>
                    )}
                    <div className="py-1.5">
                      {/* Rewards */}
                      <div className="px-4 pt-1.5 pb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-gold-600">Rewards</div>
                      <Link to="/hp-education" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <Flame className="w-4 h-4 text-gold-500" />
                        Holy Points
                      </Link>
                      <Link to="/rewards" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <Award className="w-4 h-4 text-gold-500" />
                        Rewards
                      </Link>
                      <Link to="/referrals" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <Gift className="w-4 h-4 text-gold-500" />
                        Referrals
                      </Link>

                      {/* Account */}
                      <div className="px-4 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-cocoa-400">Account</div>
                      <button onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <User className="w-4 h-4 text-cocoa-500" />
                        Profile & Settings
                      </button>
                      <button onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <LayoutDashboard className="w-4 h-4 text-cocoa-500" />
                        Dashboard
                      </button>
                      <button onClick={() => { setDropdownOpen(false); navigate('/orders'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <ClipboardList className="w-4 h-4 text-cocoa-500" />
                        My Orders
                      </button>
                      <Link to="/wallet" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <Wallet className="w-4 h-4 text-cocoa-500" />
                        Wallet
                      </Link>
                      <Link to="/addresses" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <MapPin className="w-4 h-4 text-cocoa-500" />
                        Addresses
                      </Link>
                      <Link to="/notification-preferences" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cocoa-50 transition-colors text-[13px] text-cocoa-700">
                        <Settings className="w-4 h-4 text-cocoa-500" />
                        Notification Preferences
                      </Link>

                      <div className="border-t border-cocoa-100 my-1.5" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-[13px] text-flame-600"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-full flame-gradient text-white text-xs font-bold shadow-sm shadow-flame-600/20 hover:shadow-md transition-shadow">Sign In</button>
          )}
        </div>
      </div>
    </header>
  );
}