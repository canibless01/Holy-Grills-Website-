import React, { useState, useCallback } from 'react';
import { Search, Package, Users, UtensilsCrossed, X, ArrowRight, Tag } from 'lucide-react';
import { liveApi } from '@/lib/liveApi';
import { toast } from '@/components/ui/use-toast';

const CATEGORIES = [
  { id: 'orders', label: 'Orders', icon: Package, color: 'text-flame-600' },
  { id: 'users', label: 'Users', icon: Users, color: 'text-blue-600' },
  { id: 'promos', label: 'Promo Codes', icon: Tag, color: 'text-purple-600' },
  { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed, color: 'text-green-600' },
];

/**
 * AdminGlobalSearch — a search overlay that queries the backend for orders,
 * users, events, and menu items in one call. Results are grouped by category
 * and clicking a result navigates to the relevant admin tab.
 *
 * Backend: GET /admin/search?q=<query>
 */
export default function AdminGlobalSearch({ onNavigate }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await liveApi.admin.globalSearch(query.trim());
      setResults(res || {});
    } catch { setResults({}); }
    setLoading(false);
  }, []);

  const handleInput = (val) => {
    setQ(val);
    const debounce = setTimeout(() => search(val), 350);
    return () => clearTimeout(debounce);
  };

  const handleResultClick = (category) => {
    if (onNavigate) onNavigate(category);
    setQ('');
    setResults(null);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-cocoa-400" />
        <input
          value={q}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search orders, users, events..."
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-cocoa-200 text-sm bg-white"
        />
        {q && (
          <button onClick={() => { setQ(''); setResults(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-cocoa-100">
            <X className="w-3.5 h-3.5 text-cocoa-400" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {q.trim().length >= 2 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white rounded-2xl border border-cocoa-200 shadow-lg max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-cocoa-400">Searching...</div>
          ) : !results || Object.keys(results).length === 0 ? (
            <div className="p-4 text-center text-sm text-cocoa-400">No results found.</div>
          ) : (
            CATEGORIES.map((cat) => {
              const items = results[cat.id] || [];
              if (!items.length) return null;
              const Icon = cat.icon;
              return (
                <div key={cat.id} className="border-b border-cocoa-100 last:border-0">
                  <div className="flex items-center gap-2 px-3 py-2 bg-cocoa-50">
                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                    <span className="text-xs font-bold text-cocoa-600 uppercase tracking-wider">{cat.label}</span>
                    <span className="text-xs text-cocoa-400">({items.length})</span>
                  </div>
                  {items.slice(0, 5).map((item, i) => (
                    <button key={item.id || i} onClick={() => handleResultClick(cat.id)} className="w-full text-left px-3 py-2 hover:bg-cocoa-50 transition-colors flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-cocoa-800 truncate">
                          {item.title || item.name || item.organizer_name || `#${item.id?.slice?.(-6) || item.id}`}
                        </div>
                        {item.email && <div className="text-xs text-cocoa-400 truncate">{item.email}</div>}
                        {item.status && <div className="text-[10px] text-cocoa-400 capitalize">{item.status}</div>}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-cocoa-300 shrink-0" />
                    </button>
                  ))}
                  {items.length > 5 && (
                    <button onClick={() => handleResultClick(cat.id)} className="w-full text-center py-2 text-xs font-bold text-flame-600 hover:bg-cocoa-50">
                      View all {items.length} results →
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}