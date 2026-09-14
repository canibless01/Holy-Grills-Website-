'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import { REFERRAL_MILESTONES } from '@/services/mocks/platform';

export default function Page() {
  return (
    <SiteLayout title="Referrals">
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-4xl space-y-6 px-4">
          <section className="rounded-[2rem] border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Referrals</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Share your link and unlock squad rewards.</h1>
            <div className="mt-4 rounded-[2rem] bg-secondary/60 p-4 text-sm text-foreground">holygrills.app/r/ade-248</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Copy link</button>
              <button className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">Share</button>
            </div>
          </section>
          <section className="grid gap-4 md:grid-cols-3">
            {['3 referrals', '₦1,500 saved', '35 HP bonus'].map((stat) => <div key={stat} className="rounded-[2rem] border border-border bg-card p-5 font-semibold text-foreground">{stat}</div>)}
          </section>
          <section className="rounded-[2rem] border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold text-foreground">Milestones</h2>
            <div className="mt-4 space-y-3">
              {REFERRAL_MILESTONES.map((milestone) => (
                <div key={milestone.label} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{milestone.label}</p>
                    <p className="text-xs text-muted-foreground">{milestone.referrals} successful referral(s)</p>
                  </div>
                  <span className="text-primary">{milestone.reward}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </SiteLayout>
  );
}
