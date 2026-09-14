"use client";

import Support from "@/app/routes/admin/Support";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return <AdminPage title="Support" subtitle="Tickets & responses"><Support /></AdminPage>;
}
