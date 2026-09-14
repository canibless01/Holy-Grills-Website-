import { motion } from 'framer-motion';
import { Link } from '@/lib/router';
import { Plus, Minus } from 'lucide-react';
import { HPBadge } from '@/components/hp/HPBadge';
import { formatPrice } from '@/data/menu';
import type { MenuItem } from '@/types';

interface FoodCardProps extends MenuItem {
  quantityInCart?: number;
  onAddToCart: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
}

export function FoodCard({
  id, name, description, price, imageUrl, hpValue, isAvailable,
  quantityInCart = 0, onAddToCart, onUpdateQuantity,
}: FoodCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={`group relative rounded-lg overflow-hidden bg-card shadow-card border border-border ${
        !isAvailable ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <Link to={`/menu/${id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <HPBadge value={hpValue} variant="available" />
        </div>
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="text-sm font-semibold text-muted-foreground font-body">Unavailable</span>
          </div>
        )}
      </Link>

      <div className="p-4 space-y-2">
        <Link to={`/menu/${id}`} className="block">
          <h3 className="font-display font-bold text-foreground text-base leading-tight truncate hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground font-body line-clamp-2">{description}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="font-display font-bold text-primary text-lg">{formatPrice(price)}</span>

          {quantityInCart > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(id, quantityInCart - 1)}
                className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold font-body w-5 text-center text-foreground">{quantityInCart}</span>
              <button
                onClick={() => onUpdateQuantity(id, quantityInCart + 1)}
                className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddToCart(id)}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold font-body hover:bg-primary-hover transition-colors"
            >
              Add to Cart
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
