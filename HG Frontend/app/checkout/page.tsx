"use client";

import CheckoutPage from "@/app/routes/public/Checkout";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Checkout"><CheckoutPage /></SiteLayout>;
}
