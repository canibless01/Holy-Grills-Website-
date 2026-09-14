'use client';

import { useState } from 'react';
import { ChefHat, Settings, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface KitchenHeaderProps {
  isOpen: boolean;
  onToggleOpen: (nextState: boolean) => Promise<void>;
  onOpenSettings: () => void;
  isLoading?: boolean;
}

export function KitchenHeader({
  isOpen,
  onToggleOpen,
  onOpenSettings,
  isLoading = false,
}: KitchenHeaderProps) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleSwitchChange = (checked: boolean) => {
    if (!checked) {
      setShowCloseConfirm(true);
    } else {
      onToggleOpen(true);
    }
  };

  const confirmClose = async () => {
    setShowCloseConfirm(false);
    await onToggleOpen(false);
  };

  return (
    <>
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ChefHat size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Kitchen Operations
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isOpen
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isOpen ? '● Kitchen Open' : '○ Kitchen Closed'}
                </span>
              </div>
              <h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Kitchen Display System (KDS)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
              <Power size={16} className={isOpen ? 'text-emerald-500' : 'text-muted-foreground'} />
              <span className="text-xs font-medium text-foreground">
                {isOpen ? 'Open' : 'Closed'}
              </span>
              <Switch
                checked={isOpen}
                onCheckedChange={handleSwitchChange}
                disabled={isLoading}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              className="rounded-full"
              title="Kitchen Settings"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </section>

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Close Kitchen?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to CLOSE the kitchen? Users won't be able to checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClose}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
