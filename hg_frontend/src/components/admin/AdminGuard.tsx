'use client';

import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { EmptyState } from '@/components/shared/EmptyState';

export function AdminGuard({ children, allowKitchen = false }: { children: ReactNode; allowKitchen?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const allowed = user?.role === 'admin' || (allowKitchen && user?.role === 'kitchen');

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-2xl pt-16">
          <EmptyState
            icon={ShieldAlert}
            title="Restricted workspace"
            description="This workspace is only visible to approved Holy Grills operators. Switch to an admin or kitchen role once backend auth is connected."
            ctaLabel="Return home"
            ctaTo="/"
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
