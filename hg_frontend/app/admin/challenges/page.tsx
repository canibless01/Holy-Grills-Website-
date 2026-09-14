'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Challenge Engine" subtitle="Launch repeatable growth challenges"><AdminModulePage title="Challenge Engine" description="Configure challenge windows, goals, and HP rewards with reusable forms and tables." rows={ADMIN_MODULE_ROWS.challenges} /></AdminPage>;
}
