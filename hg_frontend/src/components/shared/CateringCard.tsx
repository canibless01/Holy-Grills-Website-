'use client';

import { useState } from 'react';
import { Utensils, ChevronRight, X, Loader2, Calendar, Users, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const CATERING_IMAGE = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=70';

export function CateringCard() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ organizer_name: '', phone: '', email: '', event_name: '', event_date: '', expected_guests: '', details: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organizer_name.trim() || !form.phone.trim()) {
      toast.error('Name & phone number are required');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('🍽️ Catering request submitted! Our team will reach out shortly.');
      setSubmitting(false);
      setShowForm(false);
      setForm({ organizer_name: '', phone: '', email: '', event_name: '', event_date: '', expected_guests: '', details: '' });
    }, 600);
  };

  return (
    <>
      <div id="catering" className="rounded-3xl bg-card border border-border overflow-hidden p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="relative h-48 md:h-full rounded-2xl overflow-hidden bg-muted">
            <img src={CATERING_IMAGE} alt="Catering spread" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Catering</span>
            </div>
            <h3 className="font-display font-bold text-xl text-foreground">Grill for your events</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Hostels, departmental weeks, faculty dinners, birthday parties — we bring the flame to you. Bulk grilling, sides, and drinks tailored to your guest count.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Request catering <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => !submitting && setShowForm(false)}>
          <form onSubmit={handleSubmit} className="bg-card border border-border text-card-foreground rounded-2xl p-6 w-full max-w-md space-y-3 animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2"><Utensils className="w-5 h-5 text-primary" /> Catering Request</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="relative">
              <Users className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={form.organizer_name} onChange={(e) => setForm({ ...form, organizer_name: e.target.value })} placeholder="Your name (organizer)" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (08012345678)" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <input value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} placeholder="Event name (e.g., Departmental Week)" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <input type="number" value={form.expected_guests} onChange={(e) => setForm({ ...form, expected_guests: e.target.value })} placeholder="Guests" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Tell us about your event…" rows={3} className="w-full p-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send request'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
