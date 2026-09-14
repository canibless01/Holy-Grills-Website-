import type { LucideIcon } from 'lucide-react';
import { Link } from '@/lib/router';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, ctaTo }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon size={24} />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {ctaLabel && ctaTo ? (
        <Link to={ctaTo} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
