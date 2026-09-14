'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Abandoned Cart Recovery" subtitle="Recover intent with timely reminders"><AdminModulePage title="Abandoned Cart Recovery" description="Track recovery automations, reminder timing, and offer rules for unfinished checkouts." rows={ADMIN_MODULE_ROWS['abandoned-carts']} /></AdminPage>;
}
