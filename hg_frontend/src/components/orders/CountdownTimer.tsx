import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  etaTimestamp: string;
  onExpire?: () => void;
}

export function CountdownTimer({ etaTimestamp, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const eta = new Date(etaTimestamp).getTime();
      const diff = eta - now;

      if (diff <= 0) {
        setExpired(true);
        onExpire?.();
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      if (mins < 2) {
        setTimeLeft('Arriving soon!');
      } else {
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [etaTimestamp, onExpire]);

  if (expired) return null;

  return (
    <div className="flex items-center gap-3 justify-center">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Clock size={20} className="text-primary" />
      </div>
      <div className="text-center">
        <p className="font-display font-bold text-foreground text-3xl tracking-tight">
          {timeLeft}
        </p>
        <p className="text-xs text-muted-foreground font-body">estimated arrival</p>
      </div>
    </div>
  );
}
