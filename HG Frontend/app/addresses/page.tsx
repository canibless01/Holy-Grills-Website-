'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import AddressesPage from '@/app/routes/public/Addresses';

export default function Page() {
  return <SiteLayout title="Addresses"><AddressesPage /></SiteLayout>;
}
