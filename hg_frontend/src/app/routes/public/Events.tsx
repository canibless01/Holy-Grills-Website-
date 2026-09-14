'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Flame, MapPin, UtensilsCrossed, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/lib/router';
import {
  getEvents,
  submitCateringRequest,
  type CampusEventItem,
} from '@/services/api/events.service';

export default function EventsPage() {
  const [showCateringModal, setShowCateringModal] = useState(false);

  // Catering form state
  const [organizerName, setOrganizerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [expectedGuests, setExpectedGuests] = useState('');
  const [budget, setBudget] = useState('');
  const [organization, setOrganization] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch campus events
  const { data: events = [], isLoading } = useQuery<CampusEventItem[]>({
    queryKey: ['campus-events'],
    queryFn: getEvents,
  });

  // Submit catering request
  const cateringMutation = useMutation({
    mutationFn: submitCateringRequest,
    onSuccess: (res) => {
      toast.success(res.message || 'Catering request submitted! Our team will contact you shortly.');
      setShowCateringModal(false);
      setOrganizerName('');
      setEmail('');
      setPhone('');
      setEventName('');
      setEventDate('');
      setExpectedGuests('');
      setBudget('');
      setOrganization('');
      setNotes('');
    },
    onError: () => {
      toast.error('Failed to submit catering request.');
    },
  });

  const handleCateringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizerName || !email || !phone || !eventName || !eventDate || !expectedGuests) {
      toast.error('Please fill in all required fields.');
      return;
    }

    cateringMutation.mutate({
      organizer_name: organizerName,
      email,
      phone,
      event_name: eventName,
      event_date: eventDate,
      expected_guests: Number(expectedGuests) || 1,
      budget: budget ? Number(budget) : undefined,
      organization,
      notes,
    });
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-5xl space-y-6 px-4">
        {/* Banner Section */}
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Campus Events & Ticketing
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
                Discover events & request Holy Grills catering.
              </h1>
            </div>

            <button
              onClick={() => setShowCateringModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              <UtensilsCrossed size={15} />
              <span>Request Catering for Event</span>
            </button>
          </div>
        </section>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-[2rem] border border-border bg-card/50" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border p-12 text-center text-xs text-muted-foreground bg-card">
            No upcoming campus events currently listed. Check back soon!
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="overflow-hidden rounded-[2rem] border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] bg-secondary">
                  {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                  )}
                  {event.featured && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      <Sparkles size={11} /> Featured
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 p-5">
                  <h2 className="font-display text-xl font-bold text-foreground">{event.title}</h2>
                  <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Calendar size={13} className="text-primary" /> {event.date}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin size={13} className="text-primary" /> {event.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {event.ticketPrice ? `₦${event.ticketPrice.toLocaleString()}` : 'Free Entry'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      <Flame size={12} /> +{event.hpReward || 20} HP
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>

      {/* Catering Request Modal */}
      {showCateringModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCateringModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">Request Catering</h3>
              </div>
              <button onClick={() => setShowCateringModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Book Holy Grills catering for your student organization, party, or event.
            </p>

            <form onSubmit={handleCateringSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Organizer / Your Name *</label>
                <input
                  required
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="Blessing Okon"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Email *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@campus.edu"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Phone *</label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08000000000"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Event Name *</label>
                <input
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Faculty Gala Night 2025"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Event Date *</label>
                  <input
                    required
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Expected Guests *</label>
                  <input
                    required
                    type="number"
                    value={expectedGuests}
                    onChange={(e) => setExpectedGuests(e.target.value)}
                    placeholder="150"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Estimated Budget (₦)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="100000"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Organization / Host</label>
                  <input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Engineering Student Assoc"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Special Requests / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Food preferences, dietary requirements, setup time..."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35 min-h-[60px]"
                />
              </div>

              <button
                type="submit"
                disabled={cateringMutation.isPending}
                className="w-full rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                {cateringMutation.isPending ? 'Submitting Request...' : 'Submit Catering Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
