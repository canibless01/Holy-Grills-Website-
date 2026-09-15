import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Clock, Home, MapPin, Phone, StickyNote, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useFulfillmentStore } from '@/stores/fulfillmentStore';
import { OffCampusMap } from '@/components/checkout/OffCampusMap';

interface FulfillmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PICKUP_SLOTS = [
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
];

const DELIVERY_ZONES = {
  'FUTA Core': ['South Gate', 'North Gate', 'School Gate'],
  'Campus Hostels': ['Akindeko', 'Jibowu', 'Akintola'],
  'Off Campus': ['Oba-Ile', 'Ilesha Garage', 'Alagbaka'],
};

export function FulfillmentDialog({ open, onOpenChange }: FulfillmentDialogProps) {
  const { method, deliveryInfo, pickupInfo, saveDelivery, savePickup, setMethod } = useFulfillmentStore();

  const [deliveryForm, setDeliveryForm] = useState(
    deliveryInfo ?? { zone: '', area: '', streetAddress: '', city: 'Akure', landmark: '', phone: '' }
  );
  const [pickupForm, setPickupForm] = useState(
    pickupInfo ?? {
      name: '',
      phone: '',
      riderName: '',
      pickupDate: '',
      pickupWindow: '',
      restaurantAddress: '',
      note: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeTab = useMemo(() => method, [method]);

  const validateDelivery = () => {
    const e: Record<string, string> = {};
    if (!deliveryForm.streetAddress.trim()) e.streetAddress = 'Address is required';
    if (!deliveryForm.zone.trim()) e.zone = 'Zone is required';
    if (!deliveryForm.area.trim()) e.area = 'Area is required';
    if (!deliveryForm.city.trim()) e.city = 'City is required';
    if (!deliveryForm.phone.trim()) e.phone = 'Phone is required';
    else if (!/^0[789]\d{9}$/.test(deliveryForm.phone.trim())) e.phone = 'Enter a valid Nigerian phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePickup = () => {
    const e: Record<string, string> = {};
    if (!pickupForm.name.trim()) e.name = 'Name is required';
    if (!pickupForm.phone.trim()) e.phone = 'Phone is required';
    else if (!/^0[789]\d{9}$/.test(pickupForm.phone.trim())) e.phone = 'Enter a valid Nigerian phone number';
    if (!pickupForm.pickupDate.trim()) e.pickupDate = 'Date is required';
    if (!pickupForm.pickupWindow.trim()) e.pickupWindow = 'Select a window';
    if (!pickupForm.restaurantAddress.trim()) e.restaurantAddress = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDeliverySave = () => {
    if (!validateDelivery()) return;
    saveDelivery({
      zone: deliveryForm.zone.trim(),
      area: deliveryForm.area.trim(),
      streetAddress: deliveryForm.streetAddress.trim(),
      city: deliveryForm.city.trim(),
      landmark: deliveryForm.landmark?.trim(),
      phone: deliveryForm.phone.trim(),
    });
    toast.success('Delivery info saved');
    onOpenChange(false);
  };

  const handlePickupSave = () => {
    if (!validatePickup()) return;
    savePickup({
      name: pickupForm.name.trim(),
      phone: pickupForm.phone.trim(),
      riderName: pickupForm.riderName?.trim(),
      pickupDate: pickupForm.pickupDate.trim(),
      pickupWindow: pickupForm.pickupWindow.trim(),
      restaurantAddress: pickupForm.restaurantAddress.trim(),
      note: pickupForm.note?.trim(),
    });
    toast.success('Pickup info saved');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="max-w-3xl w-full p-0 overflow-hidden rounded-t-2xl sm:rounded-lg
                 left-1/2 top-auto bottom-0 translate-x-[-50%] translate-y-0
                 sm:top-1/2 sm:bottom-auto sm:translate-y-[-50%]
                 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4"
    >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-display text-xl">Delivery or Pickup</DialogTitle>
          <p className="text-sm text-muted-foreground font-body">
            Choose your fulfillment method, fill the form, and we’ll remember it for checkout.
          </p>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(val) => setMethod(val as 'delivery' | 'pickup')}>
            <TabsList className="mb-4">
              <TabsTrigger value="delivery" className="gap-2">
                <Home size={14} /> Home Delivery
              </TabsTrigger>
              <TabsTrigger value="pickup" className="gap-2">
                <Clock size={14} /> Pickup Window
              </TabsTrigger>
            </TabsList>

            <TabsContent value="delivery">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'streetAddress', label: 'Street Address', placeholder: 'e.g. Obakekere, behind FUTA gate' },
                  { key: 'city', label: 'City', placeholder: 'Akure' },
                  { key: 'landmark', label: 'Landmark (optional)', placeholder: 'Near...' },
                  { key: 'phone', label: 'Phone Number', placeholder: '08012345678' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-1">
                      {field.key === 'streetAddress' && <MapPin size={14} className="text-primary" />}
                      {field.key === 'city' && <Home size={14} className="text-primary" />}
                      {field.key === 'landmark' && <StickyNote size={14} className="text-primary" />}
                      {field.key === 'phone' && <Phone size={14} className="text-primary" />}
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={deliveryForm[field.key as keyof typeof deliveryForm]}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    {errors[field.key] && <p className="text-destructive text-xs font-body mt-1">{errors[field.key]}</p>}
                  </div>
                ))}
                <div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-1">
                    <MapPin size={14} className="text-primary" />
                    Delivery Zone
                  </label>
                  <select
                    value={deliveryForm.zone}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, zone: e.target.value, area: '' }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a zone</option>
                    {Object.keys(DELIVERY_ZONES).map((zone) => <option key={zone} value={zone}>{zone}</option>)}
                  </select>
                  {errors.zone && <p className="text-destructive text-xs font-body mt-1">{errors.zone}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-1">
                    <Home size={14} className="text-primary" />
                    Delivery Area
                  </label>
                  <select
                    value={deliveryForm.area}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, area: e.target.value }))}
                    disabled={!deliveryForm.zone}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                  >
                    <option value="">Select an area</option>
                    {(DELIVERY_ZONES[deliveryForm.zone as keyof typeof DELIVERY_ZONES] ?? []).map((area) => <option key={area} value={area}>{area}</option>)}
                  </select>
                  {errors.area && <p className="text-destructive text-xs font-body mt-1">{errors.area}</p>}
                </div>
              </div>

              {/* Off-Campus Map Location Picker */}
              <div className="mt-4">
                <OffCampusMap
                  onLocationSelect={(locationName) => {
                    setDeliveryForm((prev) => ({
                      ...prev,
                      zone: prev.zone || 'Off Campus',
                      area: prev.area || locationName,
                      streetAddress: prev.streetAddress ? `${prev.streetAddress} (${locationName})` : locationName,
                    }));
                  }}
                />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                  <CheckCircle2 size={14} className="text-success" />
                  We’ll deliver to this address and contact your phone if needed.
                </div>
                <button
                  onClick={handleDeliverySave}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:bg-primary-hover transition-colors"
                >
                  Save Delivery Info
                </button>
              </div>
            </TabsContent>

            <TabsContent value="pickup">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Your Name', placeholder: 'e.g. Ada Lovelace', icon: UserRound },
                  { key: 'phone', label: 'Phone Number', placeholder: '08012345678', icon: Phone },
                  { key: 'riderName', label: "Rider's Name (optional)", placeholder: 'Who is picking up?', icon: UserRound },
                  { key: 'pickupDate', label: 'Pickup Date', placeholder: 'Select a date', icon: Clock, type: 'date' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-1">
                      <field.icon size={14} className="text-primary" />
                      {field.label}
                    </label>
                    <input
                      type={field.type || 'text'}
                      value={pickupForm[field.key as keyof typeof pickupForm]}
                      onChange={(e) => setPickupForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    {errors[field.key] && <p className="text-destructive text-xs font-body mt-1">{errors[field.key]}</p>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-1">
                    <Clock size={14} className="text-primary" />
                    Pickup Window
                  </label>
                  <select
                    value={pickupForm.pickupWindow}
                    onChange={(e) => setPickupForm((prev) => ({ ...prev, pickupWindow: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a window</option>
                    {PICKUP_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  {errors.pickupWindow && <p className="text-destructive text-xs font-body mt-1">{errors.pickupWindow}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-1">
                    <MapPin size={14} className="text-primary" />
                    Restaurant Address
                  </label>
                  <input
                    type="text"
                    value={pickupForm.restaurantAddress}
                    onChange={(e) => setPickupForm((prev) => ({ ...prev, restaurantAddress: e.target.value }))}
                    placeholder="Opposite FUTA South Gate..."
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.restaurantAddress && <p className="text-destructive text-xs font-body mt-1">{errors.restaurantAddress}</p>}
                </div>
              </div>

              <div className="mt-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-1">
                  <StickyNote size={14} className="text-primary" />
                  Notes (optional)
                </label>
                <textarea
                  value={pickupForm.note}
                  onChange={(e) => setPickupForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Anything we should know? e.g. rider will call on arrival."
                  className="w-full min-h-[100px] px-3 py-3 rounded-lg bg-secondary border border-border text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                  <CheckCircle2 size={14} className="text-success" />
                  We’ll prep your order to hit the window you select.
                </div>
                <button
                  onClick={handlePickupSave}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:bg-primary-hover transition-colors"
                >
                  Save Pickup Info
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
