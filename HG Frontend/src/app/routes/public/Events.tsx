'use client';

import { useState } from 'react';
import { Calendar, Flame, MapPin, Plus } from 'lucide-react';
import { Link } from '@/lib/router';
import { EVENT_DISCOVERY_ITEMS } from '@/services/mocks/platform';

const EventsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-5xl space-y-6 px-4">
        <section className="rounded-[2rem] border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Events</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Campus events and check-ins.</h1>
            </div>
            <button onClick={() => { setShowForm(true); setSubmitted(false); }} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Plus size={14} /> List Event
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {EVENT_DISCOVERY_ITEMS.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="overflow-hidden rounded-[2rem] border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="relative aspect-[16/10] bg-secondary">
                {event.imageUrl ? <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" /> : null}
                {event.featured ? <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">Featured</span> : null}
              </div>
              <div className="space-y-2 p-4">
                <h2 className="font-display text-xl font-bold text-foreground">{event.title}</h2>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar size={13} /> {event.date}</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={13} /> {event.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">{event.capacity}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"><Flame size={12} /> +{event.hpReward ?? 20} HP</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-3xl bg-card p-6" onClick={(event) => event.stopPropagation()}>
            {submitted ? (
              <div className="text-center">
                <p className="text-4xl">🎉</p>
                <h3 className="mt-2 font-display text-xl font-bold text-foreground">Request received</h3>
                <p className="mt-1 text-sm text-muted-foreground">We&apos;ll review your event request shortly.</p>
                <button onClick={() => setShowForm(false)} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Done</button>
              </div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="space-y-3">
                <h3 className="font-display text-xl font-bold text-foreground">List your event</h3>
                <input required placeholder="Event name" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/35" />
                <input required type="email" placeholder="Email" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/35" />
                <input required placeholder="Phone" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/35" />
                <button className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Submit request</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default EventsPage;
