export type ToneType = 'add' | 'checkout' | 'navigate' | 'notification' | 'dispatch' | 'order_confirmed' | 'reward_claimed' | 'hp_earned' | 'streak_milestone' | 'tier_up';

const FREQUENCIES: Record<ToneType, [number, number]> = {
  add: [660, 880],
  checkout: [520, 780],
  navigate: [440, 620],
  notification: [880, 1100],
  dispatch: [587, 880],
  order_confirmed: [523, 1046],
  reward_claimed: [784, 1174],
  hp_earned: [659, 987],
  streak_milestone: [880, 1318],
  tier_up: [523, 1318],
};

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('hg_sound_muted') === 'true';
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hg_sound_muted', muted ? 'true' : 'false');
}

export function playUiTone(type: ToneType) {
  if (typeof window === 'undefined' || isSoundMuted()) return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const context = new AudioCtx();
    const [first, second] = FREQUENCIES[type] || [440, 620];

    const play = (frequency: number, start: number, duration = 0.12) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const start = context.currentTime;
    play(first, start);
    play(second, start + 0.1);
    window.setTimeout(() => context.close().catch(() => {}), 500);
  } catch {
    // Ignore audio context errors if browser blocks autoplay
  }
}

export function playAlertChime() {
  playUiTone('notification');
}
