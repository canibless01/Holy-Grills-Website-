import { describe, expect, it } from 'vitest';
import { mapMenuItem } from '../services/api/menu.service';

describe('mapMenuItem', () => {
  it('correctly maps secret item flag and variation/addon groups', () => {
    const raw = {
      id: 'test-item-1',
      name: 'Secret Burger',
      description: 'Hidden gem',
      price: 2500,
      image_url: 'https://example.com/burger.jpg',
      category: 'Burgers',
      hp_earn: 20,
      is_available: true,
      is_secret: true,
      hp_multiplier: 1.5,
      variation_groups: [
        {
          id: 'vg-1',
          name: 'Spice Level',
          is_required: true,
          min_selections: 1,
          max_selections: 1,
          options: [
            { id: 'vo-1', name: 'Mild', price_delta: 0, is_available: true },
            { id: 'vo-2', name: 'Hot', price_delta: 100, is_available: true },
          ],
        },
      ],
      addon_groups: [
        {
          id: 'ag-1',
          name: 'Extra Sauces',
          is_required: false,
          min_select: 0,
          max_select: 2,
          addons: [
            { id: 'ao-1', name: 'Garlic Mayo', price: 200, is_available: true },
          ],
        },
      ],
    };

    const mapped = mapMenuItem(raw, 0);
    expect(mapped.id).toBe('test-item-1');
    expect(mapped.name).toBe('Secret Burger');
    expect(mapped.isSecret).toBe(true);
    expect(mapped.variationGroups).toHaveLength(1);
    expect(mapped.variationGroups?.[0].name).toBe('Spice Level');
    expect(mapped.addonGroups).toHaveLength(1);
    expect(mapped.addonGroups?.[0].addons?.[0].name).toBe('Garlic Mayo');
  });
});
