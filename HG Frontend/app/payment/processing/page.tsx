"use client";

import PaymentProcessingPage from "@/app/routes/public/PaymentProcessing";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Payment"><PaymentProcessingPage /></SiteLayout>;
}
