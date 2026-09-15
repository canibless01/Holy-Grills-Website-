import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Clock, ChevronRight, TrendingUp, Gift, Trophy, Zap, Calendar, ShoppingBag, Wallet as WalletIcon } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { getLaunchWindowEndDate, getFirstOrderGiftItemName } from '@/lib/featureConfig';
import { orderingWindowOpenTime, orderingWindowCloseTime } from '@/lib/appConfig';
import { toast } from '@/components/ui/use-toast';
import MenuItemCard from '@/components/MenuItemCard';
import HeroCarousel from '@/components/HeroCarousel';
import AutoScrollCarousel from '@/components/AutoScrollCarousel';
import TestimonialsSection from '@/components/TestimonialsSection';
import NewsletterSection from '@/components/NewsletterSection';
import EarlySupportersSection from '@/components/EarlySupportersSection';
import KitchenClosedPopup from '@/components/KitchenClosedPopup';
import ActiveOrderCard from '@/components/ActiveOrderCard';
import SquadOrderEducation from '@/components/SquadOrderEducation';
import CateringCard from '@/components/CateringCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const TESTIMONIALS = [
  { text: "It was wonderful 😭 I was even so full I couldn't finish my chips. But it was lovely, I enjoyed the sausage so much with the sauce.", name: 'Omoayena A' },
  { text: "It's so nice. The fries were honestly the best I've had this year. The chicken was so well seasoned and well grilled.", name: 'Owoeye I.B' },
  { text: "It was wonderful. I loved the portion size of the fries. The chicken was very tender too.", name: 'Filani O.P' },
  { text: "Best grill on campus, hands down. The HP rewards make it even sweeter.", name: 'Adewale T' },
];

const HOLY_POINTS_FEATURES = [
  { icon: Flame, title: 'Earn on orders', body: 'Every order earns HP.', to: '/menu' },
  { icon: Trophy, title: 'Leaderboard', body: 'Climb the ranks.', to: '/leaderboard' },
  { icon: Gift, title: 'Redeem rewards', body: 'Free sides + drops.', to: '/rewards' },
  { icon: Zap, title: 'Streak bonus', body: 'Consistency = multiplier.', popup: 'streak' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, hpBalance, addToCart, isAuthenticated, streak } = useHolyGrill();
  const [kitchenStatus, setKitchenStatus] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [myRank, setMyRank] = useState(null);
  const launchWindowEnd = getLaunchWindowEndDate();
  const giftItemName = getFirstOrderGiftItemName();

  useEffect(() => {
    const load = async () => {
      try {
        const [items, status] = await Promise.all([
          mockApi.menu.getItems({ is_featured: 'true' }),
          mockApi.orders.getDeliveryWindowStatus(),
        ]);
        // Fall back to the first available items if the backend has none flagged
        // featured — the auto-scroll carousel should always be visible to guests
        // and signed-in users alike.
        let featured = items.items || [];
        if (!featured.length) {
          const all = await mockApi.menu.getItems({});
          featured = (all.items || []).filter((i) => i.is_available !== false).slice(0, 8);
        }
        setFeaturedItems(featured);
        setKitchenStatus(status);
        if (isAuthenticated) {
          try { setMyRank(await mockApi.leaderboard.getMyRank()); } catch { /* ignore */ }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleQuickAdd = async (item) => {
    const detail = await mockApi.menu.getItem(item.id);
    const addons = await mockApi.menu.getAddons(item.id);
    const hasRequired = (detail.variation_groups || []).some((vg) => vg.is_required) || (addons.addon_groups || []).some((ag) => ag.is_required);
    if (!hasRequired) {
      await addToCart({ menu_item_id: item.id, quantity: 1 });
      toast({ title: '🔥 Added to your cart', description: `${item.name} is ready to checkout.`, sound: 'cart_add' });
    } else {
      navigate(`/menu/${item.id}`);
    }
  };

  const handleCta = () => navigate('/menu');

  if (loading) return <LoadingSpinner label="Loading..." />;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="space-y-8">

      {/* Hero carousel */}
      <HeroCarousel onCta={handleCta} />

      {/* Launch window promo — first-order gift */}
      {launchWindowEnd && (
        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div className="flex-1">
            <div className="font-bold text-sm">Free {giftItemName} on your first order!</div>
            <div className="text-xs text-white/80">First-order gift promo ends {new Date(launchWindowEnd).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Kitchen Radar — reads ordering windows from backend config */}
      {kitchenStatus && (() => {
        const openTime = orderingWindowOpenTime();
        const closeTime = orderingWindowCloseTime();
        return (
        <div className="hg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${kitchenStatus.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className={`absolute inset-0 w-3 h-3 rounded-full animate-pulse-ring ${kitchenStatus.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <span className="hg-eyebrow text-cocoa-400">Kitchen Radar</span>
            </div>
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${kitchenStatus.is_open ? 'text-green-600' : 'text-flame-600'}`}>
              {kitchenStatus.is_open ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Open Now
                </>
              ) : 'Closed'}
            </span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-heading font-bold text-base text-cocoa-800">
                {kitchenStatus.is_open ? 'Kitchen is open now' : 'Kitchen is closed'}
              </div>
              <div className="text-xs text-cocoa-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {kitchenStatus.active_window ? kitchenStatus.active_window.label : kitchenStatus.message || 'Check back soon'}
              </div>
              {/* Backend-configured ordering window */}
              <div className="text-[11px] text-cocoa-500 font-medium mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Ordering window: {openTime} – {closeTime}
              </div>
            </div>
            <button onClick={handleCta} disabled={!kitchenStatus.is_open} className="px-5 py-2.5 rounded-button flame-gradient text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
              {kitchenStatus.is_open ? 'Start order' : 'Closed'}
            </button>
          </div>
        </div>
        );
      })()}

      {/* Quick stats — auth only. HP + Rank read live; Reward card replaced
          with an Active Order card (status + real-time tracking). */}
      {isAuthenticated && (
      <div className="grid grid-cols-3 gap-2.5">
        <Link to="/dashboard" className="flex items-center gap-2.5 rounded-xl bg-white border border-cocoa-100 px-3 py-2.5 hover:border-flame-200 transition-colors">
          <Flame className="w-4 h-4 text-flame-600 shrink-0" />
          <div className="min-w-0">
            <div className="font-heading font-bold text-base text-cocoa-800 leading-tight">{hpBalance?.active || 0}</div>
            <div className="text-[10px] text-cocoa-400 font-medium leading-tight">Holy Points</div>
          </div>
        </Link>
        <Link to="/leaderboard" className="flex items-center gap-2.5 rounded-xl bg-white border border-cocoa-100 px-3 py-2.5 hover:border-flame-200 transition-colors">
          <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="min-w-0">
            <div className="font-heading font-bold text-base text-cocoa-800 leading-tight">#{myRank?.rank_entry?.rank ?? '—'}</div>
            <div className="text-[10px] text-cocoa-400 font-medium leading-tight">Your Rank</div>
          </div>
        </Link>
        <ActiveOrderCard />
      </div>
      )}

      {/* Featured menu — auto-scroll carousel (motion + swipeable) */}
      {featuredItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="hg-eyebrow">Selar-aligned menu</span>
              <h2 className="font-heading font-bold text-lg text-cocoa-800">Real Grill. Real Flavour. 🔥</h2>
            </div>
            <Link to="/menu" className="text-xs font-bold text-flame-600 flex items-center gap-0.5">
              View full menu <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <AutoScrollCarousel speed={30}>
            {featuredItems.map((item) => (
              <div key={item.id} className="w-44 flex-shrink-0 snap-start">
                <MenuItemCard item={item} onAdd={handleQuickAdd} />
              </div>
            ))}
          </AutoScrollCarousel>
        </div>
      )}

      {/* Holy Points — gradient background reserved for this one banner */}
      <div className="rounded-2xl flame-gradient p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-8xl opacity-15">🔥</div>
        <div className="relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-300">Holy Points</span>
          <h2 className="font-heading font-bold text-xl mt-1 mb-2">Eat. Earn. Come Back. 🔥</h2>
          <p className="text-sm text-white/85 max-w-md mb-5">
            Every Holy Grills order earns you Holy Points. Stack them. Climb the leaderboard. Unlock rewards.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {HOLY_POINTS_FEATURES.map((f) => {
              const streakDays = streak?.current_streak ?? streak?.days ?? streak?.count ?? 0;
              const content = (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <f.icon className={`w-5 h-5 ${f.popup === 'streak' ? 'animate-flame-flicker' : ''}`} />
                    {f.popup === 'streak' && isAuthenticated && (
                      <span className="text-lg font-heading font-extrabold text-gold-300">{streakDays}</span>
                    )}
                  </div>
                  <div className="font-bold text-sm mb-0.5">{f.title}</div>
                  <div className="text-xs text-white/75 leading-relaxed">{f.body}</div>
                </>
              );
              if (f.popup === 'streak') {
                return (
                  <button key={f.title} onClick={() => setShowStreakPopup(true)} className="text-left rounded-xl bg-white/10 border border-white/20 p-4 backdrop-blur-sm hover:bg-white/15 active:scale-95 transition-all">
                    {content}
                  </button>
                );
              }
              return (
                <Link key={f.title} to={f.to} className="rounded-xl bg-white/10 border border-white/20 p-4 backdrop-blur-sm hover:bg-white/15 active:scale-95 transition-all">
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Squad Order education — visible to guests too */}
      <SquadOrderEducation />

      {/* Catering — storefront-driven, visible to guests too */}
      <CateringCard />

      {/* Quick-link color blocks — solid fills, white text */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/events" className="rounded-2xl bg-purple-600 p-5 flex flex-col gap-2 hover:scale-[1.02] transition-transform">
          <Calendar className="w-6 h-6 text-white" />
          <div className="font-heading font-bold text-base text-white">Events</div>
          <div className="text-xs text-white/80">Earn HP</div>
        </Link>
        <Link to="/marketplace" className="rounded-2xl bg-teal-600 p-5 flex flex-col gap-2 hover:scale-[1.02] transition-transform">
          <ShoppingBag className="w-6 h-6 text-white" />
          <div className="font-heading font-bold text-base text-white">Marketplace</div>
          <div className="text-xs text-white/80">Browse deals</div>
        </Link>
        <Link to="/wallet" className="rounded-2xl bg-green-600 p-5 flex flex-col gap-2 hover:scale-[1.02] transition-transform">
          <WalletIcon className="w-6 h-6 text-white" />
          <div className="font-heading font-bold text-base text-white">Wallet</div>
          <div className="text-xs text-white/80">Fund · Pay</div>
        </Link>
        <Link to="/leaderboard" className="rounded-2xl bg-amber-500 p-5 flex flex-col gap-2 hover:scale-[1.02] transition-transform">
          <Trophy className="w-6 h-6 text-white" />
          <div className="font-heading font-bold text-base text-white">Leaderboard</div>
          <div className="text-xs text-white/80">Climb the ranks</div>
        </Link>
      </div>

      {/* Early supporters */}
      <EarlySupportersSection />

      {/* Testimonials — grid on desktop, slider on mobile */}
      <TestimonialsSection testimonials={TESTIMONIALS} />

      {/* Newsletter — Fire Feast Squad signup */}
      <NewsletterSection />
      </motion.div>

      {/* Streak bonus popup — rendered outside the page's transformed wrapper
          so its fixed inset-0 backdrop covers the full viewport (no gaps). */}
      {showStreakPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowStreakPopup(false)}>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm text-center animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-1">
              <button onClick={() => setShowStreakPopup(false)} className="text-cocoa-400 text-xs font-bold">✕</button>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 rounded-full flame-gradient flex items-center justify-center mx-auto mb-3 shadow-selected"
            >
              <Flame className="w-9 h-9 text-white" />
            </motion.div>
            <h3 className="font-heading font-bold text-base text-cocoa-800">Your Streak 🔥</h3>
            <motion.div
              key={streak?.current_streak ?? 0}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="font-heading font-extrabold text-4xl text-flame-600 my-2"
            >
              {streak?.current_streak ?? streak?.days ?? streak?.count ?? 0}
            </motion.div>
            <p className="text-xs text-cocoa-500">days of consistent ordering. Keep the flame alive — your HP multiplier grows with every order.</p>
            <button onClick={() => { setShowStreakPopup(false); navigate('/menu'); }} className="mt-4 w-full py-3 rounded-xl flame-gradient text-white font-bold text-sm">Keep it burning →</button>
          </motion.div>
        </div>
      )}

      {/* Kitchen Closed popup (auto-shows when closed) */}
      <KitchenClosedPopup status={kitchenStatus} scheduledWindows={kitchenStatus?.scheduled_windows || []} />
    </>
  );
}