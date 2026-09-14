'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Notification Centre" subtitle="Campaigns, transactional alerts, and lifecycle nudges"><AdminModulePage title="Notification Centre" description="Prepare push, SMS, and in-app notification flows with reusable table and modal patterns." rows={ADMIN_MODULE_ROWS.notifications} /></AdminPage>;
}
