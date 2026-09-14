"use client";

import CartPage from "@/app/routes/public/Cart";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Your Cart"><CartPage /></SiteLayout>;
}
