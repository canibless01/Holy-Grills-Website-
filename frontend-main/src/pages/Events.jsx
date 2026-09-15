import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Flame, Plus, ChevronRight } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { formatDateTime, formatNaira } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatering, setShowCatering] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await mockApi.events.list();
        setEvents(result);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading events..." />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Events 🎟️</h1>
          <p className="text-sm text-cocoa-400">Check in to earn HP!</p>
        </div>
        <button
          onClick={() => setShowCatering(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-full bg-cocoa-800 text-white text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> List Event
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map(event => (
          <button
            key={event.id}
            onClick={() => navigate(`/events/${event.id}`)}
            className="w-full text-left rounded-2xl bg-white border border-cocoa-100 overflow-hidden hover:shadow-md transition-all"
          >
            <div className="relative aspect-[16/9] bg-cocoa-100">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/70 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3">
                <h3 className="font-heading font-bold text-white text-lg leading-tight">{event.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/80">
                  <Calendar className="w-3 h-3" />
                  {formatDateTime(event.starts_at)}
                </div>
              </div>
              {event.is_featured && (
                <span className="absolute top-2 right-2 px-2 py-1 rounded-full flame-gradient text-white text-[10px] font-bold">
                  ⭐ Featured
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-cocoa-500 line-clamp-2">{event.description}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-cocoa-500">
                    <MapPin className="w-3 h-3" />{event.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${event.ticket_price_wallet === 0 && event.ticket_price_hp === 0 ? 'bg-green-100 text-green-700' : 'bg-cocoa-100 text-cocoa-700'}`}>
                    {event.ticket_price_wallet === 0 && event.ticket_price_hp === 0 ? 'FREE' : `${formatNaira(event.ticket_price_wallet)} · ${event.ticket_price_hp} HP`}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-flame-50 text-flame-600 font-bold text-xs">
                    <Flame className="w-3 h-3" />+{event.hp_per_attendee} HP
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Catering Request Modal */}
      {showCatering && <CateringForm onClose={() => setShowCatering(false)} />}
    </div>
  );
}

function CateringForm({ onClose }) {
  const [form, setForm] = useState({
    organizer_name: '', email: '', phone: '', event_name: '', event_date: '',
    expected_guests: '', budget: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    if (!form.organizer_name.trim()) { setError('Please enter the organizer name.'); return; }
    if (!form.email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (!form.phone.match(/^(0|\+234)\d{10}$/)) { setError('Phone must be 11 digits (080...) or +234 + 10 digits.'); return; }
    if (!form.event_name.trim()) { setError('Please enter the event name.'); return; }
    if (!form.event_date) { setError('Please pick the event date.'); return; }
    const guests = parseInt(form.expected_guests, 10);
    if (!guests || guests < 1) { setError('Please enter the expected number of guests.'); return; }
    setSubmitting(true);
    try {
      await mockApi.events.cateringRequest({ ...form, expected_guests: guests });
      setSubmitted(true);
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="font-heading font-bold text-lg text-cocoa-800">Request Received!</h3>
            <p className="text-sm text-cocoa-400 mt-1">We'll be in touch within 24 hours to discuss your event.</p>
            <button onClick={onClose} className="mt-4 px-6 py-3 rounded-full flame-gradient text-white font-bold">Done</button>
          </div>
        ) : (
          <>
            <h3 className="font-heading font-bold text-lg text-cocoa-800 mb-4">List Your Event</h3>
            <div className="space-y-3">
              <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" placeholder="Organizer name" value={form.organizer_name} onChange={e => setForm({ ...form, organizer_name: e.target.value })} />
              <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" placeholder="Phone (+234...)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" placeholder="Event name" value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} />
              <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
              <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" type="number" placeholder="Expected guests" value={form.expected_guests} onChange={e => setForm({ ...form, expected_guests: e.target.value })} />
              <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" type="number" placeholder="Budget (₦)" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
              <textarea className="w-full p-3 rounded-xl border border-cocoa-200 text-sm resize-none" rows={3} placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-xs text-red-700 font-semibold">{error}</span>
                </div>
              )}
              <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 rounded-full flame-gradient text-white font-bold disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}