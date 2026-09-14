'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Flame, RotateCcw, X, Award, Smartphone, Bell, Gift, Loader2 } from 'lucide-react';
import { useAuthStreak } from '@/hooks/useAuthStreak';
import { challengesService } from '@/services/api/challenges.service';
import { toast } from 'sonner';

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const StreakPage = () => {
  const queryClient = useQueryClient();
  const { data: streakData, isLoading: streakLoading } = useAuthStreak();
  const streak = streakData?.streakCount ?? 0;

  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Fetch caller's badges and challenges
  const { data: myChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges', 'my'],
    queryFn: () => challengesService.getMyChallenges(),
    retry: 1,
  });

  // Fetch PWA/Push bonus status
  const { data: bonusStatus, isLoading: bonusLoading } = useQuery({
    queryKey: ['challenges', 'pwa-push-bonus'],
    queryFn: () => challengesService.getPwaPushBonusStatus(),
    retry: 1,
  });

  // Mutation to complete a milestone/challenge
  const completeMutation = useMutation({
    mutationFn: (milestoneId: string) => challengesService.completeChallenge(milestoneId),
    onMutate: (id) => setClaimingId(id),
    onSettled: () => setClaimingId(null),
    onSuccess: (res) => {
      if (res.success || res.hp_awarded) {
        toast.success(`Challenge completed! +${res.hp_awarded ?? 0} HP awarded.`);
      } else if (res.already_completed) {
        toast.info('Challenge already claimed for this period.');
      } else {
        toast.error(res.message || 'Could not complete challenge.');
      }
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'streak'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to claim challenge.');
    },
  });

  // Mutation for PWA Install claim
  const pwaInstallMutation = useMutation({
    mutationFn: () => challengesService.recordPwaInstalled(),
    onSuccess: (res) => {
      if (res.already_completed) {
        toast.info('PWA Install reward already claimed.');
      } else {
        toast.success(`PWA Installed! +${res.hp_awarded ?? 50} HP awarded.`);
      }
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record PWA install.');
    },
  });

  // Mutation for Push Subscription claim
  const pushSubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported in this browser.');
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission was denied.');
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      return challengesService.recordPushSubscribed({
        subscription: sub.toJSON() as Record<string, unknown>,
        device_label: navigator.userAgent,
      });
    },
    onSuccess: (res) => {
      if (res.already_completed) {
        toast.info('Push subscription reward already claimed.');
      } else {
        toast.success(`Push Subscribed! +${res.hp_awarded ?? 25} HP awarded.`);
      }
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to subscribe to push notifications.');
    },
  });

  const availableChallenges = myChallenges?.challenges_available ?? [];
  const completedChallenges = myChallenges?.challenges_completed ?? [];
  const badges = myChallenges?.badges ?? [];

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-6 px-4">
        {/* Banner */}
        <section className="rounded-[2rem] bg-gradient-fire p-6 text-primary-foreground shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] opacity-80 font-semibold">Login Streak</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h1 className="font-display text-4xl font-bold">
              {streakLoading ? '...' : `${streak} day${streak === 1 ? '' : 's'}`}
            </h1>
            <Flame className="h-8 w-8 text-amber-300 animate-pulse" />
          </div>
          <p className="mt-1 text-sm opacity-90">
            Log in daily to keep your streak alive and unlock bonus Holy Points.
          </p>
        </section>

        {/* 7-Day Cycle Calendar */}
        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">Weekly Streak Log</h2>
          <div className="grid grid-cols-7 gap-2">
            {WEEK.map((day, index) => {
              const status = index < Math.min(streak, 7) ? 'checked' : index === Math.min(streak, 7) ? 'pending' : 'missed';
              return (
                <div key={day} className="text-center">
                  <div
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      status === 'checked'
                        ? 'bg-emerald-500/15 text-emerald-600 font-bold'
                        : status === 'pending'
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {status === 'checked' ? <Check size={16} /> : status === 'pending' ? <Flame size={16} /> : <X size={14} />}
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">{day}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* PWA & Push Bonus Section */}
        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" /> App & Push Bonus Badges
              </h2>
              <p className="text-xs text-muted-foreground">Install app & turn on notifications to claim bonus HP.</p>
            </div>
            {bonusStatus?.bonus_completed && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                Bonus Claimed (+75 HP)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PWA Card */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Install App</p>
                  <p className="text-xs text-muted-foreground">+50 HP reward</p>
                </div>
              </div>
              <button
                disabled={bonusStatus?.pwa_install || pwaInstallMutation.isPending}
                onClick={() => pwaInstallMutation.mutate()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {bonusStatus?.pwa_install ? 'Claimed' : pwaInstallMutation.isPending ? 'Claiming...' : 'Claim'}
              </button>
            </div>

            {/* Push Card */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">+25 HP reward</p>
                </div>
              </div>
              <button
                disabled={bonusStatus?.push_subscribe || pushSubscribeMutation.isPending}
                onClick={() => pushSubscribeMutation.mutate()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {bonusStatus?.push_subscribe ? 'Claimed' : pushSubscribeMutation.isPending ? 'Claiming...' : 'Subscribe'}
              </button>
            </div>
          </div>
        </section>

        {/* Available Challenges Section */}
        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" /> Active Challenges & Milestones
          </h2>

          {challengesLoading ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading challenges...
            </div>
          ) : availableChallenges.length === 0 && completedChallenges.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">No active challenges available right now. Check back soon!</p>
          ) : (
            <div className="space-y-3">
              {availableChallenges.map((m) => (
                <div key={m.id} className="rounded-xl border border-border p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.title}</p>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                    <span className="mt-1 inline-block text-[11px] font-medium text-primary">
                      +{m.hp_awarded} HP {m.time_window ? `(${m.time_window})` : ''}
                    </span>
                  </div>
                  <button
                    disabled={completeMutation.isPending && claimingId === m.id}
                    onClick={() => completeMutation.mutate(m.id)}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {claimingId === m.id ? 'Claiming...' : 'Claim'}
                  </button>
                </div>
              ))}

              {completedChallenges.map((m) => (
                <div key={m.id} className="rounded-xl border border-border/50 bg-muted/30 p-4 flex items-center justify-between opacity-75">
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {m.title} <Check className="h-4 w-4 text-emerald-500" />
                    </p>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Completed (+{m.hp_awarded} HP)
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Lifetime Badges */}
        {badges.length > 0 && (
          <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-foreground">Earned Badges</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((badge, idx) => (
                <div key={badge.id || idx} className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 font-bold mb-2">
                    <Award className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate">{badge.title || 'Badge'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <p className="inline-flex items-center gap-2 font-semibold text-foreground">
            <RotateCcw size={14} className="text-primary" /> Missed a day?
          </p>
          <span className="ml-1">Complete an order or top up your wallet to reclaim streak momentum.</span>
        </section>
      </div>
    </main>
  );
};

export default StreakPage;
