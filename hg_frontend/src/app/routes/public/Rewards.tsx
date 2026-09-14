import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Trophy, Sparkles, Send, Loader2 } from 'lucide-react';
import { Link } from '@/lib/router';
import { HPProgressBar } from '@/components/hp/HPProgressBar';
import { SectionHeader } from '@/components/shared/SectionHeader';
import {
  getRewardsSnapshot,
  redeemRewardApi,
  spinExclusiveWheelApi,
  transferHpApi,
} from '@/services/api/reward.service';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const RewardsPage = () => {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const { data, isError, refetch } = useQuery({
    queryKey: ['rewards-snapshot'],
    queryFn: getRewardsSnapshot,
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const currentHP = isAuthenticated ? (user?.hp_balance ?? data?.balance ?? 0) : (data?.balance ?? 0);
  const redemptions = data?.redemptions ?? [];
  const challenges = data?.challenges ?? [];

  const handleSpin = async () => {
    setIsSpinning(true);
    try {
      const result = await spinExclusiveWheelApi();
      toast.success(`Congratulations! You won ${result.prize_name}!`);
      refetch();
    } catch {
      toast.error('Spin failed. Please try again.');
    } finally {
      setIsSpinning(false);
    }
  };

  const handleRedeem = async (reward: (typeof redemptions)[0]) => {
    if (currentHP < reward.hpCost) {
      toast.error('Not enough HP to redeem this reward.');
      return;
    }

    setRedeemingId(reward.id);
    try {
      await redeemRewardApi(reward.id);
      toast.success('Reward redeemed successfully!');
      if (user) {
        setUser({ ...user, hp_balance: Math.max(0, user.hp_balance - reward.hpCost) });
      }
      refetch();
    } catch {
      toast.error('Not enough HP to redeem this reward.');
    } finally {
      setRedeemingId(null);
    }
  };

  const handleTransfer = async () => {
    const amount = Number(transferAmount);
    if (!transferTarget.trim()) {
      toast.error('User not found with provided phone/email.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > currentHP) {
      toast.error('Insufficient HP balance for transfer.');
      return;
    }

    setIsTransferring(true);
    try {
      await transferHpApi(transferTarget.trim(), amount);
      toast.success(`Successfully transferred ${amount} HP to ${transferTarget}!`);
      if (user) {
        setUser({ ...user, hp_balance: user.hp_balance - amount });
      }
      setShowTransferModal(false);
      setTransferTarget('');
      setTransferAmount('');
      refetch();
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (errMsg?.includes('not found')) {
        toast.error('User not found with provided phone/email.');
      } else {
        toast.error('Insufficient HP balance for transfer.');
      }
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-5xl space-y-8 px-4">
        <section className="rounded-[2rem] bg-gradient-dark p-6 text-brand-brown-foreground md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-80">Rewards</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <span className="font-display text-5xl font-black text-gradient-fire">{currentHP}</span>
            <span className="pb-2 text-lg font-bold opacity-80">HP balance</span>
          </div>
          <p className="mt-3 text-sm opacity-80">
            Redemption cards live here, while challenge and tier context stays lightweight.
          </p>
          <div className="mt-5 max-w-xl">
            <HPProgressBar currentHP={currentHP} label="52 HP to Grill Master" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isSpinning ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Exclusive Spin Wheel
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20"
            >
              <Send size={15} />
              Transfer HP
            </button>
          </div>
        </section>

        {isError ? <p className="text-sm text-destructive">Unable to refresh rewards right now.</p> : null}
        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Redeem"
              title="Spend HP on perks"
              description="Square cards keep comparison quick."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {redemptions.map((reward) => {
                const canRedeem = currentHP >= reward.hpCost && !reward.locked;

                return (
                  <div key={reward.id} className="rounded-[2rem] border border-border bg-card p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Gift size={20} />
                    </div>
                    <p className="mt-4 font-display text-lg font-bold text-foreground">{reward.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{reward.description}</p>
                    <button
                      onClick={() => handleRedeem(reward)}
                      className={`mt-4 rounded-full px-4 py-2 text-xs font-bold transition-opacity ${canRedeem ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-secondary text-muted-foreground'}`}
                      disabled={!canRedeem || redeemingId === reward.id}
                    >
                      {redeemingId === reward.id ? 'Redeeming...' : reward.locked ? 'Locked' : `Redeem for ${reward.hpCost} HP`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-border bg-card p-6">
            <SectionHeader
              eyebrow="Challenges"
              title="Active now"
              description="Complete actions to earn more HP faster."
            />
            {challenges.map((challenge) => (
              <div key={challenge.id} className="rounded-2xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{challenge.title}</p>
                  <span className="text-xs font-semibold text-primary">+{challenge.rewardHP} HP</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{challenge.description}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <Link to="/hp" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Learn how HP works <Trophy size={14} />
            </Link>
          </div>
        </section>
      </div>

      {showTransferModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowTransferModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-card p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold text-foreground">Transfer HP to Friend</h3>
            <p className="text-xs text-muted-foreground">Send your earned HP directly to another Holy Grills user.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Recipient Email / Phone</label>
                <input
                  type="text"
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  placeholder="user@example.com or 08012345678"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Amount (HP)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
              <button
                onClick={handleTransfer}
                disabled={isTransferring}
                className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isTransferring ? <Loader2 size={16} className="animate-spin" /> : 'Send HP'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default RewardsPage;
