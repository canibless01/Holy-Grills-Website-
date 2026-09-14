'use client';

import { AdminPage } from '@/app/layouts/AdminPage';

export default function Page() {
  return (
    <AdminPage title="HP Manager" subtitle="Tune the loyalty economy">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'HP ledger entries', value: '2,412' },
            { label: 'Expiring this week', value: '184 HP' },
            { label: 'Tier thresholds', value: '4 tiers' },
            { label: 'Bulk grants pending', value: '3 runs' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold text-foreground">HP ledger</h2>
          <p className="mt-1 text-sm text-muted-foreground">Full transaction history by user, source, and timestamp.</p>
          <div className="mt-4 space-y-2 text-sm">
            {[
              'Adewale Johnson • +28 HP • Order reward • Today 12:30 PM',
              'Funmilayo Adebayo • -45 HP • Redeemed zobo • Today 10:12 AM',
              'Nneka Uche • +35 HP • Referral bonus • Yesterday 5:10 PM',
            ].map((row) => (
              <div key={row} className="rounded-2xl bg-secondary/60 px-4 py-3 text-muted-foreground">{row}</div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground">HP expiry controls</h3>
            <label className="block text-sm text-muted-foreground">Default expiry window (days)</label>
            <input type="number" defaultValue={90} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
            <label className="block text-sm text-muted-foreground">Grace period (days)</label>
            <input type="number" defaultValue={7} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save expiry rules</button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground">Tier threshold editor</h3>
            {[
              { tier: 'Rookie', min: 0, max: 99 },
              { tier: 'Hungry', min: 100, max: 249 },
              { tier: 'Holy Eater', min: 250, max: 499 },
              { tier: 'Grill Master', min: 500, max: 9999 },
            ].map((tier) => (
              <div key={tier.tier} className="grid grid-cols-[1fr,90px,90px] gap-2">
                <div className="rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-foreground">{tier.tier}</div>
                <input type="number" defaultValue={tier.min} className="rounded-lg border border-border bg-secondary px-2 py-2 text-sm" />
                <input type="number" defaultValue={tier.max} className="rounded-lg border border-border bg-secondary px-2 py-2 text-sm" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground">Bulk HP grant tool</h3>
          <p className="text-sm text-muted-foreground">Grant HP to challenge cohorts in one operation.</p>
          <div className="grid gap-3 md:grid-cols-3">
            <input placeholder="Challenge name" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
            <input type="number" placeholder="HP amount" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
            <input placeholder="Target segment" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
          </div>
          <button className="rounded-lg bg-gradient-fire px-4 py-2 text-sm font-semibold text-primary-foreground">Run bulk grant</button>
        </section>
      </div>
    </AdminPage>
  );
}
