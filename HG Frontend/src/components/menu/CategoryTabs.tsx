import { useRef } from 'react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onChange }: CategoryTabsProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
            activeCategory === cat
              ? 'bg-primary text-primary-foreground shadow-glow'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-border'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
