import { useState } from 'react';
import { Heart, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { formatPrice } from '@/data/menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CartItem, MenuItem } from '@/types';

interface CartLineCardProps {
  mode: 'cart' | 'saved';
  item: CartItem | MenuItem;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onRemove?: () => void;
  onMoveToCart?: () => void;
  onMoveToSaved?: () => void;
}

export function CartItemCard({ mode, item, quantity = 0, onIncrement, onDecrement, onRemove, onMoveToCart, onMoveToSaved }: CartLineCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const cartItem = item as CartItem;
  const menuItem = item as MenuItem;
  const detailText = cartItem.sizeLabel
    ? `${cartItem.sizeLabel}${cartItem.extras?.length ? ` · ${cartItem.extras.join(', ')}` : ''}`
    : menuItem.tagLine || menuItem.category;

  const handleDeleteClick = () => {
    if (mode === 'cart') {
      setShowDeleteDialog(true);
      return;
    }

    onRemove?.();
  };

  const handleDeletePermanently = () => {
    onRemove?.();
    setShowDeleteDialog(false);
  };

  const handleSaveToFavourite = () => {
    onMoveToSaved?.();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex gap-4 rounded-3xl border border-border bg-card p-4">
        <img src={item.imageUrl} alt={item.name} className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-bold text-foreground">{item.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{detailText}</p>
              </div>
              <button onClick={handleDeleteClick} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive" aria-label={`Remove ${item.name}`}>
                <Trash2 size={16} />
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">{formatPrice(item.price)}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {mode === 'cart' ? (
              <div className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1">
                <button onClick={onDecrement} className="rounded-full p-1.5 text-foreground transition-colors hover:bg-background" aria-label="Decrease quantity">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-foreground">{quantity}</span>
                <button onClick={onIncrement} className="rounded-full bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary-hover" aria-label="Increase quantity">
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                <Heart size={14} className="text-primary" /> Saved for later
              </span>
            )}

            <div className="flex flex-wrap gap-2">
              {mode === 'saved' ? (
                <button onClick={onMoveToCart} className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
                  <ShoppingCart size={14} /> Move to cart
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {mode === 'cart' ? (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-sm rounded-[1.75rem] border-border p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-foreground">Remove {item.name}?</DialogTitle>
              <DialogDescription>
                Choose whether to remove this item permanently from your cart or save it to your favourites for later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:flex-col sm:space-x-0">
              <button
                onClick={handleDeletePermanently}
                className="w-full rounded-full bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
              >
                Delete permanently
              </button>
              <button
                onClick={handleSaveToFavourite}
                className="w-full rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Save to favourite
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
