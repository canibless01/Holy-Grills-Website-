'use client';

import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';

interface AddressItem { id: string; label: string; line: string; city: string; isDefault?: boolean }

const AddressesPage = () => {
  const [addresses, setAddresses] = useState<AddressItem[]>([
    { id: 'addr-1', label: 'Hostel', line: 'Akindeko Hostel Block B', city: 'Akure', isDefault: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', line: '', city: 'Akure' });

  const addAddress = () => {
    if (!form.label.trim() || !form.line.trim()) return;
    setAddresses((prev) => [...prev, { id: `addr-${Date.now()}`, label: form.label, line: form.line, city: form.city }]);
    setForm({ label: '', line: '', city: 'Akure' });
    setShowForm(false);
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="flex items-center justify-between rounded-[2rem] border border-border bg-card p-5">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Addresses</h1>
            <p className="text-sm text-muted-foreground">Save delivery addresses for faster checkout.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus size={14} /> Add</button>
        </section>

        <section className="space-y-2">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <MapPin size={16} className="mt-1 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{address.label} {address.isDefault ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Default</span> : null}</p>
                <p className="text-xs text-muted-foreground">{address.line}, {address.city}</p>
              </div>
              <button onClick={() => setAddresses((prev) => prev.filter((entry) => entry.id !== address.id))} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"><Trash2 size={14} /></button>
            </div>
          ))}
        </section>
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-card p-5" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-display text-xl font-bold text-foreground">New address</h3>
            <div className="mt-3 space-y-2">
              <input value={form.label} onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))} placeholder="Label (Hostel, Home...)" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              <input value={form.line} onChange={(event) => setForm((prev) => ({ ...prev, line: event.target.value }))} placeholder="Street / location" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              <input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} placeholder="City" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              <button onClick={addAddress} className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Save address</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default AddressesPage;
