'use client';

import { Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublicConfig } from '@/services/api/storefront.service';

interface EarlySupporter {
  id?: string;
  full_name?: string;
  note?: string;
}

export function EarlySupportersSection() {
  const { data: publicConfig } = useQuery({
    queryKey: ['storefront-public-config'],
    queryFn: getPublicConfig,
  });

  const rawSupporters = (publicConfig as Record<string, unknown>)?.early_supporters;

  const supporters: EarlySupporter[] = Array.isArray(rawSupporters) && rawSupporters.length > 0
    ? (rawSupporters as EarlySupporter[])
    : [
        { id: '1', full_name: 'David A.', note: 'Believed in the flame from day one.' },
        { id: '2', full_name: 'Grace O.', note: 'First customer at FUTA hostelling.' },
        { id: '3', full_name: 'Tobi M.', note: 'Always repping Holy Grills.' },
      ];

  return (
    <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-primary" />
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Grateful</span>
          <h2 className="font-display font-bold text-lg text-foreground">Early Supporters</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {supporters.map((s, idx) => (
          <div key={s.id || `supporter-${idx}`} className="rounded-2xl bg-secondary/40 border border-border p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-2">
              {(s.full_name || 'A').charAt(0)}
            </div>
            <div className="font-display font-bold text-sm text-foreground">{s.full_name || 'Supporter'}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.note || 'Early supporter of Holy Grills.'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
