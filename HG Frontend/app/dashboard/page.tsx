"use client";

import AccountDashboard from "@/app/routes/public/AccountDashboard";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Dashboard"><AccountDashboard /></SiteLayout>;
}
