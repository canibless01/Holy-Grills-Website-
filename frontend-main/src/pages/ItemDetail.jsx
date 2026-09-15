import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flame, X, Plus, Minus, AlertCircle, ShoppingCart, Heart } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { useSound } from '@/lib/SoundProvider';
import { formatNaira } from '@/lib/hgUtils';
import RatingStars from '@/components/RatingStars';
import ItemOptionGroup from '@/components/ItemOptionGroup';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import TestimonialSlider from '@/components/TestimonialSlider';

/* Item-level reviews — swappable for a real reviews API keyed on item.id. */
const ITEM_REVIEWS = [
  { rating: 5, text: 'Flame done proper — the crust had char without being dry. Will order again.', name: 'Adewale T' },
  { rating: 5, text: 'Portion surprised me. Tender, well-seasoned, hit the spot after lectures.', name: 'Omoayena A' },
  { rating: 4, text: 'Took a bit during a busy window but flavour was worth the wait.', name: 'Filani O.P' },
];

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleSavedItem, isSavedItem, isAuthenticated: isAuthed } = useHolyGrill();
  const { play } = useSound();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [addonGroups, setAddonGroups] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState({});
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [detail, addons, all] = await Promise.all([
          mockApi.menu.getItem(id),
          mockApi.menu.getAddons(id),
          mockApi.menu.getItems({ available_only: 'true' }),
        ]);
        setItem(detail);
        setAddonGroups(addons.addon_groups || []);
        setRelatedItems((all.items || []).filter((i) => i.id !== id).slice(0, 3));
        const init = {};
        (detail.variation_groups || []).forEach((vg) => { init[vg.id] = []; });
        (addons.addon_groups || []).forEach((ag) => { init[ag.id] = []; });
        setSelections(init);
        setSaved(isSavedItem(detail.id));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelection = (groupId, optionId, maxSel) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (maxSel === 1) return { ...prev, [groupId]: [optionId] };
      if (current.includes(optionId)) return { ...prev, [groupId]: current.filter((x) => x !== optionId) };
      if (current.length < maxSel) return { ...prev, [groupId]: [...current, optionId] };
      return prev;
    });
  };

  // Live total = (base price + sum of selected option deltas) × quantity.
  const calculatePrice = () => {
    if (!item) return 0;
    let price = item.price;
    (item.variation_groups || []).forEach((vg) => {
      (selections[vg.id] || []).forEach((optId) => {
        const opt = (vg.options || []).find((o) => o.id === optId);
        if (opt) price += opt.price_delta;
      });
    });
    addonGroups.forEach((ag) => {
      (selections[ag.id] || []).forEach((addonId) => {
        const ad = (ag.addons || []).find((a) => a.id === addonId);
        if (ad) price += ad.price;
      });
    });
    return price * quantity;
  };

  const validateSelections = () => {
    if (!item) return [];
    const errs = [];
    (item.variation_groups || []).forEach((vg) => {
      if (vg.is_required && (selections[vg.id] || []).length < (vg.min_selections || 0)) {
        errs.push(`"${vg.name}" requires ${vg.min_selections} selection(s)`);
      }
    });
    addonGroups.forEach((ag) => {
      if (ag.is_required && (selections[ag.id] || []).length < (ag.min_select || 0)) {
        errs.push(`"${ag.name}" requires ${ag.min_select} selection(s)`);
      }
    });
    return errs;
  };

  const handleAddToCart = async () => {
    const errors = validateSelections();
    if (errors.length > 0) return;
    setAdding(true);
    try {
      const selected_variations = [];
      (item.variation_groups || []).forEach((vg) => {
        (selections[vg.id] || []).forEach((optId) => selected_variations.push({ variation_group_id: vg.id, option_id: optId }));
      });
      const selected_addons = [];
      addonGroups.forEach((ag) => {
        (selections[ag.id] || []).forEach((addonId) => selected_addons.push({ addon_id: addonId, quantity: 1 }));
      });
      play('cart_add');
      await addToCart({ menu_item_id: item.id, quantity, notes, selected_variations, selected_addons });
      toast({ title: '🔥 Added to your cart', description: `${quantity}× ${item.name} is ready to checkout.` });
      navigate('/cart');
    } catch (e) {
      console.error(e);
      toast({ title: 'Could not add to cart', description: e.message, variant: 'destructive' });
    }
    setAdding(false);
  };

  const handleSaveToggle = async () => {
    if (!isAuthed) { toast({ title: 'Sign in to save items', description: 'Saved items sync to your account.' }); return; }
    const nowSaved = await toggleSavedItem(item);
    setSaved(nowSaved);
    if (nowSaved) toast({ title: '❤️ Saved to your favourites', description: `${item.name} is in your Saved Items.` });
    else toast({ title: 'Removed from Saved Items', description: `${item.name} was taken off your list.` });
  };

  if (loading) return <LoadingSpinner label="Loading item..." />;
  if (!item) return <div className="text-center py-12 text-cocoa-400">Item not found</div>;

  const errors = validateSelections();
  const totalPrice = calculatePrice();
  const stockLevel = item.daily_remaining <= 2 ? 'critical' : item.daily_remaining <= 5 ? 'low' : 'mid';
  const stockBadgeBg = stockLevel === 'critical' ? 'bg-red-600' : stockLevel === 'low' ? 'bg-orange-500' : 'bg-amber-500';

  return (
    <div className="animate-fade-in pb-28">
      {/* 1. Hero image — full-width card with circular close button top-right */}
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-cocoa-100">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flame-gradient" />
        )}
        <button
          onClick={() => navigate('/menu')}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        {item.hp_multiplier && item.hp_multiplier !== 1 && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-flame-500 text-white text-[10px] font-bold shadow-md">
            {item.hp_multiplier === 2 ? '2× HP' : item.hp_multiplier === 0.5 ? '½× HP' : `${item.hp_multiplier}× HP`}
          </div>
        )}
        {item.is_sold_out && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 rounded-lg bg-cocoa-900 text-white font-bold">Sold Out</span>
          </div>
        )}
        {item.daily_remaining <= 10 && !item.is_sold_out && (
          <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg ${stockBadgeBg} text-white text-xs font-bold animate-pulse`}>
            Only {item.daily_remaining} left today!
          </div>
        )}
      </div>

      {/* 2 & 3. Name, category, description */}
      <div className="mt-4">
        {item.category?.name && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-flame-600">{item.category.name}</span>
        )}
        <h1 className="font-heading font-bold text-xl text-cocoa-800 mt-1">{item.name}</h1>
        <p className="hg-body mt-1 leading-relaxed">{item.description}</p>
      </div>

      {/* 4. Base price ("from") + HP earn preview */}
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <span className="font-heading font-bold text-lg text-flame-600">from {formatNaira(item.price)}</span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-50 text-gold-700 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 text-flame-600" />+{item.hp_earn_value || item.hp_earn_preview || 0} HP
        </div>
      </div>
      <div className="hg-caption mt-1">Daily limit: {item.daily_limit ?? '—'} · {item.daily_remaining ?? '—'} remaining</div>

      {/* 5. Overall rating */}
      <div className="mt-3">
        <RatingStars rating={item?.avg_rating ?? 0} count={item?.review_count ?? 0} size="md" />
      </div>

      {/* 6. Variation groups */}
      {(item.variation_groups || []).map((vg) => (
        <div key={vg.id} className="mt-4">
          <ItemOptionGroup group={vg} type="variation" selections={selections} onToggle={toggleSelection} disabled={item.is_sold_out} />
        </div>
      ))}

      {/* 7. Add-on groups */}
      {addonGroups.map((ag) => (
        <div key={ag.id} className="mt-4">
          <ItemOptionGroup group={ag} type="addon" selections={selections} onToggle={toggleSelection} disabled={item.is_sold_out} />
        </div>
      ))}

      {/* 8. Special instructions */}
      <div className="hg-card mt-4">
        <h3 className="hg-section-title mb-2">Special Instructions</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., No onions, extra crispy..."
          disabled={item.is_sold_out}
          className="w-full p-3 rounded-xl border border-cocoa-200 text-sm resize-none focus:outline-none focus:border-flame-400"
          rows={2}
        />
      </div>

      {/* 9. Reviews */}
      <div className="mt-5">
        <h3 className="hg-section-title mb-3">User Reviews</h3>
        <TestimonialSlider testimonials={ITEM_REVIEWS} compact subtext="Customer Review" />
      </div>

      {/* Errors inline (above the sticky footer) */}
      {errors.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 mt-3 px-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {errors[0]}
        </div>
      )}

      {/* 10. Sticky footer bar — quantity stepper + live "Add ₦X" button */}
      <div className="fixed bottom-16 left-0 right-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-cocoa-100 p-2.5 flex items-center gap-3">
            {/* Quantity stepper */}
            <div className="flex items-center gap-1 bg-cocoa-50 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-cocoa-200 flex items-center justify-center hover:border-flame-300 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-cocoa-600" />
              </button>
              <span className="font-semibold text-cocoa-800 w-6 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-cocoa-200 flex items-center justify-center hover:border-flame-300 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 text-cocoa-600" />
              </button>
            </div>

            {/* Save — outline icon */}
            <button
              onClick={handleSaveToggle}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                saved ? 'border-flame-500 bg-flame-50 text-flame-600' : 'border-cocoa-200 bg-white text-cocoa-600 hover:border-flame-300'
              }`}
              aria-label="Save to items"
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-flame-500' : ''}`} />
            </button>

            {/* Add to cart — live total */}
            <button
              onClick={handleAddToCart}
              disabled={item.is_sold_out || errors.length > 0 || adding}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl flame-gradient text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add · {formatNaira(totalPrice)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}