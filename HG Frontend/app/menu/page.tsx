import MenuPage from '@/app/routes/public/Menu';
import { SiteLayout } from '@/app/layouts/SiteLayout';
import { getMenuItems } from '@/services/api/menu.service';

export default async function Page() {
  const initialMenu = await getMenuItems();

  return (
    <SiteLayout title="Menu">
      <MenuPage initialMenu={initialMenu} />
    </SiteLayout>
  );
}
