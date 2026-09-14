"use client";

import FavouritesPage from "@/app/routes/public/FavouritesPage";
import { SiteLayout } from "@/app/layouts/SiteLayout";

export default function Page() {
  return <SiteLayout title="Favourites"><FavouritesPage /></SiteLayout>;
}
