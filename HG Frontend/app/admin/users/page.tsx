"use client";

import Users from "@/app/routes/admin/Users";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return <AdminPage title="Users" subtitle="Customer profiles & HP"><Users /></AdminPage>;
}
