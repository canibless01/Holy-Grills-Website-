import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Check, X, Trash2, Edit2 } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { ON_CAMPUS_GATES, ON_CAMPUS_LOCATIONS } from '@/lib/mockData';
import { findNearestGate } from '@/lib/deliveryUtils';
import OffCampusMap from '@/components/OffCampusMap';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: '', type: 'on_campus', line1: '', city: 'Akure', state: 'Ondo', is_default: false, gate_id: '', location_id: '', lat: null, lng: null });
  const [gates, setGates] = useState([]);
  const [pin, setPin] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [result, g] = await Promise.all([
        mockApi.addresses.list(),
        mockApi.delivery.getGates().catch(() => []),
      ]);
      setAddresses(result);
      setGates(g || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    setSaveError(null);
    if (!form.label.trim()) { setSaveError('Please give this address a label (e.g. Hostel).'); return; }
    if (form.type === 'on_campus') {
      if (!form.gate_id) { setSaveError('Please select your gate.'); return; }
      if (!form.location_id) { setSaveError('Please select your location.'); return; }
    }
    if (form.type === 'off_campus' && (form.lat == null || form.lng == null)) {
      setSaveError('Drop your delivery pin on the map so we can calculate your delivery fee.');
      return;
    }
    if (form.type === 'off_campus' && !form.line1.trim()) { setSaveError('Please enter your street address / description.'); return; }
    if (!form.city.trim()) { setSaveError('Please enter your city.'); return; }
    try {
      const data = { ...form };
      if (form.type === 'on_campus') {
        const loc = ON_CAMPUS_LOCATIONS.find(l => l.id === form.location_id);
        const gate = ON_CAMPUS_GATES.find(g => g.id === form.gate_id);
        data.line1 = `${loc?.name}, ${gate?.name}`;
      }
      if (editing) {
        await mockApi.addresses.update(editing, data);
      } else {
        await mockApi.addresses.create(data);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ label: '', type: 'on_campus', line1: '', city: 'Akure', state: 'Ondo', is_default: false, gate_id: '', location_id: '', lat: null, lng: null });
      setPin(null);
      load();
    } catch (e) { setSaveError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    await mockApi.addresses.delete(id);
    load();
  };

  if (loading) return <LoadingSpinner label="Loading addresses..." />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Addresses</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ label: '', type: 'on_campus', line1: '', city: 'Akure', state: 'Ondo', is_default: false, gate_id: '', location_id: '', lat: null, lng: null }); setPin(null); }} className="flex items-center gap-1 px-3 py-2 rounded-full flame-gradient text-white text-xs font-bold">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-2">
        {addresses.map(addr => (
          <div key={addr.id} className="rounded-2xl bg-white border border-cocoa-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-cocoa-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-cocoa-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-cocoa-800">{addr.label}</span>
                  {addr.is_default && <span className="text-[10px] font-bold text-flame-600 px-2 py-0.5 rounded-full bg-flame-50">DEFAULT</span>}
                  <span className="text-[10px] font-bold text-cocoa-400 px-2 py-0.5 rounded-full bg-cocoa-50 capitalize">{addr.type?.replace('_', '-')}</span>
                </div>
                <p className="text-xs text-cocoa-500 mt-1">{addr.line1}, {addr.city}, {addr.state}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(addr.id); setForm({ ...addr, gate_id: addr.gate_id || '', location_id: addr.location_id || '', lat: addr.lat ?? null, lng: addr.lng ?? null }); setPin(addr.lat && addr.lng ? { lat: addr.lat, lng: addr.lng } : null); setShowForm(true); }} className="p-1.5 rounded-full hover:bg-cocoa-50">
                  <Edit2 className="w-3.5 h-3.5 text-cocoa-400" />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded-full hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-10 h-10 text-cocoa-200 mx-auto mb-2" />
            <p className="text-sm text-cocoa-400">No saved addresses</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-lg text-cocoa-800">{editing ? 'Edit Address' : 'Add Address'}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setForm({ ...form, type: 'on_campus' })} className={`p-3 rounded-xl border-2 ${form.type === 'on_campus' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                  <span className="text-xs font-bold">🏫 On Campus</span>
                </button>
                <button onClick={() => setForm({ ...form, type: 'off_campus' })} className={`p-3 rounded-xl border-2 ${form.type === 'off_campus' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                  <span className="text-xs font-bold">🏠 Off Campus</span>
                </button>
              </div>
              <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" placeholder="Label (e.g., Hostel)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />

              {form.type === 'on_campus' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-cocoa-500 uppercase">Gate</label>
                    <select className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm" value={form.gate_id} onChange={e => setForm({ ...form, gate_id: e.target.value, location_id: '' })}>
                      <option value="">Select gate</option>
                      {ON_CAMPUS_GATES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  {form.gate_id && (
                    <div>
                      <label className="text-xs font-bold text-cocoa-500 uppercase">Location</label>
                      <select className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm" value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })}>
                        <option value="">Select location</option>
                        {ON_CAMPUS_LOCATIONS.filter(l => l.gate_id === form.gate_id).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-cocoa-500 uppercase">Drop your delivery pin</label>
                    <div className="mt-1.5">
                      <OffCampusMap
                        gates={gates}
                        pin={pin}
                        onPinChange={(ll) => {
                          setPin(ll);
                          const nearest = findNearestGate(gates, ll.lat, ll.lng);
                          setForm((f) => ({ ...f, lat: ll.lat, lng: ll.lng, gate_id: nearest?.gate?.id || f.gate_id }));
                        }}
                        selectedGateId={form.gate_id}
                        onGateSelect={(g) => setForm((f) => ({ ...f, gate_id: g.id }))}
                      />
                    </div>
                    {form.lat == null && (
                      <p className="text-[11px] text-flame-600 font-semibold mt-1.5">Tap the map or “Use my location” so we can calculate your delivery fee.</p>
                    )}
                  </div>
                  <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" placeholder="Street address / description" value={form.line1} onChange={e => setForm({ ...form, line1: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                    <input className="w-full p-3 rounded-xl border border-cocoa-200 text-sm" placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                  </div>
                </>
              )}

              <label className="flex items-center gap-2 text-sm text-cocoa-600">
                <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} className="rounded" />
                Set as default
              </label>

              {saveError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-xs text-red-700 font-semibold">{saveError}</span>
                </div>
              )}
              <button onClick={handleSave} className="w-full py-3 rounded-full flame-gradient text-white font-bold">
                {editing ? 'Update' : 'Save'} Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}