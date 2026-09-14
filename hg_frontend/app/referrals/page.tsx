'use client';

import { useQuery } from '@tanstack/react-query';
import { Copy, Share2, Users, Gift, Award, CheckCircle2, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { SiteLayout } from '@/app/layouts/SiteLayout';
import { referralService } from '@/services/api/referral.service';
import { challengesService } from '@/services/api/challenges.service';
import { toast } from 'sonner';

// Confirmed live milestone tiers for referral_count
const REFERRAL_TIERS = [
  { referrals: 5, rewardHP: 150, title: '5 Friends Milestone' },
  { referrals: 10, rewardHP: 400, title: '10 Friends Milestone' },
  { referrals: 20, rewardHP: 750, title: '20 Friends Milestone' },
  { referrals: 30, rewardHP: 1200, title: '30 Friends Milestone' },
  { referrals: 50, rewardHP: 2500, title: '50 Friends Milestone' },
  { referrals: 75, rewardHP: 1500, title: '75 Friends Milestone' },
];

export default function ReferralsPage() {
  const { data: referralData, isLoading: isReferralsLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => referralService.getReferrals(),
    retry: 1,
  });

  const { data: allChallenges = [] } = useQuery({
    queryKey: ['challenges', 'all'],
    queryFn: () => challengesService.getChallenges(),
    retry: 1,
  });

  const referralMilestones = allChallenges.filter((m) => m.trigger_type === 'referral_count');
  const milestoneList = referralMilestones.length > 0
    ? referralMilestones.map((m) => ({
        referrals: m.trigger_value,
        rewardHP: m.hp_awarded,
        title: m.title || `${m.trigger_value} Referrals Tier`,
      }))
    : REFERRAL_TIERS;

  const stats = referralData?.stats;
  const referralsList = referralData?.referrals ?? [];

  const referralCode = stats?.referral_code || 'JOIN-HG';
  const referralLink = stats?.referral_link || (typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${referralCode}` : `https://holygrills.app/signup?ref=${referralCode}`);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join HolyGrills',
          text: `Use my referral code ${referralCode} to get bonus Holy Points on your first order!`,
          url: referralLink,
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Hey! Check out HolyGrills. Use my code *${referralCode}* or link ${referralLink} for bonus HP!`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <SiteLayout title="Referrals">
      <main className="flex-1 pb-16 pt-4 md:pt-24">
        <div className="container mx-auto max-w-4xl space-y-6 px-4">
          {/* Header Banner */}
          <section className="rounded-[2rem] bg-gradient-fire p-6 text-primary-foreground shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Referral Rewards</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Invite Friends & Earn 75 HP</h1>
            <p className="mt-2 text-sm opacity-90">
              Get 75 Holy Points for every friend who signs up using your code and completes their first delivered order.
            </p>
          </section>

          {/* Code & Link Share Section */}
          <section className="grid gap-4 md:grid-cols-2">
            {/* Referral Code Box */}
            <div className="rounded-[2rem] border border-border bg-card p-5 space-y-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">Your Referral Code</p>
              <div className="flex items-center justify-between rounded-xl bg-secondary/70 p-3 font-mono text-lg font-bold text-foreground">
                <span>{referralCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <Copy size={14} /> Copy Code
                </button>
              </div>
            </div>

            {/* Referral Link Box */}
            <div className="rounded-[2rem] border border-border bg-card p-5 space-y-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">Your Referral Link</p>
              <div className="flex items-center justify-between gap-2 rounded-xl bg-secondary/70 p-3 text-xs font-medium text-foreground truncate">
                <span className="truncate">{referralLink}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Share2 size={13} /> Share
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm"
            >
              <MessageSquare size={16} /> Invite via WhatsApp
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-all shadow-sm"
            >
              <Share2 size={16} /> Share Link
            </button>
          </div>

          {/* Stats Grid */}
          <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Total Invited</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">
                {isReferralsLoading ? '...' : stats?.total_referrals ?? 0}
              </p>
            </div>
            <div className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Completed Orders</p>
              <p className="mt-2 font-display text-2xl font-bold text-emerald-600">
                {isReferralsLoading ? '...' : stats?.completed_referrals ?? 0}
              </p>
            </div>
            <div className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Pending First Order</p>
              <p className="mt-2 font-display text-2xl font-bold text-amber-500">
                {isReferralsLoading ? '...' : stats?.pending_referrals ?? 0}
              </p>
            </div>
            <div className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">HP Earned</p>
              <p className="mt-2 font-display text-2xl font-bold text-primary">
                +{isReferralsLoading ? '...' : stats?.total_hp_earned ?? 0} HP
              </p>
            </div>
          </section>

          {/* Referral Milestone Roadmap */}
          <section className="rounded-[2rem] border border-border bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Milestone Tiers
              </h2>
              <span className="text-xs text-muted-foreground">Unlock bonus HP at target referrals</span>
            </div>
            <div className="space-y-3">
              {milestoneList.map((tier) => {
                const currentCount = stats?.completed_referrals ?? 0;
                const isUnlocked = currentCount >= tier.referrals;
                return (
                  <div
                    key={tier.referrals}
                    className={`flex items-center justify-between rounded-2xl p-4 text-sm transition-all ${
                      isUnlocked
                        ? 'border border-emerald-500/30 bg-emerald-500/10'
                        : 'border border-border/60 bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
                        {isUnlocked ? <CheckCircle2 size={16} /> : <Gift size={16} />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{tier.title}</p>
                        <p className="text-xs text-muted-foreground">{tier.referrals} completed referral(s)</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${isUnlocked ? 'text-emerald-600' : 'text-primary'}`}>
                      +{tier.rewardHP} HP
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Referred Friends List */}
          <section className="rounded-[2rem] border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Invited Friends
            </h2>

            {isReferralsLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading referral history...
              </div>
            ) : referralsList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                You haven't referred any friends yet. Share your code above to start earning!
              </p>
            ) : (
              <div className="space-y-3">
                {referralsList.map((ref) => {
                  const isCompleted = ref.status === 'completed';
                  return (
                    <div key={ref.id} className="flex items-center justify-between rounded-2xl border border-border p-4 text-sm">
                      <div>
                        <p className="font-semibold text-foreground">{ref.name || ref.email || 'Friend'}</p>
                        <p className="text-xs text-muted-foreground">Joined: {new Date(ref.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 size={13} /> Completed (+{ref.hp_awarded || 75} HP)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
                            <Clock size={13} /> Pending First Order
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </SiteLayout>
  );
}
