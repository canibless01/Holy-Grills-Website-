import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/admin/StatCard';
import { OrderCard } from '@/components/orders/OrderCard';
import { formatPrice } from '@/data/menu';
import { DollarSign, ShoppingBag, Users, Flame, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrders } from '@/services/api/order.service';

const AdminDashboard = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getOrders,
  });
  const recentOrders = orders.slice(0, 4);
  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalHP = orders.reduce((sum, o) => sum + o.hpEarned, 0);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={formatPrice(totalRevenue)} change="+12.5%" changeType="positive" icon={DollarSign} />
        <StatCard title="Total Orders" value={totalOrders.toString()} change="+8 today" changeType="positive" icon={ShoppingBag} />
        <StatCard title="Active Customers" value={new Set(orders.map((order) => order.userId)).size.toString()} change="+23%" changeType="positive" icon={Users} iconColor="text-accent" />
        <StatCard title="HP Distributed" value={`${totalHP} HP`} change="+209 today" changeType="neutral" icon={Flame} iconColor="text-accent" />
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Refreshing dashboard metrics…</p> : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active orders */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-foreground text-base">Active Orders</h2>
            <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
              <Clock size={12} /> Live
              <span className="w-2 h-2 rounded-full bg-success animate-pulse ml-1" />
            </span>
          </div>
          <div className="space-y-3">
            {activeOrders.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground font-body">No active orders</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} showCustomer />
              ))
            )}
          </div>
        </div>

        {/* Quick stats sidebar */}
        <div className="space-y-4">
          {/* Revenue chart placeholder */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-bold text-foreground text-sm mb-4">Today's Revenue</h3>
            <div className="space-y-3">
              {['Morning', 'Afternoon', 'Evening'].map((period, i) => {
                const values = [12400, 28600, 18200];
                const pct = [30, 70, 45];
                return (
                  <div key={period}>
                    <div className="flex justify-between text-xs font-body mb-1">
                      <span className="text-muted-foreground">{period}</span>
                      <span className="text-foreground font-medium">{formatPrice(values[i])}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct[i]}%` }}
                        transition={{ duration: 0.8, delay: i * 0.15 }}
                        className="h-full rounded-full bg-gradient-fire"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top items */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-bold text-foreground text-sm mb-4">Top Items Today</h3>
            <div className="space-y-3">
              {[
                { name: 'Holy Smash Burger', qty: 24, revenue: 84000 },
                { name: 'Suya Grill Platter', qty: 18, revenue: 81000 },
                { name: 'Holy Combo', qty: 15, revenue: 82500 },
                { name: 'Flame Chicken Wings', qty: 12, revenue: 33600 },
              ].map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground font-body">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-body font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{item.qty} sold</p>
                  </div>
                  <span className="text-xs text-foreground font-body font-semibold">{formatPrice(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Performance</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Avg. Order', value: formatPrice(8400) },
                { label: 'Avg. Delivery', value: '22 min' },
                { label: 'Completion', value: '96.4%' },
                { label: 'Satisfaction', value: '4.8★' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="font-display font-bold text-foreground text-sm">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
