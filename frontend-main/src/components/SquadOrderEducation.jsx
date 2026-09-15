import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Tag, Truck, Sparkles } from 'lucide-react';
import { squadOrderMinItems, squadOrderMaxItems, squadOrderDiscountPct, squadDeliveryDiscountPct } from '@/lib/appConfig';

/**
 * SquadOrderEducation — promotional section that sells the Squad Order benefit.
 * Visible to guests + authenticated users. Reads live config for min/max items
 * and discount percentages.
 */
export default function SquadOrderEducation() {
  const minItems = squadOrderMinItems();
  const maxItems = squadOrderMaxItems();
  const discountPct = squadOrderDiscountPct();
  const deliveryDiscountPct = squadDeliveryDiscountPct();

  const benefits = [
    { icon: Tag, title: `${discountPct > 0 ? discountPct + '% off' : 'Bulk savings'}`, body: 'Discount on the whole squad order total.', bg: 'bg-flame-50', iconColor: 'text-flame-600' },
    { icon: Truck, title: 'Free delivery', body: `${deliveryDiscountPct}% delivery discount for the squad.`, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { icon: Sparkles, title: 'Even HP split', body: 'Total HP splits across every member — instantly.', bg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ];

  return (
    <section className="relative rounded-2xl overflow-hidden border border-purple-200">
      {/* Gradient promo background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800" />
      <div className="absolute -right-8 -top-8 text-9xl opacity-10 select-none">👥</div>

      <div className="relative p-5 text-white">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-2 ring-white/30">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-wider">🔥 Squad Orders</span>
            <h2 className="font-heading font-extrabold text-xl text-white mt-0.5 leading-tight">Feast together.<br/>Earn together.</h2>
          </div>
        </div>

        <p className="text-sm text-white/85 leading-relaxed mb-4">
          Grab your crew and order as a squad. Stack <span className="font-bold text-white">{minItems}–{maxItems} items</span> (add-ons don't count), and the whole squad gets a discount + free delivery. When the order lands, every registered member gets their share of the HP — straight to active balance.
        </p>

        {/* Benefit cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-2.5 text-center">
              <div className={`w-8 h-8 rounded-lg ${b.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <b.icon className={`w-4 h-4 ${b.iconColor}`} />
              </div>
              <div className="font-bold text-[11px] text-white leading-tight">{b.title}</div>
              <div className="text-[9px] text-white/60 leading-tight mt-0.5">{b.body}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-4 text-[10px] text-white/70">
          <div className="flex-1 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[9px]">1</span>
            <span>Add {minItems}+ items</span>
          </div>
          <span className="text-white/30">→</span>
          <div className="flex-1 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[9px]">2</span>
            <span>Name your squad</span>
          </div>
          <span className="text-white/30">→</span>
          <div className="flex-1 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[9px]">3</span>
            <span>Invite & earn</span>
          </div>
        </div>

        <Link to="/menu" className="w-full flex items-center justify-center gap-2 py-3 rounded-button bg-white text-purple-700 text-sm font-bold hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg">
          Start a squad order <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}