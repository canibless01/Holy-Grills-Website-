import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, LayoutDashboard, ClipboardList, Award } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/menu', label: 'Menu', icon: Menu },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/rewards', label: 'Rewards', icon: Award },
];

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cocoa-200 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="w-full max-w-6xl mx-auto px-2 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative ${
                isActive ? 'text-flame-600' : 'text-cocoa-400'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-b-full flame-gradient" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-semibold ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}