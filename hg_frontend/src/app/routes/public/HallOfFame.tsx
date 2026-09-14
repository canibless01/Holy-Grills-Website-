'use client';

import { useState } from 'react';
import { Crown, Share2, GraduationCap } from 'lucide-react';
import { LEADERBOARD_ENTRIES } from '@/services/mocks/platform';
import { claimGraduationHpApi } from '@/services/api/reward.service';
import { toast } from 'sonner';

const HallOfFamePage = () => {
  const inductees = LEADERBOARD_ENTRIES.slice(0, 3);
  const [isClaimingGraduation, setIsClaimingGraduation] = useState(false);

  const handleGraduationClaim = async () => {
    setIsClaimingGraduation(true);
    try {
      await claimGraduationHpApi();
      toast.success('Graduation HP claimed successfully!');
    } catch {
      toast.error('Failed to award graduation HP — please try again');
    } finally {
      setIsClaimingGraduation(false);
    }
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="rounded-[2rem] border border-border bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Hall of Fame</h1>
            <p className="mt-1 text-sm text-muted-foreground">Top performers with repeated leaderboard finishes.</p>
          </div>
          <button
            onClick={handleGraduationClaim}
            disabled={isClaimingGraduation}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-fire px-5 py-2.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <GraduationCap size={16} />
            {isClaimingGraduation ? 'Claiming...' : 'Claim Graduation HP Bonus'}
          </button>
        </section>
        <section className="space-y-3">
          {inductees.map((entry, index) => (
            <div key={entry.id} className="rounded-[2rem] bg-gradient-dark p-5 text-brand-brown-foreground">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] opacity-80"><Crown size={12} /> #{index + 1} inductee</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">{entry.name}</h2>
                  <p className="text-sm opacity-80">{entry.hp} HP · {entry.streak}-day streak</p>
                </div>
                <button className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold"><Share2 size={12} /> Share</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default HallOfFamePage;
