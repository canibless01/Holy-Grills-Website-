"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuBrowseCard } from '@/components/menu/MenuBrowseCard';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { SearchBar } from '@/components/menu/SearchBar';
import { FoodCardSkeleton } from '@/components/menu/FoodCardSkeleton';
import { KitchenCountdownCard } from '@/components/shared/KitchenCountdownCard';
import { getMenuItems } from '@/services/api/menu.service';
import type { MenuItem } from '@/types';

const MenuPage = ({ initialMenu }: { initialMenu: MenuItem[] }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data: menuItems = initialMenu, isFetching, isError } = useQuery({
    queryKey: ['menu-items'],
    queryFn: getMenuItems,
    initialData: initialMenu,
  });

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(menuItems.map((item) => item.category)))],
    [menuItems]
  );

  const filtered = useMemo(
    () => menuItems.filter((item) => {
      const matchCategory = category === 'All' || item.category === category;
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    }),
    [category, menuItems, search]
  );

  return (
    <main className="flex-1 md:pt-16">
      <div className="sticky top-14 z-30 border-b border-border bg-background/85 backdrop-blur-xl md:top-16">
        <div className="container mx-auto space-y-3 px-4 py-4">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryTabs categories={categories} activeCategory={category} onChange={setCategory} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <KitchenCountdownCard className="px-0 pb-6" showOrderHint ctaLabel="Build your plate" />
        {isError ? <p className="mb-4 text-sm text-destructive">Unable to refresh the latest menu right now. Showing the server-rendered menu instead.</p> : null}
        {isFetching && !menuItems.length ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary">Firing up the menu… 🔥</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <FoodCardSkeleton key={index} />)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center text-sm text-muted-foreground">
            Nothing matched “{search || category}”. Try another flavour lane.
          </div>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <MenuBrowseCard
                  key={item.id}
                  item={item}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default MenuPage;
