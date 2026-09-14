'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import NotificationPreferencesPage from '@/app/routes/public/NotificationPreferences';

export default function Page() {
  return <SiteLayout title="Notification Preferences"><NotificationPreferencesPage /></SiteLayout>;
}
