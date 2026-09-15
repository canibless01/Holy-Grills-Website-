import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, Flame, Users, Ticket, Check, QrCode, Camera, Wallet, Info } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { formatDateTime, formatNaira } from '@/lib/hgUtils';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import EventCheckInScanner from '@/components/EventCheckInScanner';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshHp, hpBalance, wallet } = useHolyGrill();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);
  const [checkinError, setCheckinError] = useState(null);
  const [payWith, setPayWith] = useState('wallet');
  const [tiers, setTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const e = await mockApi.events.get(id);
        setEvent(e);
        if (e.has_ticket) setTicket({ ticket_id: 'existing', status: 'confirmed' });
        try { const t = await mockApi.events.getTiers(id); setTiers(t); } catch { /* no tiers */ }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  const isFreeEvent = event && event.ticket_price_wallet === 0 && event.ticket_price_hp === 0 && tiers.length === 0;

  const isLive = event && (
    new Date(event.starts_at) <= new Date() && new Date(event.ends_at) >= new Date()
  );
  const isToday = event && new Date(event.starts_at).toDateString() === new Date().toDateString();
  const canCheckin = true;

  const effectivePriceWallet = selectedTier ? (selectedTier.price_wallet || selectedTier.price_naira || 0) : event?.ticket_price_wallet;
  const effectivePriceHp = selectedTier ? (selectedTier.price_hp || 0) : event?.ticket_price_hp;

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const body = { pay_with: payWith };
      if (selectedTier) body.tier_id = selectedTier.id;
      const result = await mockApi.events.register(id, body);
      // Normalise the ticket id so the confirmation card always has a value.
      const ticketId = result?.ticket_id || result?.id || result?.ticket?.id || '—';
      setTicket({ ...result, ticket_id: ticketId, tier_name: selectedTier?.name });
      toast({ title: '✅ Ticket secured!', description: selectedTier ? `Your ${selectedTier.name} ticket is confirmed.` : 'Your ticket is confirmed.' });
      const e = await mockApi.events.get(id);
      // Persist the registered state locally so the confirmation (not the
      // register button) shows even if the backend hasn't flipped has_ticket yet.
      setEvent({ ...e, has_ticket: true });
    } catch (e) { toast({ title: 'Registration failed', description: e.message, variant: 'destructive' }); }
    setRegistering(false);
  };

  const handleScanCheckin = () => {
    setCheckinError(null);
    setShowScanner(true);
  };

  const handleScannedToken = async (qrToken) => {
    setShowScanner(false);
    setScanning(true);
    try {
      const result = await mockApi.events.checkin(id, { qr_token: qrToken });
      // Normalise the HP-added field so the success card never shows undefined.
      const hpAdded = result?.hp_added_to_pending ?? result?.hp_earned ?? result?.pending_hp ?? result?.hp_awarded ?? 0;
      setCheckinResult({ ...result, hp_added_to_pending: hpAdded });
      await refreshHp();
      const e = await mockApi.events.get(id);
      setEvent(e);
    } catch (e) {
      setCheckinError(e.message);
    }
    setScanning(false);
  };

  if (loading) return <LoadingSpinner label="Loading event..." />;
  if (!event) return <div className="text-center py-12 text-cocoa-400">Event not found</div>;

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      <button onClick={() => navigate('/events')} className="flex items-center gap-1 text-sm text-cocoa-500">
        <ChevronLeft className="w-4 h-4" /> Back to events
      </button>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-cocoa-100">
        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/80 via-cocoa-900/30 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          {event.is_featured && (
            <span className="inline-block px-2 py-1 rounded-full flame-gradient text-white text-[10px] font-bold mb-2">⭐ Featured Event</span>
          )}
          {isFreeEvent && (
            <span className="inline-block px-2 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold mb-2 ml-1">FREE</span>
          )}
          <h1 className="font-heading font-extrabold text-2xl text-white">{event.title}</h1>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-cocoa-100 p-3">
          <Calendar className="w-4 h-4 text-flame-600 mb-1" />
          <div className="text-xs text-cocoa-400">Date & Time</div>
          <div className="text-sm font-semibold text-cocoa-700">{formatDateTime(event.starts_at)}</div>
        </div>
        <div className="rounded-xl bg-white border border-cocoa-100 p-3">
          <MapPin className="w-4 h-4 text-flame-600 mb-1" />
          <div className="text-xs text-cocoa-400">Location</div>
          <div className="text-sm font-semibold text-cocoa-700">{event.location}</div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl bg-white border border-cocoa-100 p-4">
        <h3 className="font-bold text-sm text-cocoa-800 mb-2">About this event</h3>
        <p className="text-sm text-cocoa-500 leading-relaxed">{event.description}</p>
      </div>

      {/* HP reward */}
      <div className="rounded-2xl bg-gradient-to-br from-flame-50 to-gold-100 border border-flame-200 p-4 flex items-center gap-3">
        <div className="text-3xl">🔥</div>
        <div>
          <div className="font-bold text-cocoa-800">Earn {event.hp_per_attendee} HP at the event</div>
          <div className="text-xs text-cocoa-500">Scan the QR code displayed at the venue to claim</div>
        </div>
      </div>

      {/* How check-in works */}
      <div className="rounded-2xl bg-cream-100 border border-cocoa-200 p-4 flex gap-3">
        <Info className="w-4 h-4 text-flame-600 mt-0.5 shrink-0" />
        <div className="text-xs text-cocoa-700 leading-relaxed">
          {isFreeEvent
            ? "This is a free event — no registration needed. When you arrive, open this page and tap Scan QR Code to scan the Holy Grill QR displayed at the entrance. That's how you claim your HP."
            : "After registering, your ticket is your payment proof. At the event, scan the Holy Grill QR code displayed at the entrance to check in and earn your HP."}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-cocoa-100 p-3 text-center">
          <Users className="w-4 h-4 text-cocoa-400 mx-auto mb-1" />
          <div className="font-bold text-cocoa-800">{event.checkin_count}/{event.max_attendees}</div>
          <div className="text-xs text-cocoa-400">Checked in</div>
        </div>
        <div className="rounded-xl bg-white border border-cocoa-100 p-3 text-center">
          <Ticket className="w-4 h-4 text-cocoa-400 mx-auto mb-1" />
          <div className="font-bold text-cocoa-800">{isFreeEvent ? 'FREE ENTRY' : formatNaira(effectivePriceWallet)}</div>
          <div className="text-xs text-cocoa-400">Ticket</div>
        </div>
      </div>

      {/* Check-in result */}
      {checkinResult && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-center animate-count-up">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="font-heading font-bold text-lg text-green-800">Check-in Successful!</h3>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Flame className="w-5 h-5 text-flame-600" />
            <span className="font-bold text-flame-600">+{checkinResult.hp_added_to_pending} HP added to pending pool</span>
          </div>
          <p className="text-xs text-green-600 mt-1">HP unlocks once your next order is delivered</p>
        </div>
      )}

      {checkinError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-center">
          <div className="text-2xl mb-2">❌</div>
          <p className="font-bold text-red-800 text-sm">{checkinError}</p>
        </div>
      )}

      {/* ===== ACTION AREA ===== */}

      {/* Already checked in */}
      {event.checked_in ? (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <Check className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <div className="font-bold text-green-800">You've checked in! 🎉</div>
            <div className="text-xs text-green-600">{event.hp_per_attendee} HP added to your pending pool</div>
          </div>
        </div>

      ) : isFreeEvent ? (
        <div className="rounded-2xl bg-white border-2 border-flame-200 p-5 text-center space-y-3">
          <QrCode className="w-12 h-12 text-cocoa-400 mx-auto" />
          <div>
            <div className="font-bold text-cocoa-800 text-sm">Ready to check in?</div>
            <div className="text-xs text-cocoa-400 mt-1">Point your camera at the Holy Grill QR code displayed at the event entrance</div>
          </div>
          {canCheckin ? (
            <button onClick={handleScanCheckin} disabled={scanning} className="w-full py-3.5 rounded-full flame-gradient text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {scanning ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning QR code…</>) : (<><Camera className="w-4 h-4" /> Scan QR Code to Check In</>)}
            </button>
          ) : (
            <div className="text-xs text-cocoa-400 bg-cocoa-50 rounded-xl p-3">Check-in opens when the event starts on {formatDateTime(event.starts_at)}</div>
          )}
        </div>

      ) : (ticket || event.has_ticket) ? (
        <div className="rounded-2xl bg-white border-2 border-flame-200 p-5 space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" /> Ticket Confirmed
            </div>
            {ticket?.tier_name && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold ml-2">
                <Ticket className="w-3.5 h-3.5" /> {ticket.tier_name}
              </div>
            )}
            <p className="text-xs text-cocoa-400 mt-2">Your entry is confirmed. At the event, scan the Holy Grill QR code at the entrance to check in and earn {event.hp_per_attendee} HP.</p>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-flame-300 p-4 text-center bg-flame-50/50">
            <QrCode className="w-16 h-16 text-cocoa-700 mx-auto mb-2" />
            <div className="text-[10px] text-cocoa-400 uppercase tracking-wide">Ticket ID</div>
            <div className="font-mono font-bold text-sm text-cocoa-800 break-all">{ticket.ticket_id}</div>
            <p className="text-[10px] text-cocoa-400 mt-1">Show this at the entrance</p>
          </div>
          {canCheckin ? (
            <button onClick={handleScanCheckin} disabled={scanning} className="w-full py-3.5 rounded-full flame-gradient text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {scanning ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning QR code…</>) : (<><Camera className="w-4 h-4" /> Scan QR Code to Check In</>)}
            </button>
          ) : (
            <div className="text-xs text-cocoa-400 bg-cocoa-50 rounded-xl p-3 text-center">Check-in opens at the event on {formatDateTime(event.starts_at)}</div>
          )}
        </div>

      ) : (
        /* PAID EVENT — not yet registered */
        <div className="rounded-2xl bg-white border border-cocoa-100 p-5 space-y-4">
          <h3 className="font-bold text-sm text-cocoa-800">Get your ticket</h3>

          {/* Tier selection */}
          {tiers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-cocoa-400 font-medium uppercase tracking-wide">Select a tier</div>
              <div className="grid grid-cols-2 gap-2">
                {tiers.map((t) => {
                  const remaining = (t.quantity_available || t.capacity || 0) - (t.quantity_sold || t.tickets_sold || 0);
                  const soldOut = remaining <= 0;
                  const isSelected = selectedTier?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => !soldOut && setSelectedTier(t)}
                      disabled={soldOut}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-flame-500 bg-flame-50' : 'border-cocoa-200'} ${soldOut ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                      <div className="font-bold text-sm text-cocoa-800">{t.name}</div>
                      <div className="text-xs text-cocoa-500 mt-0.5">₦{t.price_wallet || t.price_naira || 0} · {t.price_hp || 0} HP</div>
                      <div className={`text-[10px] font-semibold mt-1 ${remaining <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                        {soldOut ? 'Sold out' : `${remaining} left`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pay with */}
          <div className="space-y-2">
            <div className="text-xs text-cocoa-400 font-medium uppercase tracking-wide">Pay with</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPayWith('wallet')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${payWith === 'wallet' ? 'border-flame-500 bg-flame-50 text-flame-700' : 'border-cocoa-200 text-cocoa-600'}`}
              >
                <Wallet className="w-4 h-4" />
                <span>Wallet · {formatNaira(effectivePriceWallet)}</span>
              </button>
              <button
                onClick={() => setPayWith('hp')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${payWith === 'hp' ? 'border-flame-500 bg-flame-50 text-flame-700' : 'border-cocoa-200 text-cocoa-600'}`}
              >
                <Flame className="w-4 h-4" />
                <span>HP · {effectivePriceHp || 0} HP</span>
              </button>
            </div>
            <div className="text-xs text-cocoa-400">
              {payWith === 'wallet' ? `Wallet balance: ${formatNaira(wallet?.balance || 0)}` : `HP balance: ${hpBalance?.active || 0} HP`}
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={registering || (tiers.length > 0 && !selectedTier)}
            className="w-full py-4 rounded-full flame-gradient text-white font-bold shadow-lg disabled:opacity-50"
          >
            {registering ? 'Securing your ticket…' : tiers.length > 0 && !selectedTier ? 'Select a tier to continue' : `Register — ${payWith === 'wallet' ? formatNaira(effectivePriceWallet) : `${effectivePriceHp || 0} HP`}`}
          </button>
        </div>
      )}

      {/* Venue QR scanner modal — student scans the QR displayed at the entrance */}
      {showScanner && (
        <EventCheckInScanner
          eventId={id}
          onScan={handleScannedToken}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}