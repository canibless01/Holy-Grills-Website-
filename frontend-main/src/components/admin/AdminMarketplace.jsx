import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, Upload, Package, ShoppingCart } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { formatNaira, timeAgo } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Modal, Field, TextInput, Pill } from './AdminShared';
import ImageUploader from './ImageUploader';

const BLANK = { title: '', listing_type: 'product', price: 0, hp_price: 0, vendor_name: '', codes_remaining: 10, description: '', image_url: '' };

export default function AdminMarketplace() {
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [modal, setModal] = useState(null);
  const [codesModal, setCodesModal] = useState(null);
  const [codesText, setCodesText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [l, r, p] = await Promise.all([mockApi.admin.getMarketplaceListings(), mockApi.admin.getListingRequests(), mockApi.admin.getMarketplacePurchases()]);
    setListings(l); setRequests(r); setPurchases(p);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const body = { ...modal.item, price: Number(modal.item.price), hp_price: Number(modal.item.hp_price), codes_remaining: Number(modal.item.codes_remaining) };
    if (modal.isNew) await mockApi.admin.createListing(body); else await mockApi.admin.updateListing(modal.item.id, body);
    setModal(null); await load();
  };
  const remove = async (id) => { await mockApi.admin.deleteListing(id); await load(); };
  const approve = async (id) => { await mockApi.admin.approveListingRequest(id); await load(); };
  const reject = async (id) => { await mockApi.admin.rejectListingRequest(id); await load(); };
  const fulfillPurchase = async (id) => { await mockApi.admin.fulfillMarketplacePurchase(id); await load(); };

  const uploadCodes = async () => {
    setBusy(true);
    const codes = codesText.split('\n').map(s => s.trim()).filter(Boolean);
    await mockApi.admin.uploadListingCodes(codesModal.id, { codes });
    setBusy(false);
    setCodesModal(null);
    setCodesText('');
    await load();
  };

  if (!listings.length && !requests.length) return <LoadingSpinner label="Loading marketplace..." />;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-full bg-cocoa-100">
        {[{ id: 'listings', label: 'Listings' }, { id: 'requests', label: 'Vendor Requests' }, { id: 'purchases', label: 'Purchases' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 rounded-full text-xs font-bold ${tab === t.id ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-500'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'listings' && (
        <div className="space-y-2">
          <div className="flex justify-end"><button onClick={() => setModal({ item: { ...BLANK }, isNew: true })} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Add Listing</button></div>
          {listings.map((m) => (
            <div key={m.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-cocoa-800">{m.title}</div>
                <div className="text-xs text-cocoa-400">{m.listing_type} · {formatNaira(m.price)} / {m.hp_price} HP · {m.vendor_name} · {m.codes_remaining} codes</div>
              </div>
              <button onClick={() => setCodesModal({ id: m.id, title: m.title })} title="Upload Codes" className="p-2 rounded-lg hover:bg-flame-50"><Upload className="w-4 h-4 text-flame-600" /></button>
              <button onClick={() => setModal({ item: { ...m }, isNew: false })} className="p-2 rounded-lg hover:bg-cocoa-50"><Pencil className="w-4 h-4 text-cocoa-500" /></button>
              <button onClick={() => remove(m.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
              <div className="flex-1"><div className="font-bold text-sm text-cocoa-800">{r.title}</div><div className="text-xs text-cocoa-400">{r.user_name} · {r.listing_type} · {formatNaira(r.price)} / {r.hp_price} HP</div></div>
              {r.status === 'pending' ? (
                <div className="flex gap-1">
                  <button onClick={() => approve(r.id)} className="p-2 rounded-lg bg-green-600 text-white"><Check className="w-4 h-4" /></button>
                  <button onClick={() => reject(r.id)} className="p-2 rounded-lg bg-red-600 text-white"><X className="w-4 h-4" /></button>
                </div>
              ) : <Pill tone={r.status === 'approved' ? 'green' : 'red'}>{r.status}</Pill>}
            </div>
          ))}
        </div>
      )}

      {tab === 'purchases' && (
        <div className="space-y-2">
          {purchases.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cocoa-100 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5 text-cocoa-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-cocoa-800">{p.listing_title}</div>
                <div className="text-xs text-cocoa-400">{p.user_name} · {formatNaira(p.price)} · Code: {p.code} · {timeAgo(p.created_at)}</div>
              </div>
              {p.status === 'pending' ? (
                <button onClick={() => fulfillPurchase(p.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold">
                  <Package className="w-3.5 h-3.5" /> Mark Fulfilled
                </button>
              ) : <Pill tone="green">Fulfilled</Pill>}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.isNew ? 'New Listing' : 'Edit Listing'}>
        {modal && (
          <div className="space-y-3">
            <Field label="Title"><TextInput value={modal.item.title} onChange={(e) => setModal({ item: { ...modal.item, title: e.target.value }, isNew: modal.isNew })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><select value={modal.item.listing_type} onChange={(e) => setModal({ item: { ...modal.item, listing_type: e.target.value }, isNew: modal.isNew })} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm"><option value="product">Product</option><option value="code">Code</option><option value="service">Service</option><option value="experience">Experience</option></select></Field>
              <Field label="Vendor"><TextInput value={modal.item.vendor_name} onChange={(e) => setModal({ item: { ...modal.item, vendor_name: e.target.value }, isNew: modal.isNew })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₦)"><TextInput type="number" value={modal.item.price} onChange={(e) => setModal({ item: { ...modal.item, price: e.target.value }, isNew: modal.isNew })} /></Field>
              <Field label="HP price"><TextInput type="number" value={modal.item.hp_price} onChange={(e) => setModal({ item: { ...modal.item, hp_price: e.target.value }, isNew: modal.isNew })} /></Field>
            </div>
            <Field label="Codes remaining"><TextInput type="number" value={modal.item.codes_remaining} onChange={(e) => setModal({ item: { ...modal.item, codes_remaining: e.target.value }, isNew: modal.isNew })} /></Field>
            <Field label="Description"><textarea value={modal.item.description} onChange={(e) => setModal({ item: { ...modal.item, description: e.target.value }, isNew: modal.isNew })} rows={2} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm" /></Field>
            <Field label="Image"><ImageUploader value={modal.item.image_url} onChange={(url) => setModal({ item: { ...modal.item, image_url: url }, isNew: modal.isNew })} folder="marketplace" /></Field>
            <button onClick={save} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm">{modal.isNew ? 'Create Listing' : 'Save Changes'}</button>
          </div>
        )}
      </Modal>

      <Modal open={!!codesModal} onClose={() => setCodesModal(null)} title={`Upload Codes — ${codesModal?.title || ''}`}>
        {codesModal && (
          <div className="space-y-3">
            <p className="text-xs text-cocoa-500">Paste access codes below, one per line. These will be added to the listing's available codes.</p>
            <textarea value={codesText} onChange={(e) => setCodesText(e.target.value)} rows={6} placeholder={'CODE-ABCD-1234\nCODE-EFGH-5678\nCODE-IJKL-9012'} className="w-full p-2.5 rounded-xl border border-cocoa-200 text-xs font-mono" />
            <button onClick={uploadCodes} disabled={busy || !codesText.trim()} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> {busy ? 'Uploading...' : `Upload ${codesText.split('\n').filter(Boolean).length} Codes`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}