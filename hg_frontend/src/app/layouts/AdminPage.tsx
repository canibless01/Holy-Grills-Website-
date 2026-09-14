import type { ReactNode } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AdminPage({ title, subtitle, children }: AdminPageProps) {
  return (
    <AdminGuard>
      <AdminLayout title={title} subtitle={subtitle}>{children}</AdminLayout>
    </AdminGuard>
  );
}
