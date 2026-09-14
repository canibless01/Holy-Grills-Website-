'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Rider" subtitle="Rider delivery workspace"><AdminModulePage title="Rider workspace" description="Track rider batches, delivery completion, and route assignments from this operations view." rows={ADMIN_MODULE_ROWS.riders} /></AdminPage>;
}
