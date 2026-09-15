import React, { useState, useEffect } from 'react';
import { Flame, Lock, Gift, Award, Target, X, History, GraduationCap, Sparkles, Crown, Zap, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { getTierProgress } from '@/lib/hgUtils';
import { TIERS } from '@/lib/mockData';
import { getFreeSideOptions, getSetting, isFeatureEnabled, getStreakRewardHp } from '@/lib/featureConfig';
import { graduationMinLevel, graduationHp, lowCodeInventoryThreshold, freeSideCreditsValidityDays, exclusiveSpinValidityDays, flashRedemptionsEnabled, flashMaxQty, reviewHp } from '@/lib/appConfig';
import { expiryLabel, EXCLUSIVE_SPIN_PRIZES } from '@/lib/rewardUtils';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import SpinWheel from '@/components/SpinWheel';

const CATEGORY_LABELS = { food: 'Food', discount: 'Wallet', experience: 'Experience' };

// Normalise the various possible flash-sale field names the backend may return
// into a single flash shape: { active, hpCost, normalHpCost, startsAt, endsAt,
// slotsRemaining, maxQty }.
const normFlash = (r) => {
  const active = !!(r.flash_active ?? r.is_flash ?? r.flash_sale_active ?? r.flash?.active);
  if (!active) return null;
  const f = r.flash || {};
  const hpCost = r.flash_hp_cost ?? r.flash_price ?? f.hp_cost ?? f.price;
  const normalHpCost = r.hp_cost ?? r.normal_hp_cost ?? f.normal_hp_cost;
  return {
    active,
    hpCost,
    normalHpCost,
    startsAt: r.flash_window_starts_at ?? r.flash_starts_at ?? f.starts_at ?? f.window_starts_at,
    endsAt: r.flash_window_ends_at ?? r.flash_ends_at ?? f.ends_at ?? f.window_ends_at,
    slotsRemaining: r.flash_slots_remaining ?? r.flash_slots_left ?? f.slots_remaining ?? f.slots_left,
    maxQty: r.flash_max_qty ?? r.flash_slots ?? f.max_qty ?? f.slots,
  };
};

// Format a countdown to a flash window end as "2h 30m left" / "12m left".
const formatCountdown = (endsAt) => {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'Ended';
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 24) return `${Math.ceil(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
};

export default function Rewards() {
  const { hpBalance, refreshHp, streak } = useHolyGrill();
  const [tab, setTab] = useState('redeem');
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [spinHistory, setSpinHistory] = useState([]);
  const [unlockHistory, setUnlockHistory] = useState([]);
  const [completing, setCompleting] = useState(null);
  const [graduationStatus, setGraduationStatus] = useState(null);
  const [claimingGrad, setClaimingGrad] = useState(false);
  const [freeSideCredits, setFreeSideCredits] = useState({ count: 0, expires_at: null });
  const [exclusiveStatus, setExclusiveStatus] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [flashRedeeming, setFlashRedeeming] = useState(null);

  const handleFlashRedeem = async (reward) => {
    setFlashRedeeming(reward.id);
    try {
      await mockApi.hp.flashRedeem(reward.id);
      await refreshHp();
      toast({ title: '⚡ Flash reward redeemed!', description: `${reward.name} unlocked at flash price.` });
      const r = await mockApi.rewards.list();
      setRewards(r);
    } catch (e) {
      toast({ title: 'Flash redemption failed', description: e.message, variant: 'destructive' });
    }
    setFlashRedeeming(null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [r, myChallenges, gradStatus, fsc, exStatus, red] = await Promise.all([
          mockApi.rewards.list(),
          mockApi.challenges.my().catch(() => []),
          mockApi.graduation.getStatus().catch(() => null),
          mockApi.rewards.getFreeSideCredits().catch(() => ({ count: 0, expires_at: null })),
          mockApi.hp.getExclusiveSpinStatus().catch(() => null),
          mockApi.rewards.getRedemptions().catch(() => []),
        ]);
        setRewards(r);
        setChallenges(myChallenges);
        setGraduationStatus(gradStatus);
        setFreeSideCredits(fsc);
        setExclusiveStatus(exStatus);
        setRedemptions(Array.isArray(red) ? red : (red?.redemptions || []));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleGraduationClaim = async () => {
    setClaimingGrad(true);
    try {
      await mockApi.graduation.claim({});
      await refreshHp();
      toast({ title: '🎓 Graduation HP claimed!', description: 'Your graduation reward has been submitted for approval.' });
      setGraduationStatus({ ...graduationStatus, already_claimed: true });
    } catch (e) {
      toast({ title: 'Claim failed', description: e.message, variant: 'destructive' });
    }
    setClaimingGrad(false);
  };

  const loadHistory = async () => {
    try {
      const [spins, unlocks] = await Promise.all([
        mockApi.hp.getSpinHistory({ limit: 20 }).catch(() => []),
        mockApi.hp.getUnlockHistory({ limit: 20 }).catch(() => []),
      ]);
      setSpinHistory(spins);
      setUnlockHistory(unlocks);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompleteChallenge = async (ch) => {
    setCompleting(ch.id);
    try {
      await mockApi.challenges.complete(ch.id);
      await refreshHp();
      const myChallenges = await mockApi.challenges.my().catch(() => []);
      setChallenges(myChallenges);
      toast({ title: '🎉 Challenge complete!', description: 'Bonus HP added.' });
    } catch (e) {
      toast({ title: 'Could not complete', description: e.message, variant: 'destructive' });
    }
    setCompleting(null);
  };

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      const res = await mockApi.rewards.redeem(selectedReward.id);
      await refreshHp();
      try { const red = await mockApi.rewards.getRedemptions(); setRedemptions(Array.isArray(red) ? red : (red?.redemptions || [])); } catch { /* ignore */ }
      // Spec response: { redemption: { status, fulfillment_type }, hp_spent, message }
      // auto → instant "Redemption complete"; admin → "Sent to admin for fulfillment"
      const ft = res?.redemption?.fulfillment_type ?? selectedReward.fulfillment_type ?? 'auto';
      const message = res?.message;
      if (ft === 'admin') {
        toast({ title: '⏳ Sent to admin', description: message || `${selectedReward.name} is pending admin fulfillment.` });
      } else {
        toast({ title: '🎉 Redemption complete!', description: message || `${selectedReward.name} redeemed successfully.` });
      }
      setSelectedReward(null);
    } catch (e) {
      toast({ title: 'Redemption failed', description: e.message, variant: 'destructive' });
    }
    setRedeeming(false);
  };

  if (loading) return <LoadingSpinner label="Loading rewards..." />;

  const hpActive = hpBalance?.active || 0;
  const hpPending = hpBalance?.pending || 0;
  const tierInfo = hpBalance ? getTierProgress(hpBalance.hp_earned_120day) : null;

  const tabs = [
    { id: 'dashboard', label: 'My Rewards', icon: Sparkles },
    { id: 'redeem', label: 'Redeem', icon: Gift },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Compact HP balance — tappable to learn how HP work */}
      <Link to="/hp-education" className="flex items-center gap-3 rounded-2xl bg-cocoa-800 p-4 text-white active:scale-[0.99] transition-transform">
        <div className="w-10 h-10 rounded-xl flame-gradient flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-cream-200">Holy Points</div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-white">{hpActive}</span>
            {hpPending > 0 && <span className="text-xs font-bold text-gold-400">+{hpPending} pending</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-cream-200 shrink-0" />
      </Link>

      {/* Next reward callout — streak progress */}
      {(() => {
        const cycleDays = streak?.cycle_days ?? getSetting('streak_cycle_days', 7);
        const currentStreak = streak?.current_streak ?? streak?.days ?? streak?.count ?? 0;
        const cycleRewardHp = getStreakRewardHp(currentStreak);
        const daysIntoCycle = currentStreak % cycleDays;
        const daysToGo = cycleDays - daysIntoCycle;
        if (daysToGo <= 0 || daysToGo === cycleDays) return null;
        return (
          <div className="rounded-2xl bg-flame-50 border border-flame-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flame-gradient flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-xs text-cocoa-700">
              <span className="font-bold text-flame-700">{daysToGo} day{daysToGo !== 1 ? 's' : ''} to go</span>
              <span className="text-cocoa-500"> for your {cycleRewardHp} HP streak reward.</span>
            </div>
            <Link to="/streak" className="text-xs font-bold text-flame-600 shrink-0">View</Link>
          </div>
        );
      })()}

      {/* Graduation Claim — disabled until 500 level */}
      {graduationStatus && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 p-5 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-6xl opacity-15">🎓</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-purple-200" />
              <span className="text-xs font-bold uppercase tracking-wide text-purple-200">Graduation Reward</span>
            </div>
            {graduationStatus.already_claimed ? (
              <p className="text-sm font-semibold text-white/90">✓ You've already claimed your graduation HP. Check back after admin approval!</p>
            ) : graduationStatus.is_eligible || graduationStatus.level >= graduationMinLevel() ? (
              <>
                <h3 className="font-heading font-bold text-lg text-white mb-1">Claim your graduation HP! 🎓</h3>
                <p className="text-xs text-white/80 mb-3">You're at {graduationStatus.level || graduationMinLevel()} level — eligible for a {graduationHp()} HP graduation bonus.</p>
                <button onClick={handleGraduationClaim} disabled={claimingGrad} className="px-5 py-2.5 rounded-full bg-white text-purple-700 font-bold text-sm shadow-md disabled:opacity-60 flex items-center gap-2">
                  {claimingGrad ? <><div className="w-3.5 h-3.5 border-2 border-purple-400/40 border-t-purple-700 rounded-full animate-spin" /> Claiming...</> : <>Claim {graduationHp()} HP</>}
                </button>
              </>
            ) : (
              <>
                <h3 className="font-heading font-bold text-lg text-white mb-1">Graduation HP coming soon!</h3>
                <p className="text-xs text-white/80">You need to be at {graduationMinLevel()} level to claim your graduation reward. Current level: {graduationStatus.level || '—'}</p>
                <button disabled className="mt-3 px-5 py-2.5 rounded-full bg-white/20 text-white/60 font-bold text-sm cursor-not-allowed flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> Locked — reach {graduationMinLevel()} level
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-full bg-cocoa-100">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all ${
              tab === t.id ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-400'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* My Rewards Dashboard tab */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* Free Side Credits */}
          <div className="rounded-2xl bg-white border border-cocoa-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-flame-600" />
              <h3 className="font-bold text-sm text-cocoa-800">Free Side Credits</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-heading font-extrabold text-2xl text-flame-600">{freeSideCredits?.count ?? 0}</div>
                <div className="text-xs text-cocoa-400">Available · {freeSideCredits?.expires_at ? expiryLabel(freeSideCredits.expires_at) : `${freeSideCreditsValidityDays()}-day expiry`}</div>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-[11px] text-cocoa-400 mt-2">Use one at checkout — pick from {getFreeSideOptions().join(', ')} and it's added to your order at ₦0. The credit is used the moment you place the order.</p>
          </div>

          {/* Exclusive Spins — earned on the leaderboard, spin directly from here */}
          {(() => {
            const spinsAvail = exclusiveStatus?.total_spins ?? exclusiveStatus?.spins_available ?? exclusiveStatus?.spins ?? exclusiveStatus?.spin_count ?? 0;
            const rawPrizes = exclusiveStatus?.prizes || exclusiveStatus?.template || EXCLUSIVE_SPIN_PRIZES;
            const prizeList = Array.isArray(rawPrizes) ? rawPrizes : [];
            return (
              <>
                <div className="rounded-2xl bg-gradient-to-br from-cocoa-700 to-cocoa-900 p-4 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold-300" />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-cocoa-300">Exclusive Spin</span>
                    </div>
                    <div className="font-heading font-extrabold text-2xl">{spinsAvail} <span className="text-xs font-normal text-cocoa-300">spin{spinsAvail !== 1 ? 's' : ''}</span></div>
                  </div>
                  <div className="text-xs text-cocoa-300 mb-3">
                    {spinsAvail > 0
                      ? (exclusiveStatus?.expires_at ? expiryLabel(exclusiveStatus.expires_at) : `${exclusiveSpinValidityDays()}-day expiry`)
                      : 'Win leaderboard prizes to earn spins'}
                  </div>
                  {prizeList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {prizeList.slice(0, 8).map((p, i) => (
                        <span key={p.id || i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-[10px] font-semibold text-cocoa-200">
                          <span>{p.icon || '🎁'}</span>{p.label || p.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => spinsAvail > 0 && setShowSpinModal(true)}
                    disabled={spinsAvail <= 0}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition ${spinsAvail > 0 ? 'flame-gradient text-white active:scale-95' : 'bg-white/10 text-cocoa-400 cursor-not-allowed'}`}
                  >
                    {spinsAvail > 0 ? 'Spin Now 🎡' : 'No spins available'}
                  </button>
                </div>
                <SpinWheel
                  open={showSpinModal}
                  onClose={() => setShowSpinModal(false)}
                  onResult={async () => {
                    try { setExclusiveStatus(await mockApi.hp.getExclusiveSpinStatus()); } catch { /* ignore */ }
                    await refreshHp();
                  }}
                  canSpin={spinsAvail > 0}
                />
              </>
            );
          })()}

          {/* Hall of Fame status */}
          <Link to="/hall-of-fame" className="block rounded-2xl bg-gold-50 border border-gold-200 p-4 active:scale-[0.99] transition-transform">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-gold-500 shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-sm text-cocoa-800">Hall of Fame</div>
                <div className="text-xs text-cocoa-500">3+ Top 4 finishes earns induction + a 🏅 reward on every order.</div>
              </div>
            </div>
          </Link>

          {/* My Redemptions — fulfillment status badges */}
          {redemptions.length > 0 && (
            <div className="rounded-2xl bg-white border border-cocoa-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-flame-600" />
                <h3 className="font-bold text-sm text-cocoa-800">My Redemptions</h3>
              </div>
              <div className="space-y-2">
                {redemptions.map((r) => {
                  const ft = r.fulfillment_type || r.reward?.fulfillment_type || 'auto';
                  const status = r.status || 'completed';
                  const badge = ft === 'auto'
                    ? { text: 'Redemption complete', cls: 'bg-green-50 text-green-700 border-green-200' }
                    : ft === 'admin' && status === 'fulfilled'
                      ? { text: 'Fulfilled by admin', cls: 'bg-green-50 text-green-700 border-green-200' }
                      : { text: 'Sent to admin for fulfillment', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
                  return (
                    <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-cocoa-50">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-cocoa-800 truncate">{r.reward_name || r.reward?.name || 'Reward'}</div>
                        <div className="text-[10px] text-cocoa-400">{r.created_at || r.redeemed_at ? new Date(r.created_at || r.redeemed_at).toLocaleDateString() : ''}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${badge.cls}`}>{badge.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Redeem Tab */}
      {tab === 'redeem' && (
        <div className="space-y-3">
          {(() => {
            // Sort flash-sale rewards to the top so they're seen first.
            const sorted = [...rewards].sort((a, b) => {
              const af = normFlash(a) ? 1 : 0;
              const bf = normFlash(b) ? 1 : 0;
              return bf - af;
            });
            return sorted.map(reward => {
              const flash = normFlash(reward);
              const tierIndex = TIERS.findIndex(t => t.id === reward.min_tier_id);
              const currentTierIndex = tierInfo ? TIERS.findIndex(t => t.id === tierInfo.current.id) : 0;
              const tierLocked = currentTierIndex < tierIndex;
              const lowStock = reward.stock_quantity <= lowCodeInventoryThreshold();
              const locked = !flash && (tierLocked || lowStock);
              const effectiveHpCost = flash?.hpCost ?? reward.hp_cost;
              const canAfford = hpActive >= effectiveHpCost;
              const category = CATEGORY_LABELS[reward.reward_type] || reward.reward_type;
              const countdown = flash ? formatCountdown(flash.endsAt) : null;
              const slotsLeft = flash?.slotsRemaining;

              return (
                <div key={reward.id} className={`rounded-2xl bg-white border p-3 flex gap-3 ${flash ? 'border-flame-300 shadow-selected-soft' : 'border-cocoa-100'}`}>
                  {reward.image_url ? (
                    <img src={reward.image_url} alt={reward.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-cocoa-100 flex items-center justify-center text-2xl shrink-0">🎁</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {flash && (
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-flame-600 text-white text-[9px] font-bold uppercase tracking-wide mb-1">
                            <Zap className="w-2.5 h-2.5" /> Flash
                          </div>
                        )}
                        <h3 className="font-bold text-sm text-cocoa-800">{reward.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {flash?.normalHpCost && flash.normalHpCost > effectiveHpCost && (
                          <span className="text-xs font-medium text-cocoa-400 line-through">{flash.normalHpCost}</span>
                        )}
                        <span className="flex items-center gap-1 text-sm font-bold text-flame-600">
                          <Flame className="w-3.5 h-3.5" />
                          {effectiveHpCost}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-cocoa-400 mt-0.5 capitalize">{reward.reward_type} reward</p>

                    {flash && (
                      <div className="flex items-center gap-2 mt-1.5">
                        {countdown && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-flame-700 bg-flame-50 px-1.5 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5" /> {countdown}
                          </span>
                        )}
                        {slotsLeft != null && (
                          <span className="text-[10px] font-bold text-cocoa-500 bg-cocoa-100 px-1.5 py-0.5 rounded-full">
                            {slotsLeft} left
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-semibold text-cocoa-500 bg-cocoa-100 px-2 py-0.5 rounded-full">{category}</span>
                      {locked ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-cocoa-400">
                          <Lock className="w-3.5 h-3.5" />
                          {tierLocked ? `${TIERS[tierIndex].name} tier` : 'Low stock'}
                        </div>
                      ) : flash ? (
                        <button
                          onClick={() => handleFlashRedeem(reward)}
                          disabled={!canAfford || flashRedeeming === reward.id}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                            canAfford ? 'flame-gradient text-white active:scale-95' : 'bg-cocoa-100 text-cocoa-400 cursor-not-allowed'
                          }`}
                        >
                          {flashRedeeming === reward.id ? (
                            <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Redeeming...</>
                          ) : canAfford ? (
                            <><Zap className="w-3 h-3" /> Flash Redeem</>
                          ) : (
                            `Need ${effectiveHpCost - hpActive} HP`
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedReward(reward)}
                          disabled={!canAfford}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                            canAfford ? 'bg-flame-600 text-white hover:bg-flame-700 active:scale-95' : 'bg-cocoa-100 text-cocoa-400 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Redeem' : `Need ${effectiveHpCost - hpActive} HP`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Challenges Tab */}
      {tab === 'challenges' && (
        <div className="space-y-3">
          {challenges.length === 0 ? (
            <div className="text-center py-10 text-sm text-cocoa-400">No active challenges right now. Check back soon! 🔥</div>
          ) : challenges.map(ch => {
            const progress = ch.progress || ch.current_progress || 0;
            const target = ch.target || ch.target_count || 1;
            const done = progress >= target || ch.is_completed;
            const pct = Math.min(100, (progress / target) * 100);
            const triggerType = ch.trigger_type || '';
            const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            const daysCompleted = ch.progress_data?.days_completed || [];
            return (
              <div key={ch.id} className="rounded-2xl bg-white border border-cocoa-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-flame-600" />
                    <h3 className="font-bold text-sm text-cocoa-800">{ch.name || ch.title}</h3>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-flame-600">
                    <Flame className="w-3 h-3" />+{ch.hp_award || ch.reward_hp || 0}
                  </span>
                </div>
                <p className="text-xs text-cocoa-500 mb-2">{ch.description || ch.requirement}</p>

                {/* Trigger-specific progress display */}
                {triggerType === 'order_distinct_days_weekly' ? (
                  <div className="flex gap-1.5 mb-2">
                    {DAYS.map((day, i) => (
                      <div key={day} className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-bold ${daysCompleted[i] || daysCompleted.includes(day) ? 'bg-green-100 text-green-700' : 'bg-cocoa-100 text-cocoa-400'}`}>
                        {day} {daysCompleted[i] || daysCompleted.includes(day) ? '✅' : '⬜'}
                      </div>
                    ))}
                  </div>
                ) : triggerType === 'min_order_total' ? (
                  <div className="text-xs text-cocoa-600 mb-2">
                    Squad total: <span className="font-bold">₦{Number(progress).toLocaleString()}</span> / ₦{Number(target).toLocaleString()}
                  </div>
                ) : null}

                {/* Standard progress bar */}
                {triggerType !== 'order_distinct_days_weekly' && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-cocoa-100">
                      <div className="h-full rounded-full bg-flame-600" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-cocoa-600">{progress}/{target}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  {ch.expires_at && <p className="text-[10px] text-cocoa-400">Expires: {new Date(ch.expires_at).toLocaleDateString()}</p>}
                  {done ? (
                    <span className="ml-auto text-[10px] font-bold text-green-600">✓ Completed</span>
                  ) : (
                    <button
                      onClick={() => handleCompleteChallenge(ch)}
                      disabled={completing === ch.id}
                      className="ml-auto px-3 py-1 rounded-full bg-flame-600 text-white text-[10px] font-bold disabled:opacity-50"
                    >
                      {completing === ch.id ? '...' : 'Claim'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Tab — unobtrusive spin + unlock logs */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-cocoa-800 mb-2 flex items-center gap-1.5"><History className="w-4 h-4 text-flame-600" /> Spin History</h3>
            {spinHistory.length === 0 ? (
              <p className="text-xs text-cocoa-400">No spins yet. Earn a free spin on the leaderboard!</p>
            ) : (
              <div className="space-y-2">
                {spinHistory.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-cocoa-100">
                    <div>
                      <div className="text-sm font-semibold text-cocoa-700">+{s.hp_won || 0} HP</div>
                      <div className="text-[10px] text-cocoa-400">{s.free_spin ? 'Free spin' : `Cost ${s.spin_cost_hp || 0} HP`} · {new Date(s.created_at || s.spun_at).toLocaleString()}</div>
                    </div>
                    <span className="text-lg">🎡</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-cocoa-800 mb-2 flex items-center gap-1.5"><Award className="w-4 h-4 text-gold-500" /> Unlock History</h3>
            {unlockHistory.length === 0 ? (
              <p className="text-xs text-cocoa-400">No unlocks yet. Earn HP and redeem rewards to see them here.</p>
            ) : (
              <div className="space-y-2">
                {unlockHistory.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-cocoa-100">
                    <div>
                      <div className="text-sm font-semibold text-cocoa-700">{u.reward_name || u.name || 'Reward unlocked'}</div>
                      <div className="text-[10px] text-cocoa-400">{new Date(u.created_at || u.unlocked_at).toLocaleString()}</div>
                    </div>
                    <span className="text-lg">🎁</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Redeem Confirmation Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedReward(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-heading font-bold text-lg text-cocoa-800">Confirm Redemption</h3>
              <button onClick={() => setSelectedReward(null)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <div className="text-center py-2">
              {selectedReward.image_url ? (
                <img src={selectedReward.image_url} alt="" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-cocoa-100 flex items-center justify-center text-4xl mx-auto mb-3">🎁</div>
              )}
              <h4 className="font-bold text-cocoa-800 text-lg">{selectedReward.name}</h4>
              <p className="text-xs text-cocoa-400 capitalize mt-0.5">{selectedReward.reward_type} · {selectedReward.stock_quantity} in stock</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Flame className="w-4 h-4 text-flame-600" />
                <span className="font-bold text-flame-600">{selectedReward.hp_cost} HP</span>
              </div>
              <p className={`text-xs mt-3 ${selectedReward.fulfillment_type === 'admin' ? 'text-amber-600' : 'text-green-600'}`}>
                {selectedReward.fulfillment_type === 'admin'
                  ? '⚠ This reward requires admin fulfillment. After redemption, it will be sent to our team for processing.'
                  : '✓ This reward is fulfilled instantly after redemption.'}
              </p>
            </div>
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className="w-full py-3 rounded-full bg-flame-600 text-white font-bold disabled:opacity-50"
            >
              {redeeming ? 'Redeeming...' : `Redeem for ${selectedReward.hp_cost} HP`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}