'use client';

import { useState } from 'react';
import { MapPin, LocateFixed, Check } from 'lucide-react';

interface OffCampusMapProps {
  pin?: { lat: number; lng: number } | null;
  onPinChange?: (location: { lat: number; lng: number }) => void;
  onLocationSelect?: (locationName: string) => void;
  selectedGateId?: string | null;
  confirmed?: boolean;
  onConfirmLocation?: () => void;
}

export function OffCampusMap({
  pin,
  onPinChange,
  onLocationSelect,
  confirmed = false,
  onConfirmLocation,
}: OffCampusMapProps) {
  const [locating, setLocating] = useState(false);

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (onPinChange) onPinChange(location);
        if (onLocationSelect) onLocationSelect(`GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative h-64 w-full rounded-2xl border border-border bg-secondary/60 flex items-center justify-center overflow-hidden p-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <MapPin size={24} />
          </div>
          <p className="font-display font-semibold text-sm text-foreground">Off-Campus Interactive Location Pin</p>
          <p className="text-xs text-muted-foreground">FUTA Off-Campus Delivery Zone Map</p>
        </div>

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-foreground shadow-sm hover:bg-muted"
        >
          <LocateFixed size={14} className="text-primary" />
          {locating ? 'Locating...' : 'Use my GPS'}
        </button>
      </div>

      {pin && (
        <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <span className="font-semibold text-foreground">Pin: {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</span>
          </div>
          {confirmed ? (
            <span className="flex items-center gap-1 text-emerald-600 font-bold"><Check size={14} /> Confirmed</span>
          ) : (
            <button
              onClick={onConfirmLocation}
              className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-bold text-xs"
            >
              Confirm Spot
            </button>
          )}
        </div>
      )}
    </div>
  );
}
