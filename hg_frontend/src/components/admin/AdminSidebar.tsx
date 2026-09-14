import { Link, useLocation } from '@/lib/router';
import { Bell, ChevronLeft, ChevronRight, Clock3, Flame, Gift, LayoutDashboard, ListRestart, LogOut, Medal, ShoppingBag, Truck, Users2, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/delivery-windows', label: 'Delivery Windows', icon: Clock3 },
      { to: '/admin/operating-hours', label: 'Operating Hours', icon: Clock3 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/kitchen', label: 'Kitchen Dashboard', icon: UtensilsCrossed },
      { to: '/admin/riders', label: 'Rider Management', icon: Truck },
      { to: '/admin/events', label: 'Events', icon: Medal },
      { to: '/admin/marketplace', label: 'Marketplace', icon: ShoppingBag },
      { to: '/admin/abandoned-carts', label: 'Abandoned Carts', icon: ShoppingBag },
      { to: '/admin/notifications', label: 'Notification Centre', icon: Bell },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/admin/hp', label: 'HP Manager', icon: Flame },
      { to: '/admin/rewards', label: 'Rewards Manager', icon: Gift },
      { to: '/admin/challenges', label: 'Challenge Engine', icon: Medal },
      { to: '/admin/leaderboard-controls', label: 'Leaderboard Controls', icon: Medal },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <aside className={`fixed bottom-0 left-0 top-0 z-40 flex flex-col border-r border-border bg-card transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-16 items-center border-b border-border px-4 shrink-0">
        <Link to="/admin" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-fire">
            <Flame size={18} className="text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed ? (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <span className="block whitespace-nowrap font-display text-sm font-bold text-foreground">
                  Holy Grills
                </span>
                <span className="block whitespace-nowrap text-[9px] text-muted-foreground">
                  Ops Console
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            <AnimatePresence>{!collapsed ? <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/70">{section.label}</motion.p> : null}</AnimatePresence>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link key={item.to} to={item.to} title={collapsed ? item.label : undefined} className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'} ${collapsed ? 'justify-center' : ''}`}>
                    <item.icon size={16} className="shrink-0" />
                    <AnimatePresence>{!collapsed ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">{item.label}</motion.span> : null}</AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border p-2">
        <Link to="/" className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${collapsed ? 'justify-center' : ''}`} title={collapsed ? 'Back to store' : undefined}>
          <LogOut size={16} className="shrink-0" />
          {!collapsed ? <span>Back to store</span> : null}
        </Link>
        <button onClick={() => setCollapsed((value) => !value)} className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${collapsed ? 'justify-center' : ''}`}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
}
