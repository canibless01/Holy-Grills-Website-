"use client";

import Analytics from "@/app/routes/admin/Analytics";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return <AdminPage title="Analytics" subtitle="Business insights"><Analytics /></AdminPage>;
}
