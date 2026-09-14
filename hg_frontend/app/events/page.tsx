'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import EventsPage from '@/app/routes/public/Events';

export default function Page() {
  return <SiteLayout title="Events"><EventsPage /></SiteLayout>;
}
