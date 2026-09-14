interface HPProgressBarProps {
  currentHP: number;
  label?: string;
}

export function HPProgressBar({ currentHP, label }: HPProgressBarProps) {
  const maxHP = 500; // visual cap
  const pct = Math.min((currentHP / maxHP) * 100, 100);

  return (
    <div className="w-full">
      {label && <p className="text-sm text-muted-foreground mb-1 font-body">{label}</p>}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-gold transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-accent font-body">{currentHP} HP</span>
      </div>
    </div>
  );
}
