import React, { useState } from 'react';
import {
  X, BarChart3, TrendingUp, Users, Package, Truck, Tag, Star,
  ToggleRight, SlidersHorizontal, Server, UtensilsCrossed, Layers, Lock,
  Calendar, Gift, ShoppingBag, ShoppingCart, Bell, Trophy, School, Store, GraduationCap, Flame, Target, Zap,
  ChevronRight, LayoutGrid, Sparkles,
} from 'lucide-react';

// Reorganized by subject — related sections grouped together.
// Menu items + Addons live under "Menu"; HP multipliers + Rewards + Free
// Credits + Exclusive Spin live under "HP & Rewards".
const GROUPS = [
  { label: null, items: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, desc: 'Overview' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, desc: 'Trends' },
  ]},
  { label: 'Menu', items: [
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed, desc: 'Food items' },
    { id: 'addons', label: 'Addons & Variations', icon: Layers, desc: 'Modifiers' },
  ]},
  { label: 'HP & Rewards', items: [
    { id: 'hp', label: 'HP & Multipliers', icon: Flame, desc: 'Earning rates' },
    { id: 'rewards', label: 'Rewards', icon: Gift, desc: 'Redemptions' },
    { id: 'freecredits', label: 'Free Credits', icon: Gift, desc: 'Side credits' },
    { id: 'exclusivespin', label: 'Exclusive Spin', icon: Zap, desc: 'Leaderboard spin' },
    { id: 'challenges', label: 'Challenges', icon: Target, desc: 'Milestones' },
  ]},
  { label: 'Commerce', items: [
    { id: 'orders', label: 'Orders', icon: Package, desc: 'All orders' },
    { id: 'events', label: 'Events', icon: Calendar, desc: 'Campus events' },
    { id: 'catering', label: 'Catering', icon: UtensilsCrossed, desc: 'Bulk requests' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, desc: 'Listings' },
    { id: 'promos', label: 'Promo Codes', icon: Tag, desc: 'Discounts' },
    { id: 'abandoned', label: 'Abandoned Carts', icon: ShoppingCart, desc: 'Recoveries' },
    { id: 'reviews', label: 'Reviews', icon: Star, desc: 'Ratings & testimonials' },
  ]},
  { label: 'People & Ops', items: [
    { id: 'users', label: 'Users', icon: Users, desc: 'Students & staff' },
    { id: 'delivery', label: 'Delivery', icon: Truck, desc: 'Zones & gates' },
    { id: 'orderlocks', label: 'Order Locks', icon: Lock, desc: 'Price locks' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Blasts' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, desc: 'Rankings & HoF' },
  ]},
  { label: 'Config', items: [
    { id: 'departments', label: 'Departments', icon: School, desc: 'Academic' },
    { id: 'storefront', label: 'Storefront', icon: Store, desc: 'Banners' },
    { id: 'onboarding', label: 'Onboarding', icon: GraduationCap, desc: 'Gifts' },
    { id: 'flags', label: 'Feature Flags', icon: ToggleRight, desc: 'Toggles' },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal, desc: 'System' },
    { id: 'system', label: 'System', icon: Server, desc: 'Cron & audit' },
  ]},
];

export default function AdminSidebar({ active, onSelect, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const [expandedGroup, setExpandedGroup] = useState(null);

  const handleGroupToggle = (label) => {
    setExpandedGroup((prev) => (prev === label ? null : label));
  };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />}

      <aside className={`fixed left-0 top-0 z-50 h-full bg-cocoa-900 text-cocoa-100 flex flex-col transition-all duration-300 ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'} ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 w-64'}`}>
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-cocoa-700 shrink-0">
          <div className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-2.5'}`}>
            <div className="w-9 h-9 rounded-xl flame-gradient flex items-center justify-center shrink-0 shadow-selected">
              <Flame className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="leading-none">
                <div className="font-heading font-extrabold text-sm text-white">Holy Grills</div>
                <div className="text-[9px] text-cocoa-400 uppercase tracking-wider">Admin Control</div>
              </div>
            )}
          </div>
          <button onClick={onCloseMobile} className="lg:hidden p-2 rounded-lg hover:bg-cocoa-800"><X className="w-5 h-5" /></button>
        </div>

        {/* Collapse toggle */}
        <button onClick={onToggleCollapse} className="hidden lg:flex items-center gap-2 px-4 py-3 text-xs font-bold text-cocoa-400 hover:bg-cocoa-800 transition-colors border-b border-cocoa-700">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 rotate-180" /> : <><ChevronRight className="w-3.5 h-3.5" /> Collapse</>}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
          {GROUPS.map((g, gi) => {
            const hasLabel = !!g.label;
            const isExpanded = expandedGroup === g.label || !hasLabel;
            const activeInGroup = g.items.some((s) => s.id === active);

            return (
              <div key={gi}>
                {!collapsed && hasLabel && (
                  <button
                    onClick={() => handleGroupToggle(g.label)}
                    className={`w-full flex items-center justify-between px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeInGroup ? 'text-flame-400' : 'text-cocoa-500 hover:text-cocoa-300'}`}
                  >
                    <span>{g.label}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                )}
                {collapsed && hasLabel && <div className="my-2 mx-3 border-t border-cocoa-800" />}

                {isExpanded && g.items.map((s) => {
                  const Icon = s.icon;
                  const isActive = active === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { onSelect(s.id); onCloseMobile(); }}
                      title={s.label}
                      className={`group w-full flex items-center gap-3 ${collapsed ? 'lg:justify-center lg:px-0' : 'px-4'} px-4 py-2.5 transition-all relative ${isActive ? 'bg-flame-600 text-white' : 'text-cocoa-300 hover:bg-cocoa-800 hover:text-white'}`}
                    >
                      {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r" />}
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'text-cocoa-400 group-hover:text-white'}`} />
                      {!collapsed && (
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-semibold leading-tight">{s.label}</div>
                          <div className={`text-[10px] ${isActive ? 'text-white/70' : 'text-cocoa-500'}`}>{s.desc}</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 py-3 border-t border-cocoa-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-flame-500" />
              <span className="text-[10px] text-cocoa-500">Holy Grills · Admin v2.5</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}