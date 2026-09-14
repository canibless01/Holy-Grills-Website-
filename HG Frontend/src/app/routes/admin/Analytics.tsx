import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/data/menu';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Flame, Clock, Star, Repeat } from 'lucide-react';
import { getAdminAnalyticsSnapshot } from '@/services/api/admin.service';

const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: getAdminAnalyticsSnapshot,
  });
  const orders = data?.orders ?? [];
  const menuItems = data?.menuItems ?? [];
  const users = data?.users ?? [];
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  // Category breakdown
  const categoryData = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = { count: 0, revenue: 0 };
    acc[item.category].count++;
    acc[item.category].revenue += item.price * 3; // mock multiplier
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const maxRevenue = Math.max(...Object.values(categoryData).map((d) => d.revenue));

  // Hourly orders (mock)
  const hourlyData = [
    { hour: '8am', orders: 2 }, { hour: '9am', orders: 5 }, { hour: '10am', orders: 8 },
    { hour: '11am', orders: 14 }, { hour: '12pm', orders: 22 }, { hour: '1pm', orders: 18 },
    { hour: '2pm', orders: 12 }, { hour: '3pm', orders: 9 }, { hour: '4pm', orders: 11 },
    { hour: '5pm', orders: 16 }, { hour: '6pm', orders: 24 }, { hour: '7pm', orders: 20 },
    { hour: '8pm', orders: 15 }, { hour: '9pm', orders: 7 }, { hour: '10pm', orders: 3 },
  ];
  const maxHourly = Math.max(...hourlyData.map((d) => d.orders));

  // Weekly trend (mock)
  const weeklyData = [
    { day: 'Mon', revenue: 42000 }, { day: 'Tue', revenue: 38500 },
    { day: 'Wed', revenue: 51200 }, { day: 'Thu', revenue: 47800 },
    { day: 'Fri', revenue: 68400 }, { day: 'Sat', revenue: 72100 },
    { day: 'Sun', revenue: 55300 },
  ];
  const maxWeekly = Math.max(...weeklyData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      {isLoading ? <p className="text-sm text-muted-foreground">Loading analytics snapshot…</p> : null}
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Revenue (7d)', value: formatPrice(375300), change: '+18.2%', up: true, icon: DollarSign },
          { label: 'Orders (7d)', value: '89', change: '+12%', up: true, icon: ShoppingBag },
          { label: 'Avg Order Value', value: formatPrice(Math.round(avgOrderValue)), change: '+5.3%', up: true, icon: TrendingUp },
          { label: 'Repeat Rate', value: '64%', change: '-2.1%', up: false, icon: Repeat },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon size={14} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="font-display font-bold text-foreground text-xl">{kpi.value}</p>
            <span className={`text-[10px] font-body font-medium ${kpi.up ? 'text-success' : 'text-destructive'}`}>
              {kpi.change}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Weekly revenue chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">Weekly Revenue</h3>
          <div className="flex items-end gap-3 h-40">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-muted-foreground font-body">{formatPrice(d.revenue)}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.revenue / maxWeekly) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="w-full rounded-t-md bg-gradient-fire min-h-[4px]"
                />
                <span className="text-[10px] text-muted-foreground font-body">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly orders chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">Orders by Hour (Today)</h3>
          <div className="flex items-end gap-1.5 h-40">
            {hourlyData.map((d, i) => (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[8px] text-muted-foreground font-body">{d.orders}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.orders / maxHourly) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                  className="w-full rounded-t-sm bg-primary/80 min-h-[2px]"
                />
                <span className="text-[8px] text-muted-foreground font-body rotate-[-45deg] origin-top-left whitespace-nowrap">{d.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Category breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">Revenue by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryData).map(([cat, data]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs font-body mb-1">
                  <span className="text-foreground font-medium">{cat}</span>
                  <span className="text-muted-foreground">{formatPrice(data.revenue)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-fire"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top customers */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">Top Customers</h3>
          <div className="space-y-3">
            {[...users].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5).map((user, i) => (
              <div key={user.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold font-body ${
                  i === 0 ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-body font-medium truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{user.ordersCount} orders</p>
                </div>
                <span className="text-xs text-foreground font-body font-semibold">{formatPrice(user.totalSpent)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Avg Delivery Time', value: '22 min', icon: Clock, color: 'text-primary' },
              { label: 'Customer Satisfaction', value: '4.8/5', icon: Star, color: 'text-accent' },
              { label: 'Order Completion', value: '96.4%', icon: TrendingUp, color: 'text-success' },
              { label: 'Active Users (24h)', value: '47', icon: Users, color: 'text-primary' },
              { label: 'HP Redeemed', value: '1,240 HP', icon: Flame, color: 'text-accent' },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center ${metric.color}`}>
                  <metric.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground font-body">{metric.label}</p>
                </div>
                <span className="font-display font-bold text-foreground text-sm">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">HP issued vs redeemed</h3>
          <div className="space-y-3">
            {[
              { label: 'Issued', value: 1840, color: 'bg-primary' },
              { label: 'Redeemed', value: 1260, color: 'bg-accent' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{item.label}</span>
                  <span>{item.value} HP</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / 2000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">Tier distribution breakdown</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              'Rookie — 38%',
              'Hungry — 34%',
              'Holy Eater — 21%',
              'Grill Master — 7%',
            ].map((row) => <div key={row} className="rounded-lg bg-secondary/60 px-3 py-2">{row}</div>)}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">Referral funnel</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              'Invites sent — 420',
              'Invites opened — 279',
              'Signups completed — 114',
              'First orders — 67',
            ].map((row) => <div key={row} className="rounded-lg bg-secondary/60 px-3 py-2">{row}</div>)}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-foreground text-sm mb-4">Challenge completion rate</h3>
          <div className="rounded-2xl bg-secondary/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current rate</p>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">62%</p>
            <p className="mt-1 text-sm text-muted-foreground">+8% vs last cycle</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
