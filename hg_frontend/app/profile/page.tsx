"use client";

import UserProfilePage from "@/app/routes/public/UserProfile";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Edit Profile"><UserProfilePage /></SiteLayout>;
}
