import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMenuItemById, getMenuItems } from '@/services/api/menu.service';

export function useMenuItems() {
  return useQuery({
    queryKey: ['menu-items'],
    queryFn: getMenuItems,
    staleTime: 60_000,
  });
}

export function useMenuItem(menuId?: string) {
  const query = useQuery({
    queryKey: ['menu-item', menuId],
    queryFn: () => getMenuItemById(menuId || ''),
    enabled: Boolean(menuId),
    staleTime: 60_000,
  });

  const related = useMemo(() => {
    if (!query.data || !query.data.category) return [];
    return [];
  }, [query.data]);

  return { ...query, related };
}
