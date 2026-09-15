import { useState } from 'react';
import { Link, useLocation, useNavigate } from '@/lib/router';
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from '@/components/ui/dialog';
import {
  Home,
  User,
  Wallet,
  Sparkles,
  PhoneCall,
  HelpCircle,
  LogOut,
  Menu,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { useAuthStore, getInitials, safeImageUrl } from '@/stores/authStore';

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Account', to: '/dashboard', icon: User },
  { label: 'Wallet', to: '/wallet', icon: Wallet },
  { label: 'Cashback', to: '/rewards', icon: Sparkles },
  { label: 'Contact Us', to: '/support', icon: PhoneCall },
  { label: 'Help', to: '/faq', icon: HelpCircle },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="relative rounded-full p-2 text-foreground hover:bg-secondary md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
      </DialogTrigger>
      <DialogOverlay />
      <DialogContent className="bottom-0 left-0 top-0 w-4/5 max-w-[320px] translate-x-0 translate-y-0 rounded-none border-r border-border bg-background p-0 shadow-2xl data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full md:hidden">
        {/* Top Profile Area */}
        <div className="relative bg-primary px-6 pb-6 pt-8 text-primary-foreground">
          {/* Top right corner badge */}
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-md text-[11px] font-bold text-white">
            <ShieldCheck size={14} /> Verified
          </div>

          <div className="flex flex-col items-start space-y-3">
            {/* Circular avatar with border */}
            {isAuthenticated && user && safeImageUrl(user.photo_url) ? (
              <img
                src={safeImageUrl(user.photo_url)!}
                alt={user.full_name}
                className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/20 font-display text-xl font-bold text-white shadow-md">
                {isAuthenticated && user ? getInitials(user.full_name) : 'HG'}
              </div>
            )}

            <div>
              <h2 className="font-display text-lg font-bold text-white leading-tight">
                {isAuthenticated && user ? user.full_name : 'Welcome to Holy Grills'}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {isAuthenticated && user ? user.email : 'Order fresh & delicious campus meals'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 p-4">
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <IconComponent
                  size={20}
                  className={isActive ? 'text-primary' : 'text-muted-foreground'}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
