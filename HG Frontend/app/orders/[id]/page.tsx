"use client";

import OrderTrackingPage from "@/app/routes/public/OrderTracking";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Order Tracking"><OrderTrackingPage /></SiteLayout>;
}
