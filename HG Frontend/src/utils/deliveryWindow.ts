import type { DeliveryWindow, DeliveryWindowInfo } from '@/types';

function toDate(base: Date, time: string, dayOffset = 0) {
  const [hours, minutes] = time.split(':').map(Number);
  const value = new Date(base);
  value.setDate(base.getDate() + dayOffset);
  value.setHours(hours, minutes, 0, 0);
  return value;
}

export function getDeliveryWindowInfo(now: Date, hours: DeliveryWindow[]): DeliveryWindowInfo {
  const day = now.getDay();
  const today = hours.find((entry) => entry.day === day);

  if (!today || today.closed) {
    const next = hours.find((entry) => !entry.closed && entry.day !== day) ?? hours[0];
    const targetOffset = next.day > day ? next.day - day : 7 - day + next.day;
    const nextOpen = toDate(now, next.opensAt, targetOffset);
    return {
      status: 'closed',
      message: 'Kitchen is closed right now',
      detail: `Back ${next.label} at ${next.opensAt}`,
      nextChangeLabel: `Reopens in ${Math.max(Math.floor((nextOpen.getTime() - now.getTime()) / 60000), 0)} mins`,
      countdownSeconds: Math.max(Math.floor((nextOpen.getTime() - now.getTime()) / 1000), 0),
    };
  }

  const opensAt = toDate(now, today.opensAt);
  const closesAt = toDate(now, today.closesAt);

  if (now < opensAt) {
    return {
      status: 'closed',
      message: 'Kitchen opens later today',
      detail: `${today.label} delivery starts at ${today.opensAt}`,
      nextChangeLabel: `Opens in ${Math.max(Math.floor((opensAt.getTime() - now.getTime()) / 60000), 0)} mins`,
      countdownSeconds: Math.max(Math.floor((opensAt.getTime() - now.getTime()) / 1000), 0),
    };
  }

  if (now > closesAt) {
    const next = hours.find((entry) => !entry.closed && entry.day !== day) ?? hours[0];
    const targetOffset = next.day > day ? next.day - day : 7 - day + next.day;
    const nextOpen = toDate(now, next.opensAt, targetOffset);
    return {
      status: 'closed',
      message: 'Kitchen is closed for the day',
      detail: `Back ${next.label} at ${next.opensAt}`,
      nextChangeLabel: `Reopens in ${Math.max(Math.floor((nextOpen.getTime() - now.getTime()) / 60000), 0)} mins`,
      countdownSeconds: Math.max(Math.floor((nextOpen.getTime() - now.getTime()) / 1000), 0),
    };
  }

  const remainingSeconds = Math.max(Math.floor((closesAt.getTime() - now.getTime()) / 1000), 0);
  const closingSoon = remainingSeconds <= 45 * 60;

  return {
    status: closingSoon ? 'closing_soon' : 'open',
    message: closingSoon ? 'Closing soon' : 'Now delivering across campus',
    detail: `${today.label} window · ${today.opensAt} – ${today.closesAt}`,
    nextChangeLabel: closingSoon ? `Closes in ${Math.floor(remainingSeconds / 60)} mins` : 'Pickup & delivery available',
    countdownSeconds: remainingSeconds,
  };
}

export function formatCountdown(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${secs.toString().padStart(2, '0')}s`;
  return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
}
