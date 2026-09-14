import { useEffect, useState } from 'react';
import { Flame, Store, Truck, Bell, Shield, Mail, ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getFeatureFlags, updateFeatureFlag, type FeatureFlag } from '@/services/api/admin.service';

const AdminSettings = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [settings, setSettings] = useState({
    storeName: 'Holy Grills',
    storeEmail: 'hello@holygrills.com',
    storePhone: '08012345678',
    deliveryFee: '500',
    deliveryRadius: '5',
    avgDeliveryTime: '25',
    transactionalEmailProvider: 'resend',
    blastEmailProvider: 'resend',
    hpPerNaira: '0.01',
    minOrderAmount: '1500',
    orderNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  });

  useEffect(() => {
    getFeatureFlags()
      .then((flags) => {
        if (flags && flags.length > 0) setFeatureFlags(flags);
      })
      .catch(() => {
        // ignore fallback
      });
  }, []);

  const handleToggleFlag = async (flagName: string) => {
    const flag = featureFlags.find((f) => f.feature_name === flagName);
    if (!flag) return;
    const nextState = !flag.is_active;

    setFeatureFlags((prev) => prev.map((f) => (f.feature_name === flagName ? { ...f, is_active: nextState } : f)));
    try {
      await updateFeatureFlag(flagName, { is_active: nextState });
      toast.success(`Feature flag '${flagName}' updated`);
    } catch {
      toast.error('Failed to update feature flag');
      setFeatureFlags((prev) => prev.map((f) => (f.feature_name === flagName ? { ...f, is_active: !nextState } : f)));
    }
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-3xl space-y-6">
        {/* Feature Flags Section */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <ToggleLeft size={18} className="text-primary" />
            <h3 className="font-display font-bold text-foreground text-base">Feature Flags & Campus Toggles</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Database-driven feature toggles. Changes apply in real time.</p>
          <div className="space-y-3">
            {featureFlags.map((flag) => (
              <div key={flag.feature_name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm text-foreground font-body font-medium">{flag.feature_name}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{flag.description || 'Database feature flag toggle'}</p>
                </div>
                <button
                  onClick={() => handleToggleFlag(flag.feature_name)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    flag.is_active ? 'bg-primary' : 'bg-secondary'
                  } relative`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    flag.is_active ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Store size={18} className="text-primary" />
            <h3 className="font-display font-bold text-foreground text-base">Store Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'storeName', label: 'Store Name' },
              { key: 'storeEmail', label: 'Email' },
              { key: 'storePhone', label: 'Phone' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-muted-foreground font-body mb-1">{field.label}</label>
                <input
                  value={settings[field.key as keyof typeof settings] as string}
                  onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={18} className="text-primary" />
            <h3 className="font-display font-bold text-foreground text-base">Delivery Settings</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'deliveryFee', label: 'Delivery Fee (₦)' },
              { key: 'deliveryRadius', label: 'Radius (km)' },
              { key: 'avgDeliveryTime', label: 'Avg Time (min)' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-muted-foreground font-body mb-1">{field.label}</label>
                <input
                  type="number"
                  value={settings[field.key as keyof typeof settings] as string}
                  onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Email Delivery Settings */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-primary" />
            <h3 className="font-display font-bold text-foreground text-base">Email Delivery</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Configure separate email service providers for transactional messages vs broadcast blasts.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1">Transactional Provider</label>
              <select
                value={settings.transactionalEmailProvider}
                onChange={(e) => setSettings((s) => ({ ...s, transactionalEmailProvider: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="resend">Resend</option>
                <option value="onesignal">OneSignal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1">Blast Provider</label>
              <select
                value={settings.blastEmailProvider}
                onChange={(e) => setSettings((s) => ({ ...s, blastEmailProvider: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="resend">Resend</option>
                <option value="onesignal">OneSignal</option>
              </select>
            </div>
          </div>
        </div>

        {/* HP Config */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-accent" />
            <h3 className="font-display font-bold text-foreground text-base">Holy Points Configuration</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'hpPerNaira', label: 'HP per ₦1 spent' },
              { key: 'minOrderAmount', label: 'Min Order Amount (₦)' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-muted-foreground font-body mb-1">{field.label}</label>
                <input
                  type="number"
                  step="0.001"
                  value={settings[field.key as keyof typeof settings] as string}
                  onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-primary" />
            <h3 className="font-display font-bold text-foreground text-base">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: 'orderNotifications', label: 'New order notifications', desc: 'Get notified when a new order is placed' },
              { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive order summaries via email' },
              { key: 'smsNotifications', label: 'SMS notifications', desc: 'Get SMS alerts for urgent orders' },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-foreground font-body font-medium">{toggle.label}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{toggle.desc}</p>
                </div>
                <button
                  onClick={() => setSettings((s) => ({ ...s, [toggle.key]: !s[toggle.key as keyof typeof settings] }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings[toggle.key as keyof typeof settings] ? 'bg-primary' : 'bg-secondary'
                  } relative`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    settings[toggle.key as keyof typeof settings] ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-card rounded-xl border border-destructive/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-destructive" />
            <h3 className="font-display font-bold text-foreground text-base">Danger Zone</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground font-body font-medium">Maintenance Mode</p>
              <p className="text-[10px] text-muted-foreground font-body">Temporarily disable ordering</p>
            </div>
            <button
              onClick={() => setSettings((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
              className={`w-10 h-6 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-destructive' : 'bg-secondary'
              } relative`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                settings.maintenanceMode ? 'translate-x-4.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Save All Settings
        </button>
      </div>
  );
};

export default AdminSettings;
