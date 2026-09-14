import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '@/types';

interface FavouritesState {
  items: MenuItem[];
  /** Add the item if not present, remove it if already saved */
  toggle: (item: MenuItem) => void;
  /** True when the given id is already in the favourites list */
  isFavourite: (id: string) => boolean;
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => ({
          items: state.items.some((i) => i.id === item.id)
            ? state.items.filter((i) => i.id !== item.id)
            : [...state.items, item],
        })),
      isFavourite: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'holy-grills-favourites' }
  )
);
