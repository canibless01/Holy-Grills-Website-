'use client';

import { useMemo, useState } from 'react';
import { Calendar, Camera, Check, ChevronLeft, Flame, MapPin, Ticket } from 'lucide-react';
import { Link, useParams } from '@/lib/router';
import { EVENT_DISCOVERY_ITEMS } from '@/services/mocks/platform';

const EVENT_TICKETS_KEY = 'holygrill-event-tickets';
const EVENT_CHECKINS_KEY = 'holygrill-event-checkins';

function readMap(key: string) {
  if (typeof window === 'undefined') return {} as Record<string, boolean>;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? '{}');
  } catch {
    return {};
  }
}

function writeMap(key: string, next: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(next));
}

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const event = useMemo(() => EVENT_DISCOVERY_ITEMS.find((entry) => entry.id === id), [id]);
  const [registered, setRegistered] = useState<boolean>(() => Boolean(readMap(EVENT_TICKETS_KEY)[id]));
  const [checkedIn, setCheckedIn] = useState<boolean>(() => Boolean(readMap(EVENT_CHECKINS_KEY)[id]));

  if (!event) {
    return (
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-3xl px-4 text-sm text-muted-foreground">Event not found.</div>
      </main>
    );
  }

  const register = () => {
    const next = { ...readMap(EVENT_TICKETS_KEY), [id]: true };
    writeMap(EVENT_TICKETS_KEY, next);
    setRegistered(true);
  };

  const checkIn = () => {
    const next = { ...readMap(EVENT_CHECKINS_KEY), [id]: true };
    writeMap(EVENT_CHECKINS_KEY, next);
    setCheckedIn(true);
  };

  const isFree = (event.ticketPrice ?? 0) === 0;

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-6 px-4">
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft size={14} /> Back to events</Link>

        <section className="overflow-hidden rounded-[2rem] border border-border bg-card">
          <div className="aspect-[16/10] bg-secondary">{event.imageUrl ? <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" /> : null}</div>
          <div className="space-y-3 p-6">
            <h1 className="font-display text-3xl font-bold text-foreground">{event.title}</h1>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <p className="inline-flex items-center gap-2 rounded-xl bg-secondary/50 p-3 text-sm text-foreground"><Calendar size={15} className="text-primary" /> {event.date}</p>
              <p className="inline-flex items-center gap-2 rounded-xl bg-secondary/50 p-3 text-sm text-foreground"><MapPin size={15} className="text-primary" /> {event.location}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Flame size={12} /> +{event.hpReward ?? 20} HP on check-in</div>
          </div>
        </section>

        {checkedIn ? (
          <section className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
            <Check className="mx-auto text-green-600" />
            <h2 className="mt-2 font-semibold text-green-800">Check-in successful</h2>
            <p className="text-sm text-green-700">You earned +{event.hpReward ?? 20} pending HP.</p>
          </section>
        ) : registered || isFree ? (
          <button onClick={checkIn} className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground inline-flex items-center justify-center gap-2">
            <Camera size={15} /> Scan QR code to check in
          </button>
        ) : (
          <section className="rounded-[2rem] border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Ticket required</p>
                <p className="text-xs text-muted-foreground">Reserve your seat and unlock event check-in.</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(event.ticketPrice ?? 0)}</span>
            </div>
            <button onClick={register} className="mt-4 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground inline-flex items-center justify-center gap-2"><Ticket size={14} /> Register ticket</button>
          </section>
        )}
      </div>
    </main>
  );
};

export default EventDetailPage;
