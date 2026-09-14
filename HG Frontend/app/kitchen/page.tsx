'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell, ChefHat } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { getOrders } from '@/services/api/order.service';

export default function Page() {
  const { data: orders = [] } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: getOrders,
  });
  const queue = orders.filter((order) => ['placed', 'confirmed', 'preparing'].includes(order.status));

  return (
    <AdminGuard allowKitchen>
      <main className="min-h-screen bg-background px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-[2rem] border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Kitchen dashboard</p>
                <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Live prep queue only.</h1>
                <p className="mt-2 text-sm text-muted-foreground">Kitchen mode hides financial details and sensitive user data while keeping status progression front and center.</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary"><ChefHat size={22} /></div>
            </div>
          </section>

          <div className="rounded-[2rem] border border-border bg-card p-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground"><Bell size={16} className="text-primary" /> Audio notification placeholder</div>
            Hook browser audio, websocket events, and hardware alert integrations here when backend realtime is ready.
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {queue.map((order) => (
              <div key={order.id} className="rounded-[2rem] border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground">{order.id}</p>
                <p className="mt-1 text-xs text-muted-foreground">{order.items.length} item(s) in queue</p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {order.items.map((item) => <p key={item.id}>{item.quantity}× {item.name}</p>)}
                </div>
                <div className="mt-4 flex gap-2">
                  {['confirmed', 'preparing', 'out_for_delivery'].map((status) => (
                    <button key={status} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground">{status.replaceAll('_', ' ')}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
