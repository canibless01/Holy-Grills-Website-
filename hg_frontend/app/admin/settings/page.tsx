"use client";

import Settings from "@/app/routes/admin/Settings";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return <AdminPage title="Settings" subtitle="Configure your store"><Settings /></AdminPage>;
}
