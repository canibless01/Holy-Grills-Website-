import React from 'react';
import { Check, Plus } from 'lucide-react';
import { formatNaira } from '@/lib/hgUtils';

/**
 * ItemOptionGroup — renders a single variation or add-on group for a menu item.
 *
 * Field-name differences between the two group types (backend contract):
 *   Variation groups → min_selections / max_selections / options[].price_delta
 *   Add-on groups     → min_select / max_select / addons[].price
 * Both option types expose `is_available` (false → "Out of stock" pill).
 *
 * Selection rules:
 *   max === 1 → radio-style (selecting one replaces the other)
 *   max >  1 → multi-select up to max
 * The live "(N/min selected)" counter turns green once the requirement is met.
 */
export default function ItemOptionGroup({ group, type, selections, onToggle, disabled }) {
  const isVariation = type === 'variation';
  const minSel = isVariation ? group.min_selections : group.min_select;
  const maxSel = isVariation ? group.max_selections : group.max_select;
  const options = isVariation ? (group.options || []) : (group.addons || []);
  const priceKey = isVariation ? 'price_delta' : 'price';
  const selected = selections[group.id] || [];
  const requirementMet = !group.is_required || selected.length >= (minSel || 0);

  return (
    <div className="hg-card">
      {/* Group header — name + Required/Optional badge */}
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="hg-section-title">{group.name}</h3>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${group.is_required ? 'bg-flame-100 text-flame-700' : 'bg-cocoa-100 text-cocoa-500'}`}>
          {group.is_required ? 'Required' : 'Optional'}
        </span>
      </div>

      {/* Selection counter — "SELECT N (X/N selected)" */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wide text-cocoa-400">
          {minSel > 0 ? `SELECT ${minSel}` : `SELECT UP TO ${maxSel}`}
        </span>
        <span className={`text-[11px] font-bold ${requirementMet ? 'text-green-600' : group.is_required ? 'text-flame-600' : 'text-cocoa-400'}`}>
          ({selected.length}/{minSel > 0 ? minSel : maxSel} selected)
        </span>
      </div>

      {/* Option rows */}
      <div className="space-y-2">
        {options.map((opt) => {
          const optId = opt.id;
          const isSel = selected.includes(optId);
          const unavailable = opt.is_available === false;
          return (
            <div
              key={optId}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                unavailable
                  ? 'border-cocoa-100 bg-cocoa-50/60'
                  : isSel
                    ? 'border-flame-400 bg-flame-50'
                    : 'border-cocoa-200 hover:border-cocoa-300'
              }`}
            >
              <button
                type="button"
                onClick={() => !unavailable && !disabled && onToggle(group.id, optId, maxSel)}
                disabled={unavailable || disabled}
                className="flex items-center gap-3 flex-1 text-left disabled:cursor-not-allowed"
              >
                <span className={`text-sm font-medium ${unavailable ? 'text-cocoa-300' : 'text-cocoa-700'}`}>{opt.name}</span>
              </button>

              {unavailable ? (
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-red-500 border border-red-100">
                  Out of stock
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-cocoa-500">+ {formatNaira(opt[priceKey] || 0)}</span>
                  <button
                    type="button"
                    onClick={() => !disabled && onToggle(group.id, optId, maxSel)}
                    disabled={disabled}
                    aria-label={isSel ? `Remove ${opt.name}` : `Add ${opt.name}`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isSel
                        ? 'bg-flame-600 text-white shadow-sm'
                        : 'bg-white border-2 border-cocoa-200 text-cocoa-400 hover:border-flame-400 hover:text-flame-500'
                    }`}
                  >
                    {isSel ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}