'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Operating Hours Manager" subtitle="Store status and closure timing"><AdminModulePage title="Operating Hours Manager" description="Use this module to control the homepage status strip and closed-store modal states." rows={ADMIN_MODULE_ROWS['operating-hours']} /></AdminPage>;
}
