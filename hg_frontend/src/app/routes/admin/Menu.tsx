import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORIES, formatPrice } from '@/data/menu';
import type { MenuItem } from '@/types';
import { Plus, Edit3, Trash2, Search, X, Eye, EyeOff } from 'lucide-react';
import { HPBadge } from '@/components/hp/HPBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getMenuItems } from '@/services/api/menu.service';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface ManagedMenuItem extends MenuItem {
  addOnEditor?: string;
  itemOrderCap?: number;
  dailyOrderCap?: number;
}

const AdminMenu = () => {
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: getMenuItems,
  });
  const [items, setItems] = useState<ManagedMenuItem[]>([]);

  useEffect(() => {
    setItems(
      menuItems.map((item) => ({
        ...item,
        addOnEditor: item.extras?.map((extra) => extra.title).join(', ') ?? '',
        itemOrderCap: 40,
        dailyOrderCap: 200,
      })),
    );
  }, [menuItems]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
        const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [categoryFilter, items, search],
  );

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i))
    );
    toast.success('Availability updated');
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Item deleted');
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const openNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleSave = (formData: Partial<ManagedMenuItem>) => {
    if (editingItem) {
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? { ...i, ...formData } : i)));
      toast.success('Item updated');
    } else {
      const newItem: ManagedMenuItem = {
        id: `new-${Date.now()}`,
        name: formData.name || 'New Item',
        description: formData.description || '',
        price: formData.price || 0,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        category: formData.category || 'Burgers',
        hpValue: formData.hpValue || 10,
        isAvailable: true,
        addOnEditor: formData.addOnEditor || '',
        itemOrderCap: formData.itemOrderCap || 0,
        dailyOrderCap: formData.dailyOrderCap || 0,
      };
      setItems((prev) => [...prev, newItem]);
      toast.success('Item created');
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading menu catalogue…</p> : null}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                categoryFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={openNew}
          className="shrink-0 px-4 py-2 rounded-lg bg-gradient-fire text-primary-foreground font-body font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-card rounded-xl border border-border overflow-hidden group ${!item.isAvailable ? 'opacity-60' : ''}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute top-2 right-2">
                <HPBadge value={item.hpValue} variant="available" />
              </div>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-secondary/80 backdrop-blur text-[10px] font-body text-foreground font-medium">
                  {item.category}
                </span>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-card border border-border text-foreground hover:bg-secondary transition-colors">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => toggleAvailability(item.id)} className="p-2 rounded-lg bg-card border border-border text-foreground hover:bg-secondary transition-colors">
                  {item.isAvailable ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-display font-bold text-foreground text-sm truncate">{item.name}</h3>
              <p className="text-[10px] text-muted-foreground font-body line-clamp-1 mt-0.5">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-display font-bold text-primary text-base">{formatPrice(item.price)}</span>
                <span className={`text-[10px] font-body font-medium px-1.5 py-0.5 rounded-full ${item.isAvailable ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {item.isAvailable ? 'Available' : 'Hidden'}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Cap: {item.itemOrderCap ?? 0}/item • {item.dailyOrderCap ?? 0}/day</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {showForm && (
          <MenuItemForm
            item={editingItem}
            onSave={handleSave}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

function MenuItemForm({
  item,
  onSave,
  onClose,
}: {
  item: ManagedMenuItem | null;
  onSave: (data: Partial<ManagedMenuItem>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price?.toString() || '',
    category: item?.category || 'Burgers',
    hpValue: item?.hpValue?.toString() || '10',
    imageUrl: item?.imageUrl || '',
    addOnEditor: item?.addOnEditor || '',
    itemOrderCap: item?.itemOrderCap?.toString() || '40',
    dailyOrderCap: item?.dailyOrderCap?.toString() || '200',
    isSecret: item?.isSecret || false,
    hpMultiplier: item?.hpMultiplier?.toString() || '1.0',
    dailyLimit: item?.dailyLimit?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      description: form.description,
      price: parseInt(form.price) || 0,
      category: form.category,
      hpValue: parseInt(form.hpValue) || 10,
      imageUrl: form.imageUrl,
      addOnEditor: form.addOnEditor,
      itemOrderCap: parseInt(form.itemOrderCap) || 0,
      dailyOrderCap: parseInt(form.dailyOrderCap) || 0,
      isSecret: form.isSecret,
      hpMultiplier: parseFloat(form.hpMultiplier) || 1.0,
      dailyLimit: form.dailyLimit ? parseInt(form.dailyLimit) : undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-card rounded-xl border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-display font-bold text-foreground text-lg mb-5">
          {item ? 'Edit Item' : 'New Menu Item'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <ImageUploader
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              label="Item Image (Cloudinary Direct Upload)"
              folder="menu_items"
            />
          </div>

          {[
            { key: 'name', label: 'Name', type: 'text', placeholder: 'Holy Smash Burger' },
            { key: 'description', label: 'Description', type: 'text', placeholder: 'Describe the item...' },
            { key: 'price', label: 'Price (₦)', type: 'number', placeholder: '3500' },
            { key: 'hpValue', label: 'HP Value', type: 'number', placeholder: '15' },
            { key: 'addOnEditor', label: 'Add-on editor', type: 'text', placeholder: 'Sauce, extra spice...' },
            { key: 'itemOrderCap', label: 'Per-item order cap', type: 'number', placeholder: '40' },
            { key: 'dailyOrderCap', label: 'Total daily order cap', type: 'number', placeholder: '200' },
            { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://...' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs text-muted-foreground font-body mb-1">{field.label}</label>
              <input
                type={field.type}
                value={String(form[field.key as keyof typeof form] ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-muted-foreground font-body mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-b border-border">
            <div>
              <p className="text-xs font-semibold text-foreground">Hidden — only found by search</p>
              <p className="text-[10px] text-muted-foreground">Excludes item from main menu grid unless searched by name</p>
            </div>
            <input
              type="checkbox"
              checked={form.isSecret}
              onChange={(e) => setForm((f) => ({ ...f, isSecret: e.target.checked }))}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground font-body font-medium text-sm hover:bg-border transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-gradient-fire text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity">
              {item ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default AdminMenu;
