'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import FAQPage from '@/app/routes/public/FAQ';

export default function Page() {
  return <SiteLayout title="FAQ"><FAQPage /></SiteLayout>;
}
