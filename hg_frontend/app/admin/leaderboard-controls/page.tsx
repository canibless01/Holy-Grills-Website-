'use client';

import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';

export default function Page() {
  return <AdminPage title="Leaderboard Controls" subtitle="Tune rankings and prize logic"><AdminModulePage title="Leaderboard Controls" description="Weekly resets, prize pools, and current-user highlighting are managed here." rows={ADMIN_MODULE_ROWS['leaderboard-controls']} /></AdminPage>;
}
