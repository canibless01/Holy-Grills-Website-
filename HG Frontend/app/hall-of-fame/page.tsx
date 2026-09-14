'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import HallOfFamePage from '@/app/routes/public/HallOfFame';

export default function Page() {
  return <SiteLayout title="Hall of Fame"><HallOfFamePage /></SiteLayout>;
}
