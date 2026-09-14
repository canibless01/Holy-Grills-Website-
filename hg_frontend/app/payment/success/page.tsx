"use client";

import PaymentSuccessPage from "@/app/routes/public/PaymentSuccess";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Payment"><PaymentSuccessPage /></SiteLayout>;
}
