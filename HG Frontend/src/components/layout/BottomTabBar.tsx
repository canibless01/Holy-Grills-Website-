import { NavLink, useLocation } from '@/lib/router';
import { motion } from 'framer-motion';
import { House, LayoutDashboard, ShoppingCart, UtensilsCrossed, ClipboardList } from 'lucide-react';
import { useCartStore, selectItemCount } from '@/stores/cartStore';
import { MOBILE_TAB_LINKS } from '@/constants/navigation';

const ICONS = {
  home: House,
  menu: UtensilsCrossed,
  dashboard: LayoutDashboard,
  orders: ClipboardList,
  cart: ShoppingCart,
};

export function BottomTabBar() {
  const location = useLocation();
  const cartCount = useCartStore(selectItemCount);

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/kitchen')) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 pb-safe md:hidden">
      <div className="pointer-events-auto px-3 pb-3">
        <nav className="mx-auto max-w-md rounded-3xl border border-border bg-card/95 shadow-tab backdrop-blur-xl" aria-label="Primary">
          <ul className="grid grid-cols-5 px-2 py-2">
            {MOBILE_TAB_LINKS.map(({ to, label, icon }) => {
              const Icon = ICONS[icon];
              return (
                <li key={to} className="flex">
                  <NavLink to={to} end={to === '/'} className="flex-1">
                    {({ isActive }) => (
                      <div className="relative flex flex-col items-center justify-center gap-1 px-1 py-1.5">
                        {isActive && (
                          <motion.div
                            layoutId="tab-pill"
                            className="absolute inset-0 rounded-2xl bg-primary/10"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}
                        <div className="relative">
                          <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-primary' : 'text-brand-brown/60'}`} strokeWidth={isActive ? 2.6 : 2.2} />
                          {icon === 'cart' && cartCount > 0 ? (
                            <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                              {cartCount}
                            </span>
                          ) : null}
                        </div>
                        <span className={`relative text-[10px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-brand-brown/70'}`}>
                          {label}
                        </span>
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
