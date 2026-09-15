import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, AlertTriangle } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { useSound } from '@/lib/SoundProvider';
import { toast } from '@/components/ui/use-toast';
import MenuItemCard from '@/components/MenuItemCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Menu() {
  const navigate = useNavigate();
  const { addToCart } = useHolyGrill();
  const { play } = useSound();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [kitchen, setKitchen] = useState(null);
  const [windowStatus, setWindowStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    mockApi.menu.getCategories().then(setCategories).catch((e) => console.error(e));
    mockApi.orders.getDeliveryWindowStatus().then(setWindowStatus).catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory) params.category = activeCategory;
        if (search) params.q = search;
        params.available_only = 'false';
        const result = await mockApi.menu.getItems(params);
        setItems(result.items);
        setKitchen(result.kitchen);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [activeCategory, search]);

  /* Quick add — if the item needs required modifiers we send the user to the
   * detail page so they can pick, instead of opening a popup. */
  const handleAdd = async (item) => {
    const detail = await mockApi.menu.getItem(item.id);
    const addons = await mockApi.menu.getAddons(item.id);
    const hasRequired = (detail.variation_groups || []).some((vg) => vg.is_required) || (addons.addon_groups || []).some((ag) => ag.is_required);
    if (!hasRequired) {
      play('cart_add');
      await addToCart({ menu_item_id: item.id, quantity: 1 });
      toast({ title: '🔥 Added to your cart', description: `${item.name} is ready to checkout.` });
    } else {
      navigate(`/menu/${item.id}`);
    }
  };

  const open = windowStatus?.is_open;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <span className="hg-eyebrow">Selar-aligned menu</span>
        <h1 className="font-heading font-bold text-xl text-cocoa-800">Real Grill. Real Flavour. 🔥</h1>
        <p className="text-sm text-cocoa-600 mt-1">Flame-grilled proteins + crispy sides — made with the Holy Flame Method.</p>
      </div>

      {/* Compact kitchen status strip */}
      {windowStatus && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${open ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <span className="relative flex h-2 w-2">
            {open && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${open ? 'bg-green-500' : 'bg-red-500'}`} />
          </span>
          <Clock className="w-3.5 h-3.5" />
          <span>{open ? `Kitchen open · ${windowStatus.active_window?.label || 'ordering live'}` : `Kitchen closed · ${windowStatus.message || 'back soon'}`}</span>
          {kitchen?.is_at_capacity && <span className="ml-auto flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3 h-3" /> at capacity</span>}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
        <input
          type="text"
          placeholder="Search the grill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-cocoa-400" />
          </button>
        )}
      </div>

      {/* Category pills — the one legitimate use of pill chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            !activeCategory ? 'bg-flame-600 text-white shadow-sm' : 'bg-white text-cocoa-600 border border-cocoa-200'
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat.slug ? 'bg-flame-600 text-white shadow-sm' : 'bg-white text-cocoa-600 border border-cocoa-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items — single column on all viewports, centered with wide margins on desktop */}
      {loading ? (
        <LoadingSpinner label="Loading menu..." />
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm text-cocoa-400">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={handleAdd} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
}