import { Search } from 'lucide-react';
import type { AdminTableRow } from '@/types';

interface AdminModulePageProps {
  title: string;
  description: string;
  rows: AdminTableRow[];
}

export function AdminModulePage({ title, description, rows }: AdminModulePageProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Live workflows', value: rows.filter((row) => row.status !== 'Draft').length.toString() },
              { label: 'Needs attention', value: rows.filter((row) => /paused|pending|draft/i.test(row.status)).length.toString() },
              { label: 'Owners', value: Array.from(new Set(rows.map((row) => row.owner))).length.toString() },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-secondary/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-display text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm text-muted-foreground">
            <Search size={16} /> Reusable filters and search live here
          </div>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>• Backend-ready filter contract for status, owner, and recency.</p>
            <p>• Reusable modal flow for create/edit/archive actions.</p>
            <p>• Safe placeholders for notifications, payments, and realtime sync.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Owner</th>
                <th className="pb-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60 last:border-0">
                  <td className="py-4 pr-4 font-medium text-foreground">{row.name}</td>
                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{row.status}</span>
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">{row.owner}</td>
                  <td className="py-4 text-muted-foreground">{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
