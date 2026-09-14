import { useState } from 'react';
import { Link, useNavigate } from '@/lib/router';
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from '@/components/ui/dialog';
import { ChevronRight, LogOut, Menu, User } from 'lucide-react';
import { useAuthStore, getInitials, safeImageUrl } from '@/stores/authStore';

const LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'My Orders', to: '/orders' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Referrals', to: '/referrals' },
  { label: 'Learn about HP', to: '/hp' },
  { label: 'Our Story 🔥', to: '/about' },
  { label: "Questions? We've Got You.", to: '/support' },
  { label: 'Your Trust — Terms & Privacy', to: '/trust' },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="relative rounded-full p-2 text-brand-brown/70 hover:bg-secondary md:hidden">
          <Menu size={20} />
        </button>
      </DialogTrigger>
      <DialogOverlay />
      <DialogContent className="bottom-0 left-auto right-0 top-0 w-full max-w-[300px] translate-x-0 translate-y-0 rounded-none border-l bg-[#FFFAEF] p-0 shadow-2xl data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full md:hidden">
        <div className="border-b border-border px-5 py-4">
          <p className="font-display font-bold text-foreground">Explore Holy Grills</p>
        </div>

        {isAuthenticated && user ? (
          <div className="border-b border-border px-5 pb-4">
            <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3">
              {safeImageUrl(user.photo_url) ? (
                <img
                  src={safeImageUrl(user.photo_url)!}
                  alt={user.full_name}
                  className="h-10 w-10 rounded-full border-2 border-primary object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-fire text-sm font-bold text-primary-foreground">
                  {getInitials(user.full_name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{user.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </Link>
          </div>
        ) : null}

        <nav className="space-y-2 p-5">
          {!isAuthenticated ? (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-primary"
            >
              <span className="flex items-center gap-2">
                <User size={16} /> Login
              </span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ) : null}

          {LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
            >
              {item.label}
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ))}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="inline-flex w-full items-center gap-2 px-3 py-2 text-md font-bold text-destructive"
            >
              <LogOut size={16} /> Logout
            </button>
          ) : null}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
