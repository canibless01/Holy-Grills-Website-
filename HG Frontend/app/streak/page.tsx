'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import StreakPage from '@/app/routes/public/Streak';

export default function Page() {
  return <SiteLayout title="Streak"><StreakPage /></SiteLayout>;
}
