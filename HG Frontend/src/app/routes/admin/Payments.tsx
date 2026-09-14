import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/admin/StatCard';
import { formatPrice } from '@/data/menu';
import type { PaymentStatus } from '@/types';
import { DollarSign, CreditCard, ArrowDownLeft, AlertCircle, Clock, Search, X, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminPayments } from '@/services/api/admin.service';

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  success: { label: 'Success', color: 'text-success', bgColor: 'bg-success/10' },
  pending: { label: 'Pending', color: 'text-accent', bgColor: 'bg-accent/10' },
  failed: { label: 'Failed', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  refunded: { label: 'Refunded', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

const CHANNEL_LABELS: Record<string, string> = {
  card: '💳 Card',
  bank_transfer: '🏦 Bank Transfer',
  ussd: '📱 USSD',
};

const AdminPayments = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: getAdminPayments,
  });

  const filtered = payments.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch = !search ||
      p.paystackRef.toLowerCase().includes(search.toLowerCase()) ||
      p.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = payments.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const failedCount = payments.filter((p) => p.status === 'failed').length;

  const channelBreakdown = payments.filter((p) => p.status === 'success').reduce((acc, p) => {
    acc[p.channel] = (acc[p.channel] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);
  const maxChannelRevenue = Math.max(...Object.values(channelBreakdown), 1);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={formatPrice(totalRevenue)} change="+18.2% vs last week" changeType="positive" icon={DollarSign} />
        <StatCard title="Total Refunded" value={formatPrice(totalRefunded)} change={`${payments.filter(p => p.status === 'refunded').length} transactions`} changeType="negative" icon={ArrowDownLeft} iconColor="text-destructive" />
        <StatCard title="Pending" value={pendingCount.toString()} change="Awaiting confirmation" changeType="neutral" icon={Clock} iconColor="text-accent" />
        <StatCard title="Failed" value={failedCount.toString()} change="Require attention" changeType={failedCount > 0 ? 'negative' : 'neutral'} icon={AlertCircle} iconColor="text-destructive" />
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading payment activity…</p> : null}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main transactions table */}
        <div className="xl:col-span-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ref, email, or order ID..."
                className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {['all', 'success', 'pending', 'failed', 'refunded'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                    statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_CONFIG[s as PaymentStatus]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 border-b border-border text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2">Reference</div>
              <div className="col-span-2">Order</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1">Channel</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Date</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((payment) => {
                const config = STATUS_CONFIG[payment.status];
                return (
                  <div key={payment.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-secondary/10 transition-colors">
                    <div className="md:col-span-2">
                      <span className="font-mono text-xs text-foreground">{payment.paystackRef}</span>
                    </div>
                    <div className="md:col-span-2">
                      {payment.orderId ? (
                        <span className="text-xs text-primary font-body font-medium">#{payment.orderId}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-body">—</span>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-foreground font-body truncate">{payment.customerEmail}</p>
                      <p className="text-[10px] text-muted-foreground font-body">{payment.customerPhone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-body font-bold text-foreground text-sm">{formatPrice(payment.amount)}</span>
                    </div>
                    <div className="md:col-span-1">
                      <span className="text-[10px] font-body text-muted-foreground">{CHANNEL_LABELS[payment.channel]}</span>
                    </div>
                    <div className="md:col-span-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground font-body">
                        {new Date(payment.paidAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {payment.refundedAt && (
                        <p className="text-[10px] text-destructive font-body">
                          Refunded {new Date(payment.refundedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="p-16 text-center">
                <CreditCard size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground font-body">No payments match your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Channel breakdown */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-bold text-foreground text-sm mb-4">Revenue by Channel</h3>
            <div className="space-y-3">
              {Object.entries(channelBreakdown).map(([channel, revenue]) => (
                <div key={channel}>
                  <div className="flex justify-between text-xs font-body mb-1">
                    <span className="text-muted-foreground">{CHANNEL_LABELS[channel]}</span>
                    <span className="text-foreground font-medium">{formatPrice(revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(revenue / maxChannelRevenue) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-fire"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paystack link */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Paystack Dashboard</h3>
            <p className="text-xs text-muted-foreground font-body mb-3">View detailed transaction logs, disputes, and settlements.</p>
            <a
              href="https://dashboard.paystack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground font-body font-medium text-sm hover:bg-border transition-colors"
            >
              <ExternalLink size={14} /> Open Paystack
            </a>
          </div>

          {/* Recent activity */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {payments.slice(0, 5).map((p) => {
                const cfg = STATUS_CONFIG[p.status];
                return (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${cfg.color === 'text-success' ? 'bg-success' : cfg.color === 'text-destructive' ? 'bg-destructive' : cfg.color === 'text-accent' ? 'bg-accent' : 'bg-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-foreground font-body truncate">{p.customerEmail}</p>
                    </div>
                    <span className="text-[10px] text-foreground font-body font-medium">{formatPrice(p.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
