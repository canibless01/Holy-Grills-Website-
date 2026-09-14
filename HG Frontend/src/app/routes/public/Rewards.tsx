import { useQuery } from '@tanstack/react-query';
import { Gift, Trophy } from 'lucide-react';
import { Link } from '@/lib/router';
import { HPProgressBar } from '@/components/hp/HPProgressBar';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { getRewardsSnapshot } from '@/services/api/reward.service';
import { useAuthStore } from '@/stores/authStore';

const RewardsPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { data, isError } = useQuery({
    queryKey: ['rewards-snapshot'],
    queryFn: getRewardsSnapshot,
  });
  const currentHP = isAuthenticated ? (user?.hp_balance ?? data?.balance ?? 0) : (data?.balance ?? 0);
  const redemptions = data?.redemptions ?? [];
  const challenges = data?.challenges ?? [];

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
                      className={`mt-4 rounded-full px-4 py-2 text-xs font-bold ${canRedeem ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                      disabled={!canRedeem}
                    >
                      {reward.locked ? 'Locked' : `${reward.hpCost} HP`}
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
    </main>
  );
};

export default RewardsPage;
