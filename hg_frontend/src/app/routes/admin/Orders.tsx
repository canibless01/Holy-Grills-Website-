import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/data/menu';
import type { Order, OrderStatus } from '@/types';
import { Package, ChevronDown, Search, X, AlertTriangle, RotateCcw, Truck, CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  cancelOrder as cancelOrderApi,
  getOrders,
  refundOrder as refundOrderApi,
  updateOrderStatus as updateOrderStatusApi,
} from '@/services/api/order.service';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  all: { label: 'All', color: '', bgColor: '' },
  placed: { label: 'Placed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  confirmed: { label: 'Confirmed', color: 'text-primary', bgColor: 'bg-primary/10' },
  preparing: { label: 'Preparing', color: 'text-accent', bgColor: 'bg-accent/10' },
  out_for_delivery: { label: 'On the way', color: 'text-primary', bgColor: 'bg-primary/10' },
  delivered: { label: 'Delivered', color: 'text-success', bgColor: 'bg-success/10' },
  cancelled: { label: 'Cancelled', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  refunded: { label: 'Refunded', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: 'confirmed',
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const AdminOrders = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: fetchedOrders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getOrders,
    refetchInterval: 15000,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [lastPolled, setLastPolled] = useState(new Date());

  useEffect(() => {
    setOrders(fetchedOrders);
    setLastPolled(new Date());
  }, [fetchedOrders]);

  const filtered = orders.filter((o) => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.address.phone.includes(search) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const advanceStatus = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = NEXT_STATUS[o.status];
        if (!next) return o;
        return {
          ...o,
          status: next,
          statusHistory: [...o.statusHistory, { status: next, timestamp: new Date().toISOString() }],
        };
      })
    );
    const targetOrder = orders.find((order) => order.id === orderId);
    const next = targetOrder ? NEXT_STATUS[targetOrder.status] : undefined;

    if (!next) return;

    try {
      await updateOrderStatusApi(orderId, next);
      toast.success('Order status updated');
    } catch {
      toast.error('Unable to sync order status with backend');
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled' as OrderStatus,
              cancelReason,
              statusHistory: [...o.statusHistory, { status: 'cancelled' as OrderStatus, timestamp: new Date().toISOString() }],
            }
          : o
      )
    );
    try {
      await cancelOrderApi(orderId, cancelReason);
      toast.success('Order cancelled');
    } catch {
      toast.error('Unable to cancel order in backend');
    }
    setCancelModalId(null);
    setCancelReason('');
  };

  const refundOrder = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'refunded' as OrderStatus,
              refundedAt: new Date().toISOString(),
              statusHistory: [...o.statusHistory, { status: 'refunded' as OrderStatus, timestamp: new Date().toISOString() }],
            }
          : o
      )
    );
    try {
      await refundOrderApi(orderId);
      toast.success('Refund initiated');
    } catch {
      toast.error('Unable to initiate refund in backend');
    }
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'all').map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={`p-3 rounded-lg border transition-all text-center ${
              filter === key ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <p className={`font-display font-bold text-lg ${config.color}`}>{statusCounts[key] || 0}</p>
            <p className="text-[10px] text-muted-foreground font-body">{config.label}</p>
          </button>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, phone, or item..."
            className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
          <RefreshCw size={12} className="animate-spin-slow" />
          <span>Auto-refreshing every 15s</span>
        </div>
        {isLoading ? <span className="text-xs text-muted-foreground">Loading orders…</span> : null}
      </div>

      {/* Orders table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 border-b border-border text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-2">Order</div>
          <div className="col-span-3">Items</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-3">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
            const nextStatus = NEXT_STATUS[order.status];
            const isExpanded = expandedId === order.id;
            const canCancel = !['delivered', 'cancelled', 'refunded'].includes(order.status);
            const canRefund = order.status === 'cancelled' || order.status === 'delivered';

            return (
              <div key={order.id}>
                <div
                  className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-5 py-4 hover:bg-secondary/10 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="lg:col-span-2 flex items-center gap-2">
                    <Package size={14} className="text-muted-foreground shrink-0 hidden lg:block" />
                    <div>
                      <span className="font-body font-semibold text-foreground text-sm">#{order.id}</span>
                      <p className="text-[10px] text-muted-foreground font-body lg:hidden">
                        {new Date(order.createdAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="text-xs text-muted-foreground font-body truncate">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-body hidden lg:block">
                      {new Date(order.createdAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-xs text-foreground font-body">{order.address.phone}</p>
                    <p className="text-[10px] text-muted-foreground font-body truncate">{order.address.streetAddress}</p>
                  </div>
                  <div className="lg:col-span-1">
                    <span className="font-body font-bold text-foreground text-sm">{formatPrice(order.total)}</span>
                  </div>
                  <div className="lg:col-span-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="lg:col-span-3 flex items-center gap-1.5 flex-wrap">
                    {nextStatus && (
                      <button
                        onClick={(e) => { e.stopPropagation(); advanceStatus(order.id); }}
                        className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-body font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1"
                      >
                        <Truck size={10} /> {STATUS_CONFIG[nextStatus]?.label}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setCancelModalId(order.id); }}
                        className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-[10px] font-body font-semibold hover:bg-destructive/20 transition-colors flex items-center gap-1"
                      >
                        <XCircle size={10} /> Cancel
                      </button>
                    )}
                    {canRefund && order.status !== 'refunded' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); refundOrder(order.id); }}
                        className="px-2.5 py-1 rounded-md bg-accent/10 text-accent text-[10px] font-body font-semibold hover:bg-accent/20 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw size={10} /> Refund
                      </button>
                    )}
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform ml-auto ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 py-5 bg-secondary/5 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                          {/* Items */}
                          <div>
                            <h4 className="text-xs font-body font-semibold text-foreground mb-3 uppercase tracking-wider">Items</h4>
                            <div className="space-y-2.5">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-2.5">
                                  <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-foreground font-body font-medium truncate">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-body">{item.quantity}× {formatPrice(item.price)}</p>
                                  </div>
                                  <span className="text-xs text-foreground font-body font-semibold">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                              <div className="border-t border-border pt-2 space-y-1">
                                <div className="flex justify-between text-[10px] font-body text-muted-foreground">
                                  <span>Subtotal</span><span className="text-foreground">{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-body text-muted-foreground">
                                  <span>Delivery</span><span className="text-foreground">{formatPrice(order.deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-body font-bold text-foreground">
                                  <span>Total</span><span className="text-primary">{formatPrice(order.total)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delivery */}
                          <div>
                            <h4 className="text-xs font-body font-semibold text-foreground mb-3 uppercase tracking-wider">Delivery</h4>
                            <div className="space-y-1.5 text-xs font-body">
                              <p className="text-foreground font-medium">{order.address.streetAddress}</p>
                              <p className="text-muted-foreground">{order.address.city}</p>
                              {order.address.landmark && <p className="text-muted-foreground">📍 {order.address.landmark}</p>}
                              <p className="text-primary font-medium mt-2">📞 {order.address.phone}</p>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div>
                            <h4 className="text-xs font-body font-semibold text-foreground mb-3 uppercase tracking-wider">Timeline</h4>
                            <div className="space-y-2">
                              {order.statusHistory.map((event, idx) => {
                                const evtConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.placed;
                                return (
                                  <div key={idx} className="flex items-start gap-2">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-2 h-2 rounded-full mt-1 ${evtConfig.color === 'text-destructive' ? 'bg-destructive' : evtConfig.color === 'text-success' ? 'bg-success' : 'bg-primary'}`} />
                                      {idx < order.statusHistory.length - 1 && <div className="w-px h-4 bg-border mt-0.5" />}
                                    </div>
                                    <div className="flex-1 -mt-0.5">
                                      <p className={`text-[10px] font-body font-medium ${evtConfig.color}`}>{evtConfig.label}</p>
                                      <p className="text-[9px] text-muted-foreground font-body">
                                        {new Date(event.timestamp).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Payment & Notes */}
                          <div>
                            <h4 className="text-xs font-body font-semibold text-foreground mb-3 uppercase tracking-wider">Payment</h4>
                            <div className="space-y-1.5 text-xs font-body">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Reference</span>
                                <span className="text-foreground font-mono text-[10px]">{order.paystackRef}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">HP Earned</span>
                                <span className="text-accent font-medium">{order.hpEarned} HP</span>
                              </div>
                              {order.cancelReason && (
                                <div className="mt-3 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <AlertTriangle size={10} className="text-destructive" />
                                    <span className="text-[10px] font-body font-semibold text-destructive">Cancel Reason</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground font-body">{order.cancelReason}</p>
                                </div>
                              )}
                              {order.refundedAt && (
                                <div className="mt-2 p-2.5 rounded-lg bg-accent/5 border border-accent/10">
                                  <p className="text-[10px] font-body text-accent font-medium">Refunded on {new Date(order.refundedAt).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-16 text-center">
            <Package size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground font-body">No orders match your search</p>
          </div>
        )}
      </div>

      {/* Cancel order modal */}
      <AnimatePresence>
        {cancelModalId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCancelModalId(null)} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative bg-card rounded-xl border border-border p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle size={20} className="text-destructive" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-base">Cancel Order</h3>
                  <p className="text-xs text-muted-foreground font-body">#{cancelModalId}</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs text-muted-foreground font-body mb-1.5">Reason for cancellation *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setCancelModalId(null); setCancelReason(''); }}
                  className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground font-body font-medium text-sm hover:bg-border transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => cancelOrder(cancelModalId)}
                  className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-body font-semibold text-sm hover:bg-destructive/90 transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
