import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, CreditCard, Flame, Star, RefreshCw, Share2, X, Check, Package, Bike, Phone, User } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { useSound } from '@/lib/SoundProvider';
import { formatNaira, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_FLOW, getOrderCustomer } from '@/lib/hgUtils';
import { reviewHp, orderLockMaxReschedules } from '@/lib/appConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import ShareSheet from '@/components/ShareSheet';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useHolyGrill();
  const { play } = useSound();
  const claimToken = new URLSearchParams(location.search).get('claim_token');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, kitchen_rating: 4, rider_rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const o = await mockApi.orders.get(id, claimToken ? { claim_token: claimToken } : {});
        setOrder(o);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id, claimToken]);

  const handleCancel = async () => {
    const isScheduled = order.status === 'scheduled' || order.is_scheduled || !!order.scheduled_for;
    const msg = isScheduled
      ? 'Cancel this scheduled order? Your slot will be released.'
      : 'Cancel this order? You will be refunded.';
    if (!confirm(msg)) return;
    try {
      if (isScheduled) {
        await mockApi.orders.cancelScheduled(id);
      } else {
        await mockApi.orders.cancel(id, { reason: 'Changed my mind' });
      }
      await refreshUser();
      const o = await mockApi.orders.get(id, claimToken ? { claim_token: claimToken } : {});
      setOrder(o);
    } catch (e) { alert(e.message); }
  };

  const handleReorder = async () => {
    try {
      const result = await mockApi.orders.reorder(id);
      const items = result?.items || result?.order_items || result?.cart_items || [];
      for (const item of items) {
        if (item.is_available !== false) {
          await mockApi.cart.add({ menu_item_id: item.menu_item_id, quantity: item.quantity || 1 });
        }
      }
      navigate('/cart');
    } catch (e) { console.error(e); }
  };

  const handleReview = async () => {
    try {
      await mockApi.orders.review(id, review);
      await refreshUser();
      play('review_submitted');
      setReviewSubmitted(true);
      setShowReview(false);
    } catch (e) { console.error(e); }
  };

  const handleShare = () => setShowShare(true);

  if (loading) return <LoadingSpinner label="Loading order..." />;
  if (!order) return <div className="text-center py-12 text-cocoa-400">Order not found</div>;

  const statusIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const etaMin = order.delivery_batch ? ({ preparing: 25, ready: 15, assigned: 18, out_for_delivery: 12 }[order.status] || 0) : 0;
  const isScheduled = order.status === 'scheduled' || order.is_scheduled || !!order.scheduled_for;
  // Only allow cancel from a non-terminal status. Scheduled orders use the
  // dedicated cancel-scheduled endpoint; received orders use the normal cancel.
  const canCancel = (order.status === 'received') || isScheduled;
  const canReview = order.status === 'delivered' && !reviewSubmitted;
  const canReorder = ['delivered', 'cancelled'].includes(order.status);

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm text-cocoa-500">
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </button>

      {/* Status Card */}
      <div className="rounded-2xl bg-gradient-to-br from-cocoa-700 to-cocoa-900 p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <span className="text-xs text-cocoa-300">#{order.id.toUpperCase()}</span>
        </div>

        {/* Progress Timeline */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="flex items-center gap-1 mt-4">
            {ORDER_STATUS_FLOW.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex flex-col items-center ${i <= statusIndex ? 'text-flame-400' : 'text-cocoa-500'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    i <= statusIndex ? 'flame-gradient' : 'bg-cocoa-600'
                  }`}>
                    {i < statusIndex ? <Check className="w-3.5 h-3.5 text-white" /> : i + 1}
                  </div>
                  <span className="text-[8px] mt-1 font-semibold whitespace-nowrap">{ORDER_STATUS_LABELS[step].split(' ')[0]}</span>
                </div>
                {i < ORDER_STATUS_FLOW.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < statusIndex ? 'bg-flame-500' : 'bg-cocoa-600'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-2xl bg-white border border-cocoa-100 p-4">
        <h3 className="font-bold text-sm text-cocoa-800 mb-3">Items Ordered</h3>
        <div className="space-y-2">
          {order.order_items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-cocoa-700">{item.quantity}× {item.name_snapshot}</span>
                {order.notes && <p className="text-xs text-cocoa-400">📝 {order.notes}</p>}
              </div>
              <span className="font-semibold text-cocoa-700">{formatNaira(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-cocoa-100 mt-3 pt-3 space-y-1">
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Discount</span><span>-{formatNaira(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <span className="text-cocoa-800">Total</span>
            <span className="text-cocoa-800">{formatNaira(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="rounded-2xl bg-white border border-cocoa-100 p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-cocoa-400" />
          <div><div className="text-xs text-cocoa-400">{isScheduled ? 'Scheduled for' : 'Placed'}</div><div className="font-semibold text-cocoa-700">{formatDateTime(isScheduled ? (order.scheduled_for || order.scheduled_date || order.created_at) : order.created_at)}</div></div>
        </div>
        {(() => { const c = getOrderCustomer(order); return (c.name || c.phone) ? (
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-cocoa-400" />
            <div><div className="text-xs text-cocoa-400">Ordered by</div><div className="font-semibold text-cocoa-700">{c.display}{c.phone ? ` · ${c.phone}` : ''}</div></div>
          </div>
        ) : null; })()}
        {order.delivered_at && (
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-4 h-4 text-green-500" />
            <div><div className="text-xs text-cocoa-400">Delivered</div><div className="font-semibold text-cocoa-700">{formatDateTime(order.delivered_at)}</div></div>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-cocoa-400" />
          <div><div className="text-xs text-cocoa-400">Delivery to</div><div className="font-semibold text-cocoa-700">{order.delivery_address.line1}</div></div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Package className="w-4 h-4 text-cocoa-400" />
          <div><div className="text-xs text-cocoa-400">Window</div><div className="font-semibold text-cocoa-700">{order.delivery_window?.label}</div></div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <CreditCard className="w-4 h-4 text-cocoa-400" />
          <div>
            <div className="text-xs text-cocoa-400">Payment ({order.payment_status})</div>
            <div className="font-semibold text-cocoa-700">
              {order.wallet_amount_used > 0 && `Wallet: ${formatNaira(order.wallet_amount_used)}`}
              {order.wallet_amount_used > 0 && order.card_amount_used > 0 && ' + '}
              {order.card_amount_used > 0 && `Card: ${formatNaira(order.card_amount_used)}`}
            </div>
          </div>
        </div>
        {order.hp_earned > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <Flame className="w-4 h-4 text-flame-500" />
            <div><div className="text-xs text-cocoa-400">HP Earned</div><div className="font-semibold text-flame-600">+{order.hp_earned} HP</div></div>
          </div>
        )}
        {order.hp_redeemed > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <Flame className="w-4 h-4 text-cocoa-400" />
            <div><div className="text-xs text-cocoa-400">HP Redeemed</div><div className="font-semibold text-cocoa-600">-{order.hp_redeemed} HP</div></div>
          </div>
        )}
      </div>

      {/* Rider Info */}
      {order.delivery_batch && (
        <div className="rounded-2xl bg-white border border-cocoa-100 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cocoa-100 flex items-center justify-center">
              <Bike className="w-5 h-5 text-cocoa-500" />
            </div>
            <div>
              <div className="text-xs text-cocoa-400">Rider</div>
              <div className="font-semibold text-sm text-cocoa-700">{order.assigned_rider?.name || `Rider #${order.delivery_batch.rider_id}`}</div>
            </div>
            <span className="ml-auto text-xs font-bold text-cocoa-500 capitalize">{order.delivery_batch.status}</span>
          </div>
          {etaMin > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-flame-50 border border-flame-200">
              <Clock className="w-4 h-4 text-flame-600" />
              <div className="text-sm font-bold text-flame-600">Arriving in ~{etaMin} min</div>
            </div>
          )}
          <a href={order.assigned_rider?.call_link || 'tel:+0'} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-green-600 text-white text-sm font-bold">
            <Phone className="w-4 h-4" /> Call Rider
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {canCancel && (
          <button onClick={handleCancel} className="flex-1 py-3 rounded-full bg-red-50 border border-red-200 text-red-600 font-bold text-sm">
            {isScheduled ? 'Cancel Scheduled Order' : 'Cancel Order'}
          </button>
        )}
        {canReorder && (
          <button onClick={handleReorder} className="flex-1 py-3 rounded-full bg-white border border-cocoa-200 text-cocoa-700 font-bold text-sm flex items-center justify-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> Reorder
          </button>
        )}
        <button onClick={handleShare} className="flex-1 py-3 rounded-full bg-white border border-cocoa-200 text-cocoa-700 font-bold text-sm flex items-center justify-center gap-1.5">
          <Share2 className="w-4 h-4" /> Share
        </button>
        {canReview && (
          <button onClick={() => setShowReview(true)} className="flex-1 py-3 rounded-full flame-gradient text-white font-bold text-sm flex items-center justify-center gap-1.5">
            <Star className="w-4 h-4" /> Review
          </button>
        )}
      </div>

      {reviewSubmitted && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-bold text-sm text-green-800">Review submitted!</div>
            <div className="text-xs text-green-600">You earned {reviewHp()} HP (pending)</div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowReview(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-cocoa-800">Rate Your Order</h3>
              <button onClick={() => setShowReview(false)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-cocoa-500 uppercase">Overall Rating</label>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReview({ ...review, rating: s })}>
                      <Star className={`w-8 h-8 ${s <= review.rating ? 'fill-gold-300 text-gold-300' : 'text-cocoa-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-cocoa-500 uppercase">Kitchen Rating</label>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReview({ ...review, kitchen_rating: s })}>
                      <Star className={`w-6 h-6 ${s <= review.kitchen_rating ? 'fill-gold-300 text-gold-300' : 'text-cocoa-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-cocoa-500 uppercase">Rider Rating</label>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReview({ ...review, rider_rating: s })}>
                      <Star className={`w-6 h-6 ${s <= review.rider_rating ? 'fill-gold-300 text-gold-300' : 'text-cocoa-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Tell us about your experience..."
                className="w-full p-3 rounded-xl border border-cocoa-200 text-sm resize-none focus:outline-none focus:border-flame-400"
                rows={3}
              />
              <button onClick={handleReview} className="w-full py-3 rounded-full flame-gradient text-white font-bold">
                Submit Review (+{reviewHp()} HP)
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        type="order"
        payload={{
          orderId: order.id,
          headline: 'My Holy Grills order',
          value: formatNaira(order.total_amount || 0),
          caption: 'Just got my grill on 🔥',
          link: `${window.location.origin}/orders/${order.id}`,
        }}
      />
    </div>
  );
}