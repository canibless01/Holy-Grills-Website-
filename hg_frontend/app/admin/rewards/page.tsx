'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return (
    <AdminPage title="Rewards Management" subtitle="Add, remove, and tune HP reward values">
      <AdminModulePage
        title="Rewards Management"
        description="Manage reward inventory and edit HP allocations without touching code."
        rows={ADMIN_MODULE_ROWS.rewards}
      />
    </AdminPage>
  );
}
