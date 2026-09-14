import type { OrderStatus } from '@/types';

interface StatusBarProps {
  currentStatus: OrderStatus;
  timestamps: Partial<Record<OrderStatus, string>>;
}

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

export function StatusBar({ currentStatus, timestamps }: StatusBarProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isComplete = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-body transition-all duration-400 ${
                    isComplete
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {isComplete ? '✓' : i + 1}
                </div>
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
                )}
              </div>
              <span className={`text-[10px] mt-1.5 font-body text-center ${isComplete ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
              {timestamps[step.key] && (
                <span className="text-[9px] text-muted-foreground">
                  {new Date(timestamps[step.key]!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {/* Connector line */}
      <div className="relative mt-[-40px] mx-4 mb-8">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-secondary" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-700 ease-out"
          style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
