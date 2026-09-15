import { useQuery } from '@tanstack/react-query';
import { Bell, Gift } from 'lucide-react';
import { Link } from '@/lib/router';
import { HPBadge } from '@/components/hp/HPBadge';
import { HPProgressBar } from '@/components/hp/HPProgressBar';
import { OrderCard } from '@/components/orders/OrderCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore, getInitials, safeImageUrl } from '@/stores/authStore';
import { DASHBOARD_SIDEBAR_LINKS } from '@/constants/navigation';
import { useAuthStreak } from '@/hooks/useAuthStreak';
import { getOrders } from '@/services/api/order.service';

const AccountDashboardPage = () => {
  const { user, hasHydrated } = useAuthStore();
  const { data: streakData } = useAuthStreak({
    enabled: hasHydrated && !!user,
  });
  const { data: allOrders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: hasHydrated && !!user,
  });

  if (!hasHydrated || !user) {
    return null;
  }

  const userOrders = allOrders.filter((order) => order.userId === user.id);
  const monthlyOrders = userOrders.length;
  const activeOrders = userOrders.filter((order) =>
    ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status),
  ).length;
  const referralWins = userOrders.filter((order) => order.hpEarned > 0).length;
  const initials = getInitials(user.full_name);
  const dashboardStats = [
    {
      label: 'Wallet Balance',
      value: `₦${user.wallet_balance?.toLocaleString() ?? '0'}`,
      helper: 'Available balance from GET /wallet/balance',
    },
    {
      label: 'Current HP',
      value: `${user.hp_balance} HP`,
      helper: user.hp_balance > 0 ? 'Trackable from your backend profile balance.' : 'Start ordering to earn your first HP',
    },
    {
      label: 'Weekly streak',
      value: `${streakData?.streakCount ?? 0} day${(streakData?.streakCount ?? 0) === 1 ? '' : 's'}`,
      helper: streakData?.canCheckinToday
        ? 'Daily check-in available! Check in to maintain streak.'
        : 'Streak is active. Keep checking in daily for bonus rewards.',
    },
    {
      label: 'Orders this month',
      value: `${monthlyOrders}`,
      helper: `${activeOrders} currently active`,
    },
  ];

  return (
    <main className="flex-1 pb-12 md:pt-24">
      <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[220px,1fr]">
        <aside className="hidden h-fit rounded-[2rem] border border-border bg-card p-4 lg:block">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">Dashboard</p>
          <nav className="mt-4 space-y-1">
            {DASHBOARD_SIDEBAR_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-2xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="space-y-8">
          <section className="rounded-[2rem] border border-border bg-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-fire">
                  {safeImageUrl(user.photo_url) ? (
                    <img
                      src={safeImageUrl(user.photo_url)!}
                      alt={user.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-primary-foreground">{initials}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">HP ecosystem hub</p>
                  <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
                    Welcome back, {user.full_name.split(' ')[0]}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Track your level, orders, referrals, and challenge progress from one dashboard.
                  </p>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                aria-label="Open notifications"
              >
                <Bell size={16} /> Notifications
              </button>
            </div>

            <div className="mt-6">
              <div className="rounded-[2rem] bg-secondary/60 p-5">
                <div className="flex items-center gap-3">
                  <HPBadge value={user.hp_balance} size="md" variant="available" />
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Holy Eater tier</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold text-foreground">{user.hp_balance} HP balance</h2>
                <p className="mt-2 text-sm text-muted-foreground">52 HP to reach Grill Master perks.</p>
                <div className="mt-4">
                  <HPProgressBar currentHP={user.hp_balance} label="Tier progress" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/rewards" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">View rewards preview <Gift size={14} /></Link>
                  <Link to="/leaderboard" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">Leaderboard</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-display text-xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.helper}</p>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <SectionHeader title="Recent orders" action={<Link to="/orders" className="text-sm font-semibold text-primary">See all orders</Link>} />
            {userOrders.length ? userOrders.map((order) => <OrderCard key={order.id} order={order} />) : (
              <EmptyState icon={Gift} title="No orders yet" description="Start an order to see your HP progress and delivery history here." ctaLabel="Browse menu" ctaTo="/menu" />
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default AccountDashboardPage;
