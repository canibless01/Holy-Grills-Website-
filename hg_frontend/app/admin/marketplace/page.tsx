'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Marketplace Ops" subtitle="Listing controls and release operations"><AdminModulePage title="Marketplace" description="Tune marketplace listing states, stock rollouts, and category operations with shared admin patterns." rows={ADMIN_MODULE_ROWS.marketplace} /></AdminPage>;
}
