'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Events Operations" subtitle="Event campaigns, approvals, and attendance"><AdminModulePage title="Events" description="Manage event publishing, ticket availability, and attendee operations from one module." rows={ADMIN_MODULE_ROWS.events} /></AdminPage>;
}
