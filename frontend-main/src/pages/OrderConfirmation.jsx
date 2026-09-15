import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, Flame, Package, MapPin, CreditCard, Users, Share2, ChevronRight, Clock } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { playSound } from '@/lib/soundManager';
import { formatNaira, formatDateTime, ORDER_STATUS_LABELS } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getSetting } = useHolyGrill();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);
  const claimToken = location.state?.claim_token;
  const giftItemName = getSetting('first_order_gift_item_name', 'Hot Dog');

  useEffect(() => {
    const load = async () => {
      try {
        // Guests fetch their order with a claim_token (no auth); authed users
        // just GET /orders/:id. If the id is a placeholder, skip the fetch.
        if (id && id !== 'pending') {
          const o = await mockApi.orders.get(id, claimToken ? { claim_token: claimToken } : {});
          setOrder(o);
          // Celebration tone the moment the confirmed order lands — the
          // single "you did it" moment on this page, so it owns the sound.
          playSound('order_placed');
          if (o?.hp_earned > 0) setTimeout(() => playSound('hp_earned'), 700);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id, claimToken]);

  const handleShare = async () => {
    try {
      await mockApi.orders.share(id, { platform: 'whatsapp' });
      setShared(true);
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingSpinner label="Loading confirmation..." />;
  if (!order) return <div className="text-center py-12 text-cocoa-400">Order not found</div>;

  return (
    <div className="space-y-6 animate-fade-in text-center">
      {/* Success Animation */}
      <div className="pt-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-count-up">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="absolute -top-2 -right-2 text-3xl animate-flame-flicker">🔥</div>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-cocoa-800 mt-4">Order Confirmed!</h1>
        <p className="text-sm text-cocoa-500 mt-1">Your flame-grilled order is being prepared.</p>
        <div className="inline-block mt-2 px-4 py-1.5 rounded-full bg-cocoa-100 text-xs font-bold text-cocoa-600">
          Order #{order.id.toUpperCase()}
        </div>
      </div>

      {/* HP Earned */}
      {order.hp_earned > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-flame-50 to-gold-100 border border-flame-200 p-4">
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-6 h-6 text-flame-600" />
            <span className="font-heading font-extrabold text-2xl text-flame-600">+{order.hp_earned} HP</span>
          </div>
          <p className="text-xs text-cocoa-500 mt-1">Holy Points earned from this order!</p>
          {order.order_items?.some(it => it.hp_multiplier && it.hp_multiplier !== 1) && (
            <div className="mt-3 pt-3 border-t border-flame-200 space-y-1 text-left">
              {order.order_items.filter(it => it.hp_multiplier && it.hp_multiplier !== 1).map((it, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-cocoa-600">
                  <span>{it.quantity}× {it.name_snapshot}</span>
                  <span className="font-semibold">
                    {it.hp_earn_value || 0} HP × {it.hp_multiplier} = <span className="text-flame-600 font-bold">{Math.round((it.hp_earn_value || 0) * it.hp_multiplier * it.quantity)} HP</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* First-order gift */}
      {order.is_first_order && giftItemName && (
        <div className="rounded-2xl bg-purple-50 border border-purple-200 p-4 text-center">
          <div className="text-3xl mb-1">🎁</div>
          <h3 className="font-bold text-sm text-purple-800">First Order Gift!</h3>
          <p className="text-xs text-purple-600 mt-1">Enjoy a free {giftItemName} on us — welcome to Holy Grills! 🔥</p>
        </div>
      )}

      {/* Order Summary */}
      <div className="text-left rounded-2xl bg-white border border-cocoa-100 p-4 space-y-3">
        <h3 className="font-bold text-sm text-cocoa-800">Order Summary</h3>
        {order.order_items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-cocoa-600">{item.quantity}× {item.name_snapshot}</span>
            <span className="font-semibold text-cocoa-700">{formatNaira(item.line_total)}</span>
          </div>
        ))}
        <div className="border-t border-cocoa-100 pt-2 space-y-1">
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Discount</span>
              <span>-{formatNaira(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <span className="text-cocoa-800">Total Paid</span>
            <span className="text-cocoa-800">{formatNaira(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="text-left rounded-2xl bg-white border border-cocoa-100 p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-cocoa-400" />
          <div>
            <div className="text-xs text-cocoa-400">Placed at</div>
            <div className="font-semibold text-cocoa-700">{formatDateTime(order.created_at)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-cocoa-400" />
          <div>
            <div className="text-xs text-cocoa-400">Delivery to</div>
            <div className="font-semibold text-cocoa-700">{order.delivery_address.line1}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Package className="w-4 h-4 text-cocoa-400" />
          <div>
            <div className="text-xs text-cocoa-400">Window</div>
            <div className="font-semibold text-cocoa-700">{order.delivery_window?.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <CreditCard className="w-4 h-4 text-cocoa-400" />
          <div>
            <div className="text-xs text-cocoa-400">Payment</div>
            <div className="font-semibold text-cocoa-700 capitalize">
              {order.wallet_amount_used > 0 && order.card_amount_used > 0 ? 'Split' : order.wallet_amount_used > 0 ? 'Wallet' : 'Card'}
              {' · '}
              <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>
        {order.is_squad_order && (
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-cocoa-400" />
            <div>
              <div className="text-xs text-cocoa-400">Squad</div>
              <div className="font-semibold text-cocoa-700">{order.squad_name}</div>
            </div>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="text-left rounded-2xl bg-white border border-cocoa-100 p-4">
        <h3 className="font-bold text-sm text-cocoa-800 mb-3">Order Status</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-cocoa-100">
            <div className="h-full rounded-full flame-gradient" style={{ width: '15%' }} />
          </div>
          <span className="text-xs font-bold text-flame-600">{ORDER_STATUS_LABELS[order.status]}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 rounded-full flame-gradient text-white font-bold shadow-lg"
        >
          Go to Dashboard
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/orders/${order.id}${claimToken ? `?claim_token=${claimToken}` : ''}`)}
            className="flex-1 py-3 rounded-full bg-white border border-cocoa-200 text-cocoa-700 font-bold text-sm"
          >
            Track Order
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-full bg-white border border-cocoa-200 text-cocoa-700 font-bold text-sm flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            {shared ? '+25 HP!' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}