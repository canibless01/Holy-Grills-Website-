'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KitchenSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Record<string, string>;
  onSaveSettings: (settings: Record<string, string>) => Promise<void>;
}

export function KitchenSettingsModal({
  open,
  onOpenChange,
  settings,
  onSaveSettings,
}: KitchenSettingsModalProps) {
  const [maxRadius, setMaxRadius] = useState('10.0');
  const [prepCapacity, setPrepCapacity] = useState('50');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.max_delivery_radius_km) {
      setMaxRadius(settings.max_delivery_radius_km);
    }
    if (settings.max_prep_capacity) {
      setPrepCapacity(settings.max_prep_capacity);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings({
        ...settings,
        max_delivery_radius_km: maxRadius,
        max_prep_capacity: prepCapacity,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Kitchen Settings & Limits</DialogTitle>
          <DialogDescription>
            Configure capacity limits and delivery parameters for kitchen dispatch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="max-radius">Max Delivery Radius (km)</Label>
            <Input
              id="max-radius"
              type="number"
              step="0.5"
              value={maxRadius}
              onChange={(e) => setMaxRadius(e.target.value)}
              placeholder="10.0"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Off-campus locations beyond this radius will receive distance errors.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prep-capacity">Kitchen Capacity Limit (Orders)</Label>
            <Input
              id="prep-capacity"
              type="number"
              value={prepCapacity}
              onChange={(e) => setPrepCapacity(e.target.value)}
              placeholder="50"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Maximum concurrent orders permitted in preparation queue.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
