import { Link, useLocation, useNavigate } from '@/lib/router';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore, selectItemCount } from '@/stores/cartStore';
import { useAuthStore, getInitials, safeImageUrl } from '@/stores/authStore';
import { DESKTOP_NAV_LINKS } from '@/constants/navigation';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = useCartStore(selectItemCount);
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 hidden border-b border-border bg-background/90 backdrop-blur-xl md:block">
      <div className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
        {/* Left: Logo placeholder */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Holy Grills" className="h-9 w-auto" />
        </Link>

        {/* Center: Horizontal row of text links */}
        <div className="flex items-center gap-6">
          {DESKTOP_NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold transition-colors ${
                location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(`${link.to}`))
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Horizontal row of three icons (cart with badge, circular avatar, logout arrow) */}
        <div className="flex items-center gap-3">
          {/* Icon 1: Cart with badge */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {itemCount > 0 ? (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {itemCount}
              </motion.span>
            ) : null}
          </Link>

          {/* Icon 2: Circular user avatar */}
          {isAuthenticated && user ? (
            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary overflow-hidden transition-transform hover:scale-105"
              aria-label="Account"
            >
              {safeImageUrl(user.photo_url) ? (
                <img
                  src={safeImageUrl(user.photo_url)!}
                  alt={user.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-xs font-bold text-primary">
                  {getInitials(user.full_name)}
                </span>
              )}
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
              aria-label="Login"
            >
              <User size={18} />
            </Link>
          )}

          {/* Icon 3: Logout arrow */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
