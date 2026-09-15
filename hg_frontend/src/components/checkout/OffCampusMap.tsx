'use client';

import { useState } from 'react';
import { MapPin, LocateFixed, Check, Plus, Minus, Info } from 'lucide-react';

interface OffCampusMapProps {
  pin?: { lat: number; lng: number } | null;
  onPinChange?: (location: { lat: number; lng: number }) => void;
  onLocationSelect?: (locationName: string) => void;
  selectedGateId?: string | null;
  confirmed?: boolean;
  onConfirmLocation?: () => void;
  address?: string;
  onAddressChange?: (value: string) => void;
  landmark?: string;
  onLandmarkChange?: (value: string) => void;
}

export function OffCampusMap({
  pin,
  onPinChange,
  onLocationSelect,
  confirmed = false,
  onConfirmLocation,
  address = '',
  onAddressChange,
  landmark = '',
  onLandmarkChange,
}: OffCampusMapProps) {
  const [locating, setLocating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(15);

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
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative h-72 w-full rounded-2xl border border-border bg-[#E5E9F0] dark:bg-card overflow-hidden shadow-inner flex items-center justify-center">
        {/* Map Background Grid graphic simulation */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top-Left: Stacked Zoom Buttons */}
        <div className="absolute top-3 left-3 flex flex-col rounded-lg bg-card border border-border shadow-md overflow-hidden z-10">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 20))}
            className="p-2 text-foreground hover:bg-muted transition-colors border-b border-border"
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 1))}
            className="p-2 text-foreground hover:bg-muted transition-colors"
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
        </div>

        {/* Top-Right: Pill button with icon and text */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border text-xs font-bold text-foreground shadow-md hover:bg-muted transition-all active:scale-95"
          >
            <LocateFixed size={14} className="text-primary" />
            <span>{locating ? 'Locating...' : 'Use my GPS'}</span>
          </button>
        </div>

        {/* Centered Map Pin with Shadow */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg animate-bounce">
            <MapPin size={22} className="fill-current" />
          </div>
          <div className="h-2 w-6 rounded-full bg-black/30 blur-[2px] mt-1" />
        </div>
      </div>

      {/* Instruction Banner directly below map */}
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground">
        <Info size={18} className="text-primary shrink-0" />
        <p className="font-medium">
          Drag map or tap GPS to position the pin exactly over your door/gate.
        </p>
      </div>

      {/* Stacked Form Inputs */}
      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            EXACT ADDRESS / DESCRIPTION
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange?.(e.target.value)}
            placeholder="e.g. House 14, Opposite North Gate, South Gate Road"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            LANDMARK (OPTIONAL)
          </label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => onLandmarkChange?.(e.target.value)}
            placeholder="e.g. Near Mama T Buka / Beside Green Kiosk"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
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
              className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:bg-primary/90"
            >
              Confirm Spot
            </button>
          )}
        </div>
      )}
    </div>
  );
}
