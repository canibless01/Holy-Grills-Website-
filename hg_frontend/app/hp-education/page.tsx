'use client';

import { Flame, Gift, ShieldCheck, Trophy } from 'lucide-react';
import { Link } from '@/lib/router';
import { SiteLayout } from '@/app/layouts/SiteLayout';
import { REWARD_TIERS } from '@/services/mocks/platform';

export default function Page() {
  return (
    <SiteLayout title="HP Education">
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-5xl space-y-8 px-4">
          <section className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">HP education</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Holy Points power every reward loop.</h1>
          </section>
          <section className="grid gap-4 md:grid-cols-3">
            {[{ icon: Flame, title: 'What is HP?', text: 'Loyalty score earned from orders and activities.' }, { icon: Gift, title: 'How to earn', text: 'Place orders, keep streaks, and invite friends.' }, { icon: ShieldCheck, title: 'Rewards', text: 'Use HP for perks and special drops.' }].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-border bg-card p-5"><item.icon className="text-primary" /><h2 className="mt-4 font-display text-xl font-bold text-foreground">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">{item.text}</p></div>
            ))}
          </section>
          <section className="rounded-[2rem] border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-primary"><Trophy size={18} /> <p className="text-xs font-semibold uppercase tracking-[0.24em]">Tiers</p></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {REWARD_TIERS.map((tier) => <div key={tier.name} className="rounded-[2rem] bg-secondary/50 p-4"><p className="font-display text-lg font-bold text-foreground">{tier.name}</p><p className="mt-2 text-sm text-muted-foreground">Starts at {tier.minHP} HP · {tier.perk}</p></div>)}
            </div>
            <Link to="/rewards" className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Go to rewards</Link>
          </section>
        </div>
      </main>
    </SiteLayout>
  );
}
