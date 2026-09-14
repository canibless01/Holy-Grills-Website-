import { Building2, Check, MapPin, X } from 'lucide-react';
import { useCampus } from '@/context/CampusContext';

export const CampusSelectorModal = () => {
  const { selectedCampus, setSelectedCampus, campuses, isSelectorOpen, setIsSelectorOpen } = useCampus();

  if (!isSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            <h3 className="font-display font-bold text-foreground text-lg">Select Your Campus</h3>
          </div>
          <button onClick={() => setIsSelectorOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">Select your university campus to view active delivery windows, local menu availability, and campus promos.</p>

        <div className="space-y-2">
          {campuses.map((campus) => {
            const isSelected = campus.id === selectedCampus.id;

            return (
              <button
                key={campus.id}
                onClick={() => {
                  setSelectedCampus(campus);
                  setIsSelectorOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  isSelected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-secondary/40 text-foreground hover:bg-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={16} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="text-sm">{campus.name}</span>
                </div>
                {isSelected && <Check size={16} className="text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
