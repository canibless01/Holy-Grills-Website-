'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return (
    <AdminPage title="Delivery Window Manager" subtitle="Control delivery slots and campus availability">
      <AdminModulePage title="Delivery Window Manager" description="Manage window definitions, slot availability, and prep cutoffs without duplicating table or filter logic." rows={ADMIN_MODULE_ROWS['delivery-windows']} />
    </AdminPage>
  );
}
