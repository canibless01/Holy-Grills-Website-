"use client";

import LoginPage from "@/app/routes/public/Login";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Login" hideChrome><LoginPage /></SiteLayout>;
}
