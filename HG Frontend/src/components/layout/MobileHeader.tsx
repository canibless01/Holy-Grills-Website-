import { Link, useLocation } from '@/lib/router';
import { Bell } from 'lucide-react';
import { MobileSidebar } from './MobileSidebar';

interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const location = useLocation();
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/kitchen')) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Holy Grills" className="h-8 w-auto" />
          </Link>
          {title ? <p className="max-w-[110px] truncate text-sm font-semibold text-foreground">{title}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button className="relative rounded-full p-2 text-brand-brown/70 hover:bg-secondary" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <MobileSidebar />
        </div>
      </div>
    </header>
  );
}
