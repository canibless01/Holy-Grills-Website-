'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import MarketplaceDetailPage from '@/app/routes/public/MarketplaceDetail';

export default function Page() {
  return <SiteLayout title="Marketplace"><MarketplaceDetailPage /></SiteLayout>;
}
