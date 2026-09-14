"use client";

import Menu from "@/app/routes/admin/Menu";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return <AdminPage title="Menu" subtitle="Menu management"><Menu /></AdminPage>;
}
