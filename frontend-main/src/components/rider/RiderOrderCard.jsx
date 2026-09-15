import React from 'react';
import { Navigation, Phone, MapPin, Check, Clock, AlertCircle } from 'lucide-react';

const STATUS_STYLES = {
  assigned: 'bg-violet-500 text-white',
  out_for_delivery: 'bg-cyan-500 text-white',
  delivered: 'bg-green-700 text-white',
  delivery_attempted: 'bg-red-500 text-white',
  unclaimed: 'bg-gray-400 text-white',
};

// A single delivery in the rider's batch. Orders arrive pre-sorted closest-first
// by the backend (haversine distance from the zone gate). The rider walks each
// order through assigned → out_for_delivery → delivered (or delivery_attempted).
// Phone numbers are NEVER shown in raw form — the Call button fetches a secure
// tel: link from /riders/call/<order_id>. Squad orders appear as a single order
// with all items grouped; Hall of Fame reward items show the 🏅 tag.
export default function RiderOrderCard({ order, onAction, onCall, onNavigate, actionLoading, calling }) {
  const isLoading = actionLoading === order.id;
  const isCalling = calling === order.id;
  const status = order.status;
  const isSquad = order.is_squad || order.squad_name;

  return (
    <div className="rounded-2xl bg-white border border-cocoa-100 shadow-selected-soft overflow-hidden">
      {/* Rank + customer header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-9 h-9 rounded-full flame-gradient flex items-center justify-center text-white text-sm font-extrabold shrink-0">
          {order.delivery_rank || '#'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="font-heading font-bold text-sm text-cocoa-800 truncate">{order.customer_name}</div>
            {isSquad && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-600 shrink-0">Squad</span>
            )}
          </div>
          <div className="text-[11px] text-cocoa-400 font-mono">{order.id.toUpperCase()}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-xs font-bold text-flame-600">
            <Navigation className="w-3 h-3" />
            {order.distance_km ? `${order.distance_km}km` : '—'}
          </div>
          {status && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${STATUS_STYLES[status] || 'bg-cocoa-200 text-white'}`}>
              {status === 'out_for_delivery' ? 'en route' : status.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Delivery address — phone is exposed only via the secure /riders/call link */}
      <div className="px-4 pb-2 space-y-1">
        <div className="flex items-start gap-1.5 text-xs text-cocoa-500">
          <MapPin className="w-3 h-3 text-cocoa-400 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{order.delivery_address || 'Address not specified'}</span>
        </div>
      </div>

      {/* Items — squad orders show all items grouped; Hall of Fame reward tagged */}
      <div className="px-4 py-2 bg-cocoa-50/50 border-y border-cocoa-100">
        <div className="space-y-0.5">
          {(order.items || []).map((item, i) => (
            <div key={i} className="text-xs text-cocoa-700 flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-cocoa-800">{item.quantity}×</span>
              <span>{item.name_snapshot}</span>
              {(item.is_hof_reward || item.is_hall_of_fame_reward || item.reward_type === 'hall_of_fame') && (
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gold-100 text-gold-600">
                  🏅 Hall of Fame Reward
                </span>
              )}
            </div>
          ))}
        </div>
        {order.delivery_hint && (
          <div className="text-[11px] text-cocoa-400 italic mt-1.5">{order.delivery_hint}</div>
        )}
      </div>

      {/* Action buttons — state-aware per the rider status flow */}
      <div className="p-3 flex items-center gap-2">
        <button
          onClick={() => onCall(order.id)}
          disabled={isCalling}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gold-100 text-gold-600 text-xs font-bold disabled:opacity-50 hover:bg-gold-200/60 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" /> {isCalling ? '...' : 'Call'}
        </button>
        <button
          onClick={() => onNavigate(order.delivery_address)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-50 text-cyan-600 text-xs font-bold hover:bg-cyan-100/60 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" /> Navigate
        </button>
        <div className="flex-1" />

        {(status === 'assigned' || status === 'ready') && (
          <button
            onClick={() => onAction(order.id, 'pickup')}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl bg-flame-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-flame-700 transition-colors"
          >
            {isLoading ? '...' : 'Confirm Pickup'}
          </button>
        )}
        {status === 'out_for_delivery' && (
          <>
            <button
              onClick={() => onAction(order.id, 'deliver')}
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-emerald-700 transition-colors"
            >
              {isLoading ? '...' : 'Delivered'}
            </button>
            <button
              onClick={() => onAction(order.id, 'attempt')}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold disabled:opacity-50 hover:bg-red-100 transition-colors"
            >
              Miss
            </button>
          </>
        )}
        {status === 'delivered' && (
          <div className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold text-center flex items-center justify-center gap-1 border border-emerald-200">
            <Check className="w-3.5 h-3.5" /> Delivered
          </div>
        )}
        {status === 'delivery_attempted' && (
          <div className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold text-center flex items-center justify-center gap-1 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Attempted — retry pending
          </div>
        )}
        {status === 'unclaimed' && (
          <div className="flex-1 py-2 rounded-xl bg-cocoa-100 text-cocoa-500 text-xs font-bold text-center flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Unclaimed
          </div>
        )}
        {!['assigned', 'ready', 'out_for_delivery', 'delivered', 'delivery_attempted', 'unclaimed'].includes(status) && (
          <div className="flex-1 py-2 rounded-xl bg-cocoa-50 text-cocoa-400 text-xs font-bold text-center">
            {status ? status.replace(/_/g, ' ') : 'Awaiting'}
          </div>
        )}
      </div>
    </div>
  );
}