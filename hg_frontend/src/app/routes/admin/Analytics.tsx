import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/data/menu';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingBag, Users, Flame, Clock, Star, Repeat, PieChart, ShieldAlert } from 'lucide-react';
import { getAdminAnalyticsSnapshot, getEconomicsOverview, getEconomicsRedemptionAnalytics, getEconomicsTierBreakdown } from '@/services/api/admin.service';

const AdminAnalytics = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: getAdminAnalyticsSnapshot,
  });

  const { data: econOverview } = useQuery({
    queryKey: ['economics-overview', fromDate, toDate],
    queryFn: () => getEconomicsOverview({ from_date: fromDate, to_date: toDate }),
  });

  const { data: econTiers = [] } = useQuery({
    queryKey: ['economics-tiers'],
    queryFn: () => getEconomicsTierBreakdown(),
  });

  const { data: econRedemptions } = useQuery({
    queryKey: ['economics-redemptions'],
    queryFn: () => getEconomicsRedemptionAnalytics(),
  });

  const orders = data?.orders ?? [];
  const menuItems = data?.menuItems ?? [];
  const users = data?.users ?? [];
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const categoryData = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = { count: 0, revenue: 0 };
    acc[item.category].count++;
    acc[item.category].revenue += item.price * 3;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const maxRevenue = Math.max(...Object.values(categoryData).map((d) => d.revenue), 1);

  const hourlyData = [
    { hour: '8am', orders: 2 }, { hour: '9am', orders: 5 }, { hour: '10am', orders: 8 },
    { hour: '11am', orders: 14 }, { hour: '12pm', orders: 22 }, { hour: '1pm', orders: 18 },
    { hour: '2pm', orders: 12 }, { hour: '3pm', orders: 9 }, { hour: '4pm', orders: 11 },
    { hour: '5pm', orders: 16 }, { hour: '6pm', orders: 24 }, { hour: '7pm', orders: 20 },
    { hour: '8pm', orders: 15 }, { hour: '9pm', orders: 7 }, { hour: '10pm', orders: 3 },
  ];
  const maxHourly = Math.max(...hourlyData.map((d) => d.orders));

  const weeklyData = [
    { day: 'Mon', revenue: 42000 }, { day: 'Tue', revenue: 38500 },
    { day: 'Wed', revenue: 51200 }, { day: 'Thu', revenue: 47800 },
    { day: 'Fri', revenue: 68400 }, { day: 'Sat', revenue: 72100 },
    { day: 'Sun', revenue: 55300 },
  ];
  const maxWeekly = Math.max(...weeklyData.map((d) => d.revenue));

  const efficiency = econOverview?.programme_efficiency ?? 0.3378;
  const efficiencyColor = efficiency <= 0.8 ? 'text-success bg-success/10 border-success/30' : efficiency <= 1.0 ? 'text-accent bg-accent/10 border-accent/30' : 'text-destructive bg-destructive/10 border-destructive/30';

  return (
    <div className="space-y-8">
      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <div>
          <h3 className="font-display font-bold text-foreground text-base">Analytics & Economics Reporting</h3>
          <p className="text-xs text-muted-foreground">Select date range to filter financial & HP ecosystem metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground focus:outline-none"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* HP Economics Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Flame className="text-accent" size={20} />
          <h2 className="font-display font-bold text-xl text-foreground">1. Programme Overview & Liability</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[
            { label: 'Food Revenue', val: formatPrice(econOverview?.food_revenue ?? 150000) },
            { label: 'HP Issued', val: (econOverview?.hp_issued ?? 12000).toLocaleString() },
            { label: 'Pending HP', val: (econOverview?.pending_hp ?? 3000).toLocaleString() },
            { label: 'Active HP', val: (econOverview?.active_hp ?? 9000).toLocaleString() },
            { label: 'HP Redeemed', val: (econOverview?.hp_redeemed ?? 4000).toLocaleString() },
            { label: 'HP Outstanding', val: (econOverview?.hp_outstanding ?? 12000).toLocaleString() },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl border border-border bg-card p-3">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">{tile.label}</p>
              <p className="mt-1 font-display font-bold text-foreground text-lg">{tile.val}</p>
            </div>
          ))}
        </div>

        {/* Side-by-Side Comparison Panel */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-display font-bold text-foreground text-base">Liability vs Redemption Cost</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Theoretical Liability</p>
                <p className="mt-1 font-display font-bold text-xl text-foreground">{formatPrice(econOverview?.theoretical_liability ?? 2220)}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Actual Redemption Cost</p>
                <p className="mt-1 font-display font-bold text-xl text-primary">{formatPrice(econOverview?.actual_redemption_cost ?? 750)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Actual vs Target Cost: <span className="font-semibold text-foreground">0.5%</span> (Target: 2.5%, Variance: -2.0%)</p>
          </div>

          <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center text-center ${efficiencyColor}`}>
            <p className="text-xs font-bold uppercase tracking-wider">Programme Efficiency Ratio</p>
            <p className="my-2 font-display text-4xl font-extrabold">{((econOverview?.programme_efficiency ?? 0.3378) * 100).toFixed(1)}%</p>
            <p className="text-xs max-w-xs">Ratio of actual redemption cost against theoretical liability.</p>
          </div>
        </div>
      </section>

      {/* Tier Breakdown Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="text-primary" size={20} />
          <h2 className="font-display font-bold text-xl text-foreground">2. Tier Breakdown Table</h2>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/40 font-semibold text-muted-foreground">
              <tr>
                <th className="p-3">Tier</th>
                <th className="p-3">Revenue</th>
                <th className="p-3">HP Issued</th>
                <th className="p-3">HP Redeemed</th>
                <th className="p-3">Actual Cost</th>
                <th className="p-3">Effective %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {econTiers.map((t) => (
                <tr key={t.tier} className="hover:bg-secondary/20">
                  <td className="p-3 font-semibold">{t.tier}</td>
                  <td className="p-3">{formatPrice(t.revenue)}</td>
                  <td className="p-3">{t.hp_issued.toLocaleString()}</td>
                  <td className="p-3">{t.hp_redeemed.toLocaleString()}</td>
                  <td className="p-3">{formatPrice(t.actual_cost)}</td>
                  <td className="p-3">{((t.effective_pct ?? 0) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Redemption Analytics */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl text-foreground">3. Redemption Analytics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Food Cost</p>
            <p className="mt-1 font-display font-bold text-2xl text-foreground">{formatPrice(econRedemptions?.cost_by_type?.food ?? 500)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Merch / Perks Cost</p>
            <p className="mt-1 font-display font-bold text-2xl text-foreground">{formatPrice(econRedemptions?.cost_by_type?.merch ?? 250)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Actual Cost per Redeemed HP</p>
            <p className="mt-1 font-display font-bold text-2xl text-primary">{formatPrice(econRedemptions?.actual_cost_per_redeemed_hp ?? 0.1875)}</p>
          </div>
        </div>
      </section>

      {/* Standard Charts & Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue (7d)', value: formatPrice(375300), change: '+18.2%', up: true, icon: DollarSign },
          { label: 'Orders (7d)', value: '89', change: '+12%', up: true, icon: ShoppingBag },
          { label: 'Avg Order Value', value: formatPrice(Math.round(avgOrderValue)), change: '+5.3%', up: true, icon: TrendingUp },
          { label: 'Repeat Rate', value: '64%', change: '-2.1%', up: false, icon: Repeat },
        ].map((kpi, i) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon size={14} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="font-display font-bold text-foreground text-xl">{kpi.value}</p>
            <span className={`text-[10px] font-body font-medium ${kpi.up ? 'text-success' : 'text-destructive'}`}>{kpi.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnalytics;
