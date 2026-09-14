'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Rider Management" subtitle="Dispatch, shift, and delivery operations"><AdminModulePage title="Rider Management" description="Reusable rider lists, shift filters, and assignment controls live in this module shell." rows={ADMIN_MODULE_ROWS.riders} /></AdminPage>;
}
