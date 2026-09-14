"use client";

import OrdersPage from "@/app/routes/public/OrdersPage";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Orders"><OrdersPage /></SiteLayout>;
}
