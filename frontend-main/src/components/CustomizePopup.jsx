import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Minus, Check, X, ShoppingCart, AlertCircle } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { useSound } from '@/lib/SoundProvider';
import { formatNaira } from '@/lib/hgUtils';
import ModalPortal from '@/components/ModalPortal';

/**
 * CustomizePopup — modal for customizing a menu item (image, description,
 * variation groups, add-ons, qty stepper, live-updating "Add to Cart — ₦X").
 * Pass `itemId` to open; pass `null` (or call onClose) to close.
 */
export default function CustomizePopup({ itemId, onClose }) {
  const { addToCart } = useHolyGrill();
  const { play } = useSound();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [addonGroups, setAddonGroups] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState({});
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!itemId) return;
      setLoading(true);
      setQuantity(1);
      setNotes('');
      try {
        const [detail, addons] = await Promise.all([mockApi.menu.getItem(itemId), mockApi.menu.getAddons(itemId)]);
        setItem(detail);
        setAddonGroups(addons.addon_groups || []);
        const init = {};
        (detail.variation_groups || []).forEach((vg) => { init[vg.id] = []; });
        (addons.addon_groups || []).forEach((ag) => { init[ag.id] = []; });
        setSelections(init);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [itemId]);

  const toggleVariation = (groupId, optionId, max) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (max === 1) return { ...prev, [groupId]: [optionId] };
      if (current.includes(optionId)) return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      if (current.length < max) return { ...prev, [groupId]: [...current, optionId] };
      return prev;
    });
  };

  const toggleAddon = (groupId, addonId, max) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(addonId)) return { ...prev, [groupId]: current.filter((id) => id !== addonId) };
      if (current.length < max) return { ...prev, [groupId]: [...current, addonId] };
      return prev;
    });
  };

  const calculatePrice = () => {
    if (!item) return 0;
    let price = item.price;
    (item.variation_groups || []).forEach((vg) => { (selections[vg.id] || []).forEach((optId) => { const opt = vg.options.find((o) => o.id === optId); if (opt) price += opt.price_delta; }); });
    addonGroups.forEach((ag) => { (selections[ag.id] || []).forEach((aid) => { const ad = ag.addons.find((a) => a.id === aid); if (ad) price += ad.price; }); });
    return price * quantity;
  };

  const validate = () => {
    if (!item) return [];
    const errs = [];
    (item.variation_groups || []).forEach((vg) => { if (vg.is_required && (selections[vg.id] || []).length < vg.min_selections) errs.push(`"${vg.name}" requires ${vg.min_selections} selection(s)`); });
    addonGroups.forEach((ag) => { if (ag.is_required && (selections[ag.id] || []).length < ag.min_select) errs.push(`"${ag.name}" requires ${ag.min_select} selection(s)`); });
    return errs;
  };

  const handleAdd = async () => {
    if (validate().length > 0) return;
    setAdding(true);
    try {
      const selected_variations = [];
      (item.variation_groups || []).forEach((vg) => { (selections[vg.id] || []).forEach((optId) => selected_variations.push({ variation_group_id: vg.id, option_id: optId })); });
      const selected_addons = [];
      addonGroups.forEach((ag) => { (selections[ag.id] || []).forEach((aid) => selected_addons.push({ addon_id: aid, quantity: 1 })); });
      play('cart_add');
      await addToCart({ menu_item_id: item.id, quantity, notes, selected_variations, selected_addons });
      onClose();
    } catch (e) { console.error(e); }
    setAdding(false);
  };

  const errors = item ? validate() : [];
  const totalPrice = calculatePrice();

  return (
    <AnimatePresence>
      {itemId && (
        <ModalPortal>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="p-8 text-center text-sm text-cocoa-400">Loading...</div>
            ) : !item ? (
              <div className="p-8 text-center text-sm text-cocoa-400">Item not found</div>
            ) : (
              <>
                <div className="relative">
                  <img src={item.image_url} alt={item.name} className="w-full h-44 object-cover rounded-t-3xl" />
                  <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full flame-gradient text-white text-xs font-bold"><Flame className="w-3 h-3" />+{item.hp_earn_value} HP</div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="font-heading font-bold text-lg text-cocoa-800">{item.name}</h2>
                    <p className="text-sm text-cocoa-500 mt-1">{item.description}</p>
                    <div className="font-heading font-bold text-xl text-cocoa-800 mt-1">{formatNaira(item.price)}</div>
                  </div>

                  {(item.variation_groups || []).map((vg) => (
                    <div key={vg.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-bold text-sm text-cocoa-800">{vg.name}</h3>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-flame-50 text-flame-600">{vg.is_required ? 'Required' : 'Optional'}</span>
                      </div>
                      <div className="space-y-1.5">
                        {vg.options.map((opt) => {
                          const sel = (selections[vg.id] || []).includes(opt.id);
                          return (
                            <button key={opt.id} onClick={() => toggleVariation(vg.id, opt.id, vg.max_selections)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border ${sel ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${sel ? 'border-flame-600 bg-flame-600' : 'border-cocoa-300'}`}>{sel && <Check className="w-2.5 h-2.5 text-white" />}</div>
                                <span className="text-sm text-cocoa-700">{opt.name}</span>
                              </div>
                              {opt.price_delta > 0 && <span className="text-xs font-bold text-cocoa-500">+{formatNaira(opt.price_delta)}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {addonGroups.map((ag) => {
                    const availableAddons = (ag.addons || []).filter((ad) => ad.is_available !== false);
                    return (
                    <div key={ag.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-bold text-sm text-cocoa-800">{ag.name}</h3>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-flame-50 text-flame-600">{ag.is_required ? `Required · ${ag.min_select || 1}-${ag.max_select || 1}` : `Optional · up to ${ag.max_select || '∞'}`}</span>
                      </div>
                      <div className="space-y-1.5">
                        {availableAddons.map((ad) => {
                          const sel = (selections[ag.id] || []).includes(ad.id);
                          return (
                            <button key={ad.id} onClick={() => toggleAddon(ag.id, ad.id, ag.max_select)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border ${sel ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${sel ? 'border-flame-600 bg-flame-600' : 'border-cocoa-300'}`}>{sel && <Check className="w-2.5 h-2.5 text-white" />}</div>
                                <span className="text-sm text-cocoa-700">{ad.name}</span>
                              </div>
                              <span className="text-xs font-bold text-cocoa-500">{ad.price > 0 ? `+${formatNaira(ad.price)}` : 'Free'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}

                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions..." className="w-full p-3 rounded-xl border border-cocoa-200 text-sm resize-none focus:outline-none focus:border-flame-400" rows={2} />

                  {errors.length > 0 && <div className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle className="w-3.5 h-3.5" />{errors[0]}</div>}

                  <div className="sticky bottom-0 bg-white pt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-cocoa-50 rounded-full p-1">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full bg-white border border-cocoa-200 flex items-center justify-center"><Minus className="w-4 h-4 text-cocoa-600" /></button>
                      <span className="font-bold text-cocoa-800 w-5 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full bg-white border border-cocoa-200 flex items-center justify-center"><Plus className="w-4 h-4 text-cocoa-600" /></button>
                    </div>
                    <button onClick={handleAdd} disabled={item.is_sold_out || errors.length > 0 || adding} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full flame-gradient text-white font-bold text-sm shadow-lg disabled:opacity-50">
                      {adding ? 'Adding...' : <><ShoppingCart className="w-4 h-4" /> Add to Cart · {formatNaira(totalPrice)}</>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
}