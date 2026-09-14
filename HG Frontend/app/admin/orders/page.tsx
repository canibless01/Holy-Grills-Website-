"use client";

import Orders from "@/app/routes/admin/Orders";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return <AdminPage title="Orders" subtitle="Manage live orders"><Orders /></AdminPage>;
}
