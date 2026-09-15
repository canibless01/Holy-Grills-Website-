'use client';

import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { EmptyState } from '@/components/shared/EmptyState';

interface AdminGuardProps {
  children: ReactNode;
  allowKitchen?: boolean;
  allowRider?: boolean;
}

export function AdminGuard({ children, allowKitchen = false, allowRider = false }: AdminGuardProps) {
  const user = useAuthStore((state) => state.user);
  const allowed =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    (allowKitchen && user?.role === 'kitchen') ||
    (allowRider && user?.role === 'rider');

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-2xl pt-16">
          <EmptyState
            icon={ShieldAlert}
            title="Restricted workspace"
            description="This workspace is only visible to approved Holy Grills operators with appropriate role credentials."
            ctaLabel="Return home"
            ctaTo="/"
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
