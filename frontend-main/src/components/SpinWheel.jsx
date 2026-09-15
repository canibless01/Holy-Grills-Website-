import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { mockApi } from '@/lib/mockApi';
import { playSound } from '@/lib/soundManager';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { toast } from '@/components/ui/use-toast';
import { EXCLUSIVE_SPIN_PRIZES, getExclusivePrize } from '@/lib/rewardUtils';
import ModalPortal from '@/components/ModalPortal';

// Wheel segments = the exclusive prize set (the leaderboard spin's gifts).
const SEGMENTS = EXCLUSIVE_SPIN_PRIZES.map((p) => ({
  label: p.label,
  icon: p.icon,
  color: p.color,
  id: p.id,
}));

const SEG_COUNT = SEGMENTS.length;
const SEG_ANGLE = 360 / SEG_COUNT;
const RADIUS = 130;
const CENTER = 150;

const polarToCartesian = (angleDeg, r) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
};

const describeSegment = (i) => {
  const start = polarToCartesian(i * SEG_ANGLE, RADIUS);
  const end = polarToCartesian((i + 1) * SEG_ANGLE, RADIUS);
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y} Z`;
};

// Accelerate (ease-in cubic) for first 12%, then decelerate with increasing
// friction (ease-out quartic) for the rest — a real wheel losing momentum.
const easeSpin = (t) => {
  if (t < 0.12) {
    const tt = t / 0.12;
    return 0.04 * tt * tt * tt;
  }
  const tt = (t - 0.12) / 0.88;
  return 0.04 + 0.96 * (1 - Math.pow(1 - tt, 4));
};

// Reveal copy per prize effect.
const revealCopy = (prize) => {
  if (!prize) return { emoji: '🎁', title: 'Prize won!', body: 'Check your rewards.' };
  switch (prize.type) {
    case 'hp':
      return { emoji: prize.icon || '⚡', title: `+${prize.hp} HP!`, body: 'Holy Points added to your balance.' };
    case 'status':
      return { emoji: prize.icon || '🔥', title: `${prize.label}!`, body: 'Earn double HP on your next order.' };
    case 'next_order':
    default:
      return { emoji: prize.icon || '🎁', title: `${prize.label} won!`, body: `Enjoy a free ${prize.label.replace('Free ', '')} on your next order.` };
  }
};

export default function SpinWheel({ open, onClose, onResult, canSpin = true }) {
  const { refreshHp } = useHolyGrill();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [flashing, setFlashing] = useState(false);
  const [winningIndex, setWinningIndex] = useState(-1);
  const rotRef = useRef(0);
  const rafRef = useRef(null);

  // Idle slow rotation — only when the user can actually spin. When unusable
  // the wheel stays static so it's not misleading.
  useEffect(() => {
    if (!open || spinning || prize || !canSpin) return;
    let lastTime = performance.now();
    const idle = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      rotRef.current += 15 * dt; // 15 deg/sec
      setRotation(rotRef.current % 360);
      rafRef.current = requestAnimationFrame(idle);
    };
    rafRef.current = requestAnimationFrame(idle);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, spinning, prize, canSpin]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      cancelAnimationFrame(rafRef.current);
      setSpinning(false);
      setPrize(null);
      setFlashing(false);
      setWinningIndex(-1);
      setRemaining(null);
    }
  }, [open]);

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setPrize(null);
    setFlashing(false);
    setWinningIndex(-1);
    cancelAnimationFrame(rafRef.current);
    playSound('spin_spinning');

    let apiResult;
    try {
      apiResult = await mockApi.hp.exclusiveSpin();
    } catch (e) {
      setSpinning(false);
      toast({ title: 'Spin failed', description: e.message, variant: 'destructive' });
      return;
    }

    // Map API result to a prize, then to a wheel segment.
    const resolved = getExclusivePrize(apiResult?.prize || apiResult);
    let segIndex = resolved ? SEGMENTS.findIndex((s) => s.id === resolved.id) : -1;
    if (segIndex < 0) segIndex = 0;

    // Calculate landing rotation: 5 full turns + offset to target segment.
    const targetCenter = segIndex * SEG_ANGLE + SEG_ANGLE / 2;
    const currentRot = rotRef.current % 360;
    const baseTarget = (360 - targetCenter) % 360;
    let delta = baseTarget - currentRot;
    if (delta < 0) delta += 360;
    const totalDelta = 360 * 5 + delta;
    const startRot = rotRef.current;
    const duration = 4500;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeSpin(t);
      const currentRot = startRot + totalDelta * eased;
      rotRef.current = currentRot;
      setRotation(currentRot % 360);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Landed — flash winning segment, then confetti + fanfare + reveal.
        setSpinning(false);
        setWinningIndex(segIndex);
        setPrize(resolved);
        setRemaining(apiResult?.spins_remaining ?? apiResult?.spins_left ?? null);
        refreshHp().catch(() => {});

        let flashCount = 0;
        const flashInterval = setInterval(() => {
          setFlashing((prev) => !prev);
          flashCount++;
          if (flashCount >= 4) {
            clearInterval(flashInterval);
            setFlashing(false);
            playSound('spin_win');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 }, colors: ['#F72B13', '#FFC251', '#FFDD9F'] });
            if (onResult) onResult(apiResult);
          }
        }, 200);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  if (!open) return null;

  const reveal = prize ? revealCopy(prize) : null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-bold text-lg text-cocoa-800">🎡 Exclusive Spin</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-cocoa-400" /></button>
        </div>

        {/* Wheel */}
        <div className="relative w-72 h-72 mx-auto mb-4">
          {/* Fixed pointer at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-cocoa-800" />
          <svg viewBox="0 0 300 300" className="w-full h-full" style={{ transform: `rotate(${rotation}deg)` }}>
            {SEGMENTS.map((seg, i) => {
              const isWinning = flashing && i === winningIndex;
              const labelPos = polarToCartesian(i * SEG_ANGLE + SEG_ANGLE / 2, RADIUS * 0.62);
              return (
                <g key={i}>
                  <path
                    d={describeSegment(i)}
                    fill={seg.color}
                    stroke="#fff"
                    strokeWidth="2"
                    style={{ opacity: isWinning ? 1 : 0.88, filter: isWinning ? 'brightness(1.4)' : 'none', transition: 'opacity 0.1s' }}
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fontSize="20"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                  >
                    {seg.icon}
                  </text>
                </g>
              );
            })}
            <circle cx={CENTER} cy={CENTER} r="20" fill="#3D1200" />
            <circle cx={CENTER} cy={CENTER} r="15" fill="#FFC251" />
          </svg>
        </div>

        {/* Result or Spin button */}
        {prize && reveal ? (
          <div className="text-center">
            <div className="text-4xl mb-1">{reveal.emoji}</div>
            <div className="text-2xl font-heading font-extrabold text-cocoa-800">{reveal.title}</div>
            <p className="text-xs text-cocoa-400 mt-1">{reveal.body}</p>
            {remaining != null && <p className="text-xs font-bold text-flame-600 mt-1">{remaining > 0 ? `${remaining} spin${remaining !== 1 ? 's' : ''} remaining` : 'No spins remaining'}</p>}
            <button onClick={onClose} className="mt-4 w-full py-3 rounded-full flame-gradient text-white font-bold text-sm">
              Collect & Close
            </button>
          </div>
        ) : (
          <button
            onClick={handleSpin}
            disabled={spinning || !canSpin}
            className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {spinning ? 'Spinning...' : canSpin ? 'Spin Now 🎡' : 'No spins available'}
          </button>
        )}
      </div>
    </div>
    </ModalPortal>
  );
}