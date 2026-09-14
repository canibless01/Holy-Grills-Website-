"use client";

import Payments from "@/app/routes/admin/Payments";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return <AdminPage title="Payments" subtitle="Transactions & payouts"><Payments /></AdminPage>;
}
