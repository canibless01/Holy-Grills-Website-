import React from 'react';
import { Check, Clock, Users, Trophy, MapPin } from 'lucide-react';
import { timeAgo, ORDER_STATUS_LABELS } from '@/lib/hgUtils';

const STATUS_STYLES = {
  received: 'bg-orange-500 text-white',
  preparing: 'bg-blue-500 text-white',
  ready: 'bg-emerald-500 text-white',
  assigned: 'bg-violet-500 text-white',
  out_for_delivery: 'bg-cyan-500 text-white',
};

// A single order ticket in the live queue. Kitchen staff only see the ordering
// student's name + items — per the kitchen spec, customer phone numbers are NOT
// visible to the kitchen (only via the rider call endpoint) and no financial
// data (totals, payment) is ever surfaced here. Kitchen can only move an order
// forward: received → preparing → ready. Once "ready" it surfaces in Admin's
// "Ready for Assignment" view — kitchen does NOT assign riders.
export default function KitchenOrderCard({ order, onStatusUpdate, actionLoading }) {
  const items = order.order_items || [];

  return (
    <div className="rounded-2xl bg-white border border-cocoa-100 p-3.5 shadow-selected-soft">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${STATUS_STYLES[order.status] || 'bg-cocoa-300 text-white'}`}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
          <span className="text-xs text-cocoa-400 font-mono">#{(order.id || '').toUpperCase()}</span>
          {order.has_free_side && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-600 flex items-center gap-0.5">
              <Trophy className="w-2.5 h-2.5" /> Reward Side
            </span>
          )}
          {(order.is_squad || order.squad_name) && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-600 flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" /> Squad{order.squad_name ? ` · ${order.squad_name}` : ''}
            </span>
          )}
        </div>
        <span className="text-xs text-cocoa-400 shrink-0">{timeAgo(order.received_at)}</span>
      </div>

      {/* Ordering student — name only, no phone (spec: kitchen cannot view phone numbers) */}
      <div className="flex items-center gap-2 mb-2 text-xs">
        <span className="flex items-center gap-1 text-cocoa-700 font-semibold">
          <Users className="w-3 h-3 text-flame-600" />
          <span className="truncate">{order.customer_name || 'Walk-in'}</span>
        </span>
        <span className="flex items-center gap-1 text-cocoa-400 ml-auto">
          <MapPin className="w-3 h-3" />{order.delivery_type === 'off_campus' ? 'Off-campus' : 'On-campus'}
        </span>
      </div>

      <div className="space-y-1 mb-2">
        {items.map((item, i) => (
          <div key={i} className="text-sm text-cocoa-700">
            <span className="font-bold">{item.quantity}×</span> {item.name_snapshot}
            {item.is_free_side && (
              <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600">
                🏆 Reward
              </span>
            )}
          </div>
        ))}
        {order.is_squad && (
          <p className="text-[10px] text-purple-500">Squad order — all items grouped into one ticket.</p>
        )}
      </div>

      {order.notes && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mb-2">📝 {order.notes}</p>}
      {order.delivery_windows?.label && (
        <div className="text-xs text-cocoa-400 mb-2.5 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {order.delivery_windows.label}
        </div>
      )}

      <div className="flex gap-2">
        {order.status === 'received' && (
          <button
            onClick={() => onStatusUpdate(order.id, 'preparing')}
            disabled={actionLoading === order.id}
            className="flex-1 py-2.5 rounded-xl bg-flame-600 text-white text-xs font-bold disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {actionLoading === order.id ? 'Updating...' : 'Start Preparing'}
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => onStatusUpdate(order.id, 'ready')}
            disabled={actionLoading === order.id}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {actionLoading === order.id ? 'Updating...' : 'Mark Ready'}
          </button>
        )}
        {order.status === 'ready' && (
          <div className="flex-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold text-center flex items-center justify-center gap-1 border border-emerald-200">
            <Check className="w-3.5 h-3.5" /> Ready — awaiting rider assignment
          </div>
        )}
      </div>
    </div>
  );
}