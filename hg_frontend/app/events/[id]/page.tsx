'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import EventDetailPage from '@/app/routes/public/EventDetail';

export default function Page() {
  return <SiteLayout title="Event"><EventDetailPage /></SiteLayout>;
}
