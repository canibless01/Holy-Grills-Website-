import { Link, useLocation, useNavigate } from '@/lib/router';
import { Building2, LogOut, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore, selectItemCount } from '@/stores/cartStore';
import { useAuthStore, getInitials, safeImageUrl } from '@/stores/authStore';
import { DESKTOP_NAV_LINKS } from '@/constants/navigation';
import { useCampus } from '@/context/CampusContext';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = useCartStore(selectItemCount);
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const { selectedCampus, setIsSelectorOpen } = useCampus();

  if (!hasHydrated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 hidden border-b border-border bg-background/85 backdrop-blur-xl md:block">
      <div className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Holy Grills" className="h-9 w-auto" />
        </Link>

        <div className="flex items-center gap-5">
          {DESKTOP_NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold transition-colors ${
                location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)
                  ? 'text-primary'
                  : 'text-brand-brown/70 hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Campus Selector Trigger */}
          <button
            onClick={() => setIsSelectorOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <Building2 size={14} className="text-primary" />
            <span className="max-w-[120px] truncate">{selectedCampus.code.toUpperCase()}</span>
          </button>

          <Link
            to="/cart"
            className="relative rounded-full p-2 text-brand-brown/70 transition-colors hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 ? (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {itemCount}
              </motion.span>
            ) : null}
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1.5 text-primary transition-colors hover:bg-primary/20"
                aria-label="Profile"
              >
                {safeImageUrl(user.photo_url) ? (
                  <img
                    src={safeImageUrl(user.photo_url)!}
                    alt={user.full_name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-fire text-xs font-bold text-primary-foreground">
                    {getInitials(user.full_name)}
                  </span>
                )}
                <span className="hidden text-sm font-semibold text-foreground lg:block">
                  {user.full_name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-brand-brown/70 transition-colors hover:text-destructive"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-full bg-gradient-cta px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-opacity hover:opacity-95"
            >
              <User size={16} />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
