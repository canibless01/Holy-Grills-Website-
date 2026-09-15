import React, { useState } from 'react';
import { Utensils, ChevronRight, X, Loader2, Calendar, Users, Phone, Mail } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { toast } from '@/components/ui/use-toast';

/**
 * CateringCard — static, on-brand Catering card on the Home page, visible to
 * guests and authenticated users alike.
 *
 * Backend mapping: the CTA opens an inline request form that POSTs to
 * /events/catering-requests (public submissions allowed). Admins manage
 * incoming requests via AdminCatering (GET/PATCH /events/catering-requests).
 *
 * NOTE: This card is intentionally NOT driven by a storefront section. The
 * StorefrontSection entity only supports section_type values of hero, banner,
 * promo, faq, early_supporter — there is no 'service' type, so a storefront
 * lookup would always return empty and the card would never render. Catering
 * is a core always-on service, so it shows unconditionally.
 */
const CATERING_IMAGE = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=70';

export default function CateringCard() {
  const { isAuthenticated } = useHolyGrill();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ organizer_name: '', phone: '', email: '', event_name: '', event_date: '', expected_guests: '', details: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.organizer_name.trim() || !form.phone.trim()) { toast({ title: 'Name & phone required', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await mockApi.events.cateringRequest({
        organizer_name: form.organizer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        event_name: form.event_name.trim() || form.details.trim() || 'Catering request',
        event_date: form.event_date || undefined,
        expected_guests: form.expected_guests ? Number(form.expected_guests) : undefined,
        details: form.details.trim() || undefined,
      });
      toast({ title: '🍽️ Request sent', description: 'Our team will reach out shortly.' });
      setShowForm(false);
      setForm({ organizer_name: '', phone: '', email: '', event_name: '', event_date: '', expected_guests: '', details: '' });
    } catch (err) {
      toast({ title: 'Request failed', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <>
      <div id="catering" className="rounded-2xl bg-white border border-cocoa-100 overflow-hidden hover:shadow-selected-soft transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image — visible on all devices (kept in sync with desktop) */}
          <div className="relative h-32 sm:h-full min-h-[200px] bg-cocoa-100">
            <img src={CATERING_IMAGE} alt="Catering spread" loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-flame-50 flex items-center justify-center">
                <Utensils className="w-4.5 h-4.5 text-flame-600" />
              </div>
              <span className="hg-eyebrow">Catering</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-cocoa-800">Grill for your events</h3>
            <p className="text-sm text-cocoa-500 mt-1.5 leading-relaxed">
              Hostels, departmental weeks, faculty dinners, birthday parties — we bring the flame to you. Bulk grilling, sides, and drinks tailored to your guest count.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 self-start px-5 py-2.5 rounded-button flame-gradient text-white text-sm font-bold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-transform"
            >
              Request catering <ChevronRight className="w-4 h-4" />
            </button>
            {!isAuthenticated && (
              <p className="text-[11px] text-cocoa-400 mt-2.5">No account needed — guests welcome.</p>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => !submitting && setShowForm(false)}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-cocoa-800 flex items-center gap-2"><Utensils className="w-5 h-5 text-flame-600" /> Catering Request</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <div className="relative">
              <Users className="w-4 h-4 text-cocoa-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={form.organizer_name} onChange={(e) => setForm({ ...form, organizer_name: e.target.value })} placeholder="Your name (organizer)" className="w-full pl-9 pr-3 py-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-cocoa-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (08012345678)" className="w-full pl-9 pr-3 py-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-cocoa-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" className="w-full pl-9 pr-3 py-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            </div>
            <input value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} placeholder="Event name (e.g., Departmental Week)" className="w-full px-3 py-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="w-4 h-4 text-cocoa-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full pl-9 pr-3 py-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
              </div>
              <input type="number" value={form.expected_guests} onChange={(e) => setForm({ ...form, expected_guests: e.target.value })} placeholder="Guests" className="w-full px-3 py-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            </div>
            <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Tell us about your event…" rows={3} className="w-full p-3 rounded-xl border border-cocoa-200 text-sm resize-none focus:outline-none focus:border-flame-400" />
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send request'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}