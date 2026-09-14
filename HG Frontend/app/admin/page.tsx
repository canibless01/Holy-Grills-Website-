"use client";

import Dashboard from "@/app/routes/admin/Dashboard";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return <AdminPage title="Overview" subtitle="Performance & insights"><Dashboard /></AdminPage>;
}
