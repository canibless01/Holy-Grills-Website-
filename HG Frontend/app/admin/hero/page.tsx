"use client";

import AdminHeroContent from "@/app/routes/admin/HeroContent";
import { AdminPage } from "@/app/layouts/AdminPage";

export default function Page() {
  return (
    <AdminPage title="Hero Content" subtitle="Manage carousel slides shown on the homepage">
      <AdminHeroContent />
    </AdminPage>
  );
}
