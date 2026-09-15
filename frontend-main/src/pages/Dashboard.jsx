import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Wallet as WalletIcon, TrendingUp, Lock, ChevronRight, ShoppingBag, Calendar, Trophy, Users, CheckCircle2, Clock, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { formatNaira, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, getTierAccent, getTierProgress } from '@/lib/hgUtils';
import { orderLockMaxReschedules } from '@/lib/appConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import Sparkline from '@/components/Sparkline';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, hpBalance, wallet, streak, getSetting, refreshStreak } = useHolyGrill();
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderLocks, setOrderLocks] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hpTrend, setHpTrend] = useState([]);
  const [now, setNow] = useState(Date.now());

  // Tick every 60s so the order-lock countdown stays live without a reload.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch enough recent orders to find the latest delivered one — the
        // order-lock prompt triggers on the most recent delivery.
        const [orders, locks] = await Promise.all([
          mockApi.orders.list({ limit: 10 }).catch(() => []),
          mockApi.orderLocks.list().catch(() => []),
        ]);
        setRecentOrders(Array.isArray(orders) ? orders : []);
        setOrderLocks(Array.isArray(locks) ? locks : []);
        // Ensure the login streak is fresh — the backend increments on login
        // so we re-fetch on dashboard mount to pick up today's count.
        refreshStreak();
        try { const r = await mockApi.leaderboard.getMyRank(); setRank(r); } catch { /* ignore */ }
        try {
          const txns = await mockApi.hp.getTransactions({ limit: 50 });
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({ day: d.toISOString().split('T')[0], value: 0 });
          }
          const list = txns.transactions || txns.items || (Array.isArray(txns) ? txns : []);
          list.forEach((t) => {
            if (t.amount > 0) {
              const d = (t.created_date || t.created_at || '').split('T')[0];
              const day = days.find((x) => x.day === d);
              if (day) day.value += t.amount;
            }
          });
          setHpTrend(days);
        } catch { /* ignore */ }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Griller';
  const hpActive = hpBalance?.active || 0;
  const streakDays = streak?.current_streak ?? streak?.streak_count ?? streak?.days ?? streak?.count ?? 0;
  const streakCycle = getSetting('streak_cycle_days', 7);
  const cycleDay = streakDays === 0 ? 0 : ((streakDays - 1) % streakCycle) + 1;
  const daysToNext = streakCycle - cycleDay;
  const weeklyOrders = streak?.weekly_order_count ?? streak?.order_streak ?? 0;
  const myRank = rank?.rank_entry?.rank ?? rank?.rank ?? '—';
  const accent = getTierAccent(hpBalance?.hp_earned_120day || 0);
  const tierProgress = getTierProgress(hpBalance?.hp_earned_120day || 0);
  const inGrace = hpBalance?.is_in_grace_period || hpBalance?.tier?.is_in_grace_period;
  const graceEndsAt = hpBalance?.grace_period_ends_at || hpBalance?.tier?.grace_period_ends_at;
  const activeLocks = orderLocks.filter(l => (l.status || 'active') === 'active' && !l.consumed_at);
  const maxReschedules = orderLockMaxReschedules();

  // Order Lock prompt — triggers when the most recent delivered order has no
  // corresponding lock yet. The prompt shows a 24h countdown from delivery;
  // if the user doesn't lock in within that window it disappears. If they
  // already have an active lock, the lock card shows instead.
  const latestDelivered = recentOrders.find(o => o.status === 'delivered');
  const deliveredAt = latestDelivered
    ? new Date(latestDelivered.delivered_at || latestDelivered.updated_date || latestDelivered.created_date || latestDelivered.created_at)
    : null;
  const msSinceDelivery = deliveredAt ? now - deliveredAt.getTime() : null;
  const within24h = msSinceDelivery !== null && msSinceDelivery < 24 * 60 * 60 * 1000;
  const showLockPrompt = !activeLocks.length && latestDelivered && within24h;
  const hoursLeft = showLockPrompt ? Math.max(0, 24 - Math.floor(msSinceDelivery / (60 * 60 * 1000))) : 0;

  /* HP + Wallet — the rank and login streak tiles were removed; they already
     have dedicated cards elsewhere on this dashboard (login streak card above,
     leaderboard strip below). */
  const statTiles = [
    { label: 'HP Balance', value: hpActive, icon: Flame, bg: 'bg-amber-50', iconBg: 'bg-flame-100', iconColor: 'text-flame-600', to: '/hp-education' },
    { label: 'Wallet', value: formatNaira(wallet?.balance || 0), icon: WalletIcon, bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', to: '/wallet' },
  ];

  /* 2×2 solid color quick-action blocks */
  const quickActions = [
    { label: 'Marketplace', subtitle: 'Browse deals', icon: ShoppingBag, to: '/marketplace', bg: 'bg-teal-600' },
    { label: 'Events', subtitle: 'Earn HP', icon: Calendar, to: '/events', bg: 'bg-purple-600' },
  ];
  // chevron affordance is rendered inline in the quick-action block below

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting — tier icon signals tier at a glance */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-flame-600">Welcome back</div>
        <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">{firstName} <span className="text-lg">{accent.icon}</span></h1>
      </div>

      {/* Login streak — auto/system-read, no button. The daily check-in
          button streak has been removed per spec; the login streak keeps the
          flame template. See Confirmed Business Logic: increments on login,
          up to 2 missed days reclaimable via order/wallet top-up, week HP → pending. */}
      <div className={`rounded-2xl ${accent.gradient} p-4 text-white relative overflow-hidden shadow-selected-soft`}>
        <div className="absolute -right-4 -top-4 text-6xl opacity-15">🔥</div>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-white animate-flame-flicker" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-white/80">Login Streak</div>
            </div>
            <div className="text-[10px] text-white/60">{daysToNext === 0 ? 'Week reward ready!' : `${daysToNext}d to week reward`}</div>
          </div>
          <motion.div
            key={streakDays}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="font-heading font-extrabold text-3xl text-white"
          >
            {streakDays} <span className="text-sm font-normal text-white/80">day streak</span>
          </motion.div>
          {/* 7-day calendar strip — visual, auto */}
          <div className="flex justify-between gap-1 mt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <Flame className={`w-4 h-4 ${i < cycleDay ? 'text-white fill-white' : 'text-white/25 fill-none'}`} />
                <span className="text-[8px] text-white/50">{['M','T','W','T','F','S','S'][i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-[10px] text-white/70 leading-relaxed">
            {cycleDay >= streakCycle
              ? '🔥 Week complete — HP on the way to your pending balance.'
              : `Log back in ${daysToNext} more day${daysToNext === 1 ? '' : 's'} to complete the week.`}
          </div>
          <Link to="/streak" className="block text-center mt-2 text-[10px] font-bold text-white/80 hover:text-white underline">View streak calendar →</Link>
        </div>
      </div>

      {/* HP trend — full width sparkline + tier progress + grace state */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-cart-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-flame-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-flame-600" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">HP · 7 days</div>
          </div>
          <span className="text-xs font-bold text-flame-600">{hpTrend.reduce((s, d) => s + d.value, 0)}</span>
        </div>
        <Sparkline data={hpTrend} height={48} />
        {/* Tier progress folded into the same card */}
        {tierProgress?.next && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{tierProgress.current.name} → {tierProgress.next.name}</span>
              <span className="text-[10px] font-bold text-flame-600">{tierProgress.remaining} HP to next tier</span>
            </div>
            <div className="h-2 rounded-full bg-cocoa-100 overflow-hidden">
              <div className="h-full rounded-full flame-gradient transition-all" style={{ width: `${Math.min(100, tierProgress.pct || 0)}%` }} />
            </div>
          </div>
        )}
        {inGrace && (
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-[11px] text-amber-700 font-semibold">
              Tier grace period active{graceEndsAt ? ` · ends ${new Date(graceEndsAt).toLocaleDateString()}` : ''}. Earn HP to keep your tier.
            </div>
          </div>
        )}
      </div>

      {/* 2×2 stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {statTiles.map(tile => (
          <Link key={tile.label} to={tile.to} className={`rounded-2xl ${tile.bg} border border-cocoa-100 p-4 hover:shadow-md transition-all relative`}>
            <ChevronRight className="w-4 h-4 text-cocoa-300 absolute top-3 right-3" />
            <div className={`w-9 h-9 rounded-full ${tile.iconBg} flex items-center justify-center mb-2`}>
              <tile.icon className={`w-5 h-5 ${tile.iconColor}`} />
            </div>
            <div className="font-heading font-extrabold text-lg text-cocoa-800">{tile.value}</div>
            <div className="text-xs text-cocoa-400 font-medium">{tile.label}</div>
          </Link>
        ))}
      </div>

      {/* Order Lock — shows only when triggered by a delivered order (no active
           lock yet) or when the user already has an active lock. The prompt
           has a 24h countdown; if the user doesn't lock in, it disappears. */}
      {activeLocks.map(lock => {
        const lockedDate = lock.locked_date ? new Date(lock.locked_date) : null;
        const daysToLock = lockedDate ? Math.ceil((lockedDate.getTime() - now) / (24 * 60 * 60 * 1000)) : null;
        const isHp = (lock.reward_type || lock.reward) === 'hp';
        const reschedulesLeft = maxReschedules - (lock.reschedule_count || 0);
        return (
          <Link key={lock.id} to="/order-locks" className="block rounded-2xl bg-amber-50 border border-flame-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-flame-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-cocoa-800">
                  {isHp ? `${lock.reward_hp_amount || 0} HP reward locked` : `${lock.discount_pct || 0}% off locked`}
                  {reschedulesLeft > 0 && <span className="ml-1 text-[10px] font-normal text-cocoa-400">· {reschedulesLeft} reschedule{reschedulesLeft !== 1 ? 's' : ''} left</span>}
                </div>
                <div className="text-xs text-cocoa-500">
                  {lockedDate ? `Order on ${lockedDate.toLocaleDateString()} to claim · ${daysToLock > 0 ? `${daysToLock} day${daysToLock !== 1 ? 's' : ''} to go` : 'today!'}` : 'Tap to view'}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-flame-600 shrink-0" />
            </div>
          </Link>
        );
      })}

      {/* Lock-in prompt — delivered order, no lock yet, within 24h */}
      {showLockPrompt && (
        <Link to="/order-locks" className="block rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 p-4 text-white hover:scale-[1.01] transition-transform shadow-selected-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-sm text-white">Lock in your next order! 🔥</div>
              <div className="text-xs text-white/85 mt-0.5">Your order was delivered — lock in your next date to claim a reward or discount.</div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-white/90">
                <Timer className="w-3 h-3" />
                {hoursLeft}h left
              </div>
              <div className="text-[9px] text-white/60">to lock in</div>
            </div>
          </div>
        </Link>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading font-bold text-lg text-cocoa-800">Recent Orders</h2>
          <Link to="/orders" className={`text-xs font-bold ${accent.text}`}>See all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="rounded-2xl bg-white border border-cocoa-100 p-6 text-center">
            <ShoppingBag className="w-8 h-8 text-cocoa-200 mx-auto mb-2" />
            <p className="text-sm text-cocoa-400">No orders yet</p>
            <button onClick={() => navigate('/menu')} className="mt-2 text-xs font-bold text-flame-600">Start ordering →</button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(order => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-2xl bg-white border border-cocoa-100 p-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-cocoa-100 text-cocoa-600'}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-[10px] text-cocoa-400">{new Date(order.created_date || order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-cocoa-600 mt-1 truncate font-medium">
                      {order.order_items?.[0]?.quantity || 1}× {order.order_items?.[0]?.name_snapshot || order.order_items?.[0]?.name || 'Item'}
                      {order.order_items?.length > 1 && ` +${order.order_items.length - 1} more`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-bold text-flame-600 text-sm whitespace-nowrap">{formatNaira(order.total_amount || order.total || 0)}</span>
                    <ChevronRight className="w-4 h-4 text-cocoa-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Order streak — lightweight horizontal row under Recent Orders */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${accent.light} border ${accent.lightBorder}`}>
        <Flame className={`w-4 h-4 ${accent.text} shrink-0`} />
        <span className="text-xs font-semibold text-cocoa-700">
          {weeklyOrders > 0
            ? `${weeklyOrders} week${weeklyOrders !== 1 ? 's' : ''} running 🔥 — order this week to keep it`
            : 'Order this week to start your order streak 🔥'}
        </span>
      </div>

      {/* Quick-action grid — solid color blocks */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(a => (
          <Link key={a.label} to={a.to} className={`relative rounded-2xl ${a.bg} p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform`}>
            <a.icon className="w-6 h-6 text-white" />
            <div className="font-heading font-bold text-base text-white">{a.label}</div>
            <div className="text-xs text-white/80">{a.subtitle}</div>
            <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-white/70" />
          </Link>
        ))}
      </div>

      {/* Leaderboard strip */}
      <Link to="/leaderboard" className={`block rounded-2xl ${accent.bg} p-4 hover:scale-[1.01] transition-transform`}>
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-white shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-heading font-extrabold text-xl text-white">#{myRank}</div>
            <div className="text-xs text-white/85">Keep ordering to climb the ranks 🔥</div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
        </div>
      </Link>

      {/* Referral Wins */}
      <Link to="/referrals" className="block rounded-2xl bg-white border border-cocoa-100 p-4 hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm text-cocoa-800">Referral Wins</div>
            <div className="text-xs text-cocoa-400">{getSetting('referral_hp_reward', 75)} HP per referral · Invite friends to earn</div>
          </div>
          <ChevronRight className="w-5 h-5 text-cocoa-300" />
        </div>
      </Link>
    </div>
  );
}