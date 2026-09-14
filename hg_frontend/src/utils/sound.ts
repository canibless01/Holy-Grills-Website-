export type ToneType = 'add' | 'checkout' | 'navigate' | 'notification' | 'dispatch';

const FREQUENCIES: Record<ToneType, [number, number]> = {
  add: [660, 880],
  checkout: [520, 780],
  navigate: [440, 620],
  notification: [880, 1100],
  dispatch: [587, 880],
};

export function playUiTone(type: ToneType) {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const context = new AudioCtx();
    const [first, second] = FREQUENCIES[type] || [440, 620];

    const play = (frequency: number, start: number, duration = 0.08) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const start = context.currentTime;
    play(first, start);
    play(second, start + 0.09);
    window.setTimeout(() => context.close().catch(() => {}), 400);
  } catch {
    // Ignore audio context errors if browser blocks autoplay
  }
}

export function playAlertChime() {
  playUiTone('notification');
}
