'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import PaymentSuccessPage from '@/app/routes/public/PaymentSuccess';

export default function Page() {
  return <SiteLayout title="Order Confirmation"><PaymentSuccessPage /></SiteLayout>;
}
