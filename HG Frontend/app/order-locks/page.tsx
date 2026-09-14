'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import OrderLocksPage from '@/app/routes/public/OrderLocks';

export default function Page() {
  return <SiteLayout title="Order Locks"><OrderLocksPage /></SiteLayout>;
}
