'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import NotificationsPage from '@/app/routes/public/Notifications';

export default function Page() {
  return <SiteLayout title="Notifications"><NotificationsPage /></SiteLayout>;
}
