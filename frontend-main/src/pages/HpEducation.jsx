import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Gift, TrendingUp, Calendar, Star, Lock, ChevronRight, HelpCircle, Send } from 'lucide-react';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { isFeatureEnabled } from '@/lib/featureConfig';
import { TIERS } from '@/lib/mockData';
import { getTierProgress } from '@/lib/hgUtils';
import HpDisplay from '@/components/HpDisplay';
import HpHistoryLedger from '@/components/HpHistoryLedger';
import HpTransferModal from '@/components/HpTransferModal';
import LoadingSpinner from '@/components/LoadingSpinner';

/* Holy Points Education page — the single home for the brown HP balance
 * box plus everything a student needs to understand how HP work. This is
 * NOT the rewards page; redeeming lives at /rewards. Everything here pulls
 * from the central design tokens. */
const EARN_WAYS = [
  { icon: Flame, title: 'Order food', body: 'Every order earns HP based on what you spend. Bigger orders, bigger flames.', to: '/menu' },
  { icon: TrendingUp, title: 'Login streaks', body: 'Show up daily. Consecutive logins stack a streak bonus on top of your earnings.', to: '/streak' },
  { icon: Calendar, title: 'Event check-ins', body: 'Show up to Holy Grill events and check in for a flat HP drop.', to: '/events' },
  { icon: Star, title: 'Reviews & referrals', body: 'Leave a review or bring a friend — both pay out HP the moment they land.', to: '/referrals' },
];

const FAQ = [
  { q: 'What is the difference between Active and Pending HP?', a: 'Active HP is spendable right now on rewards. Pending HP is locked until you place food orders — every ₦1,000 of food spend unlocks 30 HP from your pending pool.' },
  { q: 'Do my Holy Points expire?', a: 'Your tier is calculated from HP earned in the last 120 days. HP themselves stay on your balance, but your tier can drop if you stop earning.' },
  { q: 'How do tiers and multipliers work?', a: 'The more HP you earn in 120 days, the higher your tier. Higher tiers multiply every HP you earn — so the rich get richer, faster.' },
  { q: 'Where do I spend my HP?', a: 'Head to the Rewards page to redeem HP for free sides, upgrades, and exclusive drops.' },
];

export default function HpEducation() {
  const { hpBalance } = useHolyGrill();
  const [showTransfer, setShowTransfer] = useState(false);
  const hpTransferEnabled = isFeatureEnabled('hp_transfer', true);

  if (!hpBalance) return <LoadingSpinner label="Loading Holy Points..." />;

  const tierInfo = getTierProgress(hpBalance.hp_earned_120day);

  return (
    <div className="space-y-lg animate-fade-in">
      {/* Header */}
      <div>
        <p className="hg-caption text-gold-500 font-bold">Holy Points</p>
        <h1 className="font-heading font-bold text-2xl text-foreground">How HP Work 🔥</h1>
      </div>

      {/* The brown HP balance box — lives HERE, not on the dashboard */}
      <HpDisplay hpBalance={hpBalance} />

      {/* HP transfer — backend rule exists; surfaced here + on the Wallet */}
      {hpTransferEnabled && (
        <button onClick={() => setShowTransfer(true)} className="w-full hg-card flex items-center gap-md hover:shadow-md transition-all text-left">
          <div className="w-10 h-10 shrink-0 rounded-pill bg-purple-100 flex items-center justify-center">
            <Send className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-heading font-bold text-sm text-foreground">Send HP to a friend</div>
            <p className="hg-caption">Transfer active HP to a fellow student — min 10 HP.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* What are Holy Points */}
      <section className="hg-card space-y-sm">
        <span className="hg-eyebrow">The basics</span>
        <h2 className="font-heading font-bold text-lg text-foreground">What are Holy Points?</h2>
        <p className="hg-body">
          Holy Points (HP) are Holy Grill’s reward currency. You earn them by ordering, showing up,
          and staying consistent — then spend them on free food, upgrades, and exclusive drops.
          The more you earn in 120 days, the higher your tier climbs, and the faster you earn.
        </p>
      </section>

      {/* How you earn */}
      <section className="space-y-md">
        <h2 className="font-heading font-bold text-lg text-foreground">How you earn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {EARN_WAYS.map((w) => (
            <Link key={w.title} to={w.to} className="hg-card flex gap-md items-start hover:shadow-md transition-all">
              <div className="w-10 h-10 shrink-0 rounded-pill bg-flame-50 flex items-center justify-center">
                <w.icon className="w-5 h-5 text-flame-600" />
              </div>
              <div className="flex-1">
                <div className="font-heading font-bold text-sm text-foreground">{w.title}</div>
                <p className="hg-body mt-1 text-muted-foreground">{w.body}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
            </Link>
          ))}
        </div>
      </section>

      {/* Tiers & multipliers */}
      <section className="space-y-md">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-foreground">Tiers &amp; multipliers</h2>
          {tierInfo.next && (
            <span className="hg-caption">{tierInfo.remaining} HP to {tierInfo.next.name}</span>
          )}
        </div>
        <div className="space-y-sm">
          {TIERS.map((tier) => {
            const isCurrent = tierInfo.current.id === tier.id;
            const isPassed = (hpBalance.hp_earned_120day || 0) >= tier.min_points;
            return (
              <div
                key={tier.id}
                className={`hg-card flex items-center gap-md ${isCurrent ? 'ring-2 ring-flame-300' : ''}`}
              >
                <div className="text-2xl">{tier.icon}</div>
                <div className="flex-1">
                  <div className="font-heading font-bold text-sm text-foreground">{tier.name}</div>
                  <div className="hg-caption">{tier.min_points.toLocaleString()} HP earned in 120 days</div>
                </div>
                <div className="text-right">
                  <div className="font-heading font-bold text-flame-600">{tier.earn_multiplier.toFixed(2)}×</div>
                  <div className="hg-caption">earn rate</div>
                </div>
                {isPassed ? (
                  <Flame className="w-5 h-5 text-flame-600" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Spend them */}
      <Link to="/rewards" className="hg-card flex items-center gap-md hover:shadow-md transition-all">
        <div className="w-10 h-10 shrink-0 rounded-pill bg-gold-100 flex items-center justify-center">
          <Gift className="w-5 h-5 text-gold-500" />
        </div>
        <div className="flex-1">
          <div className="font-heading font-bold text-sm text-foreground">Spend your HP</div>
          <p className="hg-caption">Redeem rewards, spin the wheel, complete challenges.</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </Link>

      {/* HP History — the complete immutable ledger */}
      <HpHistoryLedger />

      {/* FAQ */}
      <section className="space-y-md">
        <div className="flex items-center gap-sm">
          <HelpCircle className="w-5 h-5 text-flame-600" />
          <h2 className="font-heading font-bold text-lg text-foreground">Questions</h2>
        </div>
        <div className="space-y-sm">
          {FAQ.map((item) => (
            <div key={item.q} className="hg-card space-y-sm">
              <div className="font-heading font-bold text-sm text-foreground">{item.q}</div>
              <p className="hg-body text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <HpTransferModal open={showTransfer} onClose={() => setShowTransfer(false)} />
    </div>
  );
}