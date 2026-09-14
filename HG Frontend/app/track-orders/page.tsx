'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import OrdersPage from '@/app/routes/public/OrdersPage';

export default function Page() {
  return <SiteLayout title="Track Orders"><OrdersPage /></SiteLayout>;
}
