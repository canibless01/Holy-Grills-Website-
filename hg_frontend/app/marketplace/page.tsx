'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import MarketplacePage from '@/app/routes/public/Marketplace';

export default function Page() {
  return <SiteLayout title="Marketplace"><MarketplacePage /></SiteLayout>;
}
