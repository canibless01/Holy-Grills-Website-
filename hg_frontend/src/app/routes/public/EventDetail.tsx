'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle2, ChevronLeft, Flame, MapPin, Ticket, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useParams } from '@/lib/router';
import {
  getEvent,
  getEventTicketTiers,
  registerForEvent,
  checkinEvent,
  type CampusEventItem,
  type EventTicketTier,
} from '@/services/api/events.service';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [issuedQrCode, setIssuedQrCode] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Fetch event
  const { data: event = null, isLoading: isLoadingEvent } = useQuery<CampusEventItem | null>({
    queryKey: ['event-detail', id],
    queryFn: () => (id ? getEvent(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  // Fetch ticket tiers
  const { data: tiers = [] } = useQuery<EventTicketTier[]>({
    queryKey: ['event-tiers', id],
    queryFn: () => (id ? getEventTicketTiers(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });

  const selectedTier = tiers.find((t) => t.id === selectedTierId) || tiers[0];

  // Register / buy ticket mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user) throw new Error('Authentication required');
      return registerForEvent(id, {
        name: user.full_name || user.email,
        email: user.email,
        phone: user.phone || '08000000000',
        payment_method: selectedTier && selectedTier.price_naira > 0 ? 'wallet' : 'free',
        tier_id: selectedTier?.id,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['event-detail', id] });
      setIssuedQrCode(res.qr_code || 'QR-VALID-TICKET');
      toast.success(res.message || 'Ticket purchased successfully! Your QR code is ready.');
    },
    onError: () => {
      toast.error('Ticket purchase failed.');
    },
  });

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user) throw new Error('Authentication required');
      return checkinEvent(id, {
        email: user.email,
        qr_token: issuedQrCode || undefined,
      });
    },
    onSuccess: (res) => {
      setIsCheckedIn(true);
      toast.success(res.message || `Check-in successful! +${res.hp_earned || 20} HP awarded.`);
    },
    onError: () => {
      toast.error('Event check-in failed.');
    },
  });

  if (isLoadingEvent) {
    return (
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-3xl px-4 space-y-4">
          <div className="h-64 animate-pulse rounded-[2rem] bg-card border border-border" />
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-3xl px-4 text-xs text-muted-foreground">
          Event not found.
        </div>
      </main>
    );
  }

  const isFree = (event.ticketPrice ?? 0) === 0;

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-6 px-4">
        <Link to="/events" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ChevronLeft size={14} /> Back to Events
        </Link>

        {/* Event Banner & Details */}
        <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
          <div className="relative aspect-[16/10] bg-secondary">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
            )}
          </div>

          <div className="space-y-4 p-6">
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {event.title}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-foreground font-medium">
                <Calendar size={16} className="text-primary" />
                <span>{event.date}</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-foreground font-medium">
                <MapPin size={16} className="text-primary" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Flame size={13} />
              <span>+{event.hpReward || 20} HP on Event Check-in</span>
            </div>
          </div>
        </section>

        {/* Registration or Digital QR Ticket Card */}
        {isCheckedIn ? (
          <section className="rounded-[2rem] border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-display font-bold text-lg text-emerald-800 dark:text-emerald-300">
              Checked In Successfully!
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Welcome to the event! Your +{event.hpReward || 20} HP reward has been added to your profile.
            </p>
          </section>
        ) : issuedQrCode ? (
          <section className="rounded-[2rem] border border-border bg-card p-6 text-center space-y-4 shadow-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Ticket size={14} /> Digital Entry Pass Ready
            </div>

            <h2 className="font-display font-bold text-xl text-foreground">Your Event QR Ticket</h2>

            {/* QR Ticket Box */}
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-4">
              <div className="text-center space-y-2">
                <QrCode size={80} className="mx-auto text-primary" />
                <p className="font-mono text-xs font-bold text-foreground">{issuedQrCode}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Show this QR code at the entrance for instant check-in.
            </p>

            <button
              onClick={() => checkinMutation.mutate()}
              disabled={checkinMutation.isPending}
              className="w-full rounded-full bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700"
            >
              {checkinMutation.isPending ? 'Verifying Check-in...' : 'Simulate Entrance Door Scan'}
            </button>
          </section>
        ) : (
          /* Ticket Tiers Selection & Purchase */
          <section className="rounded-[2rem] border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="font-display font-bold text-lg text-foreground">Select Ticket Tier</h2>

            {tiers.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      (selectedTier?.id || tiers[0]?.id) === tier.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                        : 'border-border bg-background'
                    }`}
                  >
                    <p className="font-bold text-foreground text-sm">{tier.name}</p>
                    <div className="mt-2 flex items-center justify-between font-semibold">
                      <span className="text-foreground">
                        {tier.price_naira > 0 ? formatPrice(tier.price_naira) : 'Free Pass'}
                      </span>
                      {tier.price_hp > 0 && (
                        <span className="text-primary">{tier.price_hp} HP</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              disabled={registerMutation.isPending}
              onClick={() => {
                if (!user) {
                  toast.error('Please log in to register for tickets.');
                  return;
                }
                setShowConfirmDialog(true);
              }}
              className="w-full rounded-full bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              {registerMutation.isPending
                ? 'Processing Ticket...'
                : !user
                  ? 'Login to Register'
                  : isFree
                    ? 'Get Free Ticket Pass'
                    : `Register Ticket — ${selectedTier ? formatPrice(selectedTier.price_naira) : 'Free'}`}
            </button>
          </section>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Event Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm registration for "{event.title}" ({selectedTier?.name || 'Standard Entry'})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                registerMutation.mutate();
              }}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm Registration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
