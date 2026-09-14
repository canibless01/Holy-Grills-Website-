'use client';

import SignupPage from '@/app/routes/public/Signup';
import { SiteLayout } from '@/app/layouts/SiteLayout';

export default function Page() {
  return <SiteLayout title="Create Account" hideChrome><SignupPage /></SiteLayout>;
}
