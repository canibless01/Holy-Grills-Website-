'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import WalletPage from '@/app/routes/public/Wallet';

export default function Page() {
  return <SiteLayout title="Wallet"><WalletPage /></SiteLayout>;
}
