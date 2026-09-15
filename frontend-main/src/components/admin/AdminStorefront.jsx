import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Image, Mail, Flame, Tag, Quote, Share2, Heart, Sparkles } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { formatDate } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Field, TextInput, Card, Toggle, Pill, Modal } from './AdminShared';
import ImageUploader from './ImageUploader';
import { toast } from '@/components/ui/use-toast';

// Section types that share one API (/storefront/sections) — segmented so admins
// always know which kind they're editing instead of one undifferentiated stack.
const SECTION_TYPES = [
  { id: 'hero', label: 'Hero', icon: Flame },
  { id: 'banner', label: 'Banners', icon: Image },
  { id: 'promo', label: 'Promos', icon: Tag },
  { id: 'testimonial', label: 'Testimonials', icon: Quote },
  { id: 'share_template', label: 'Share Templates', icon: Share2 },
];
const ALL_TABS = [...SECTION_TYPES, { id: 'early_supporter', label: 'Early Supporters', icon: Heart }, { id: 'newsletter', label: 'Newsletter', icon: Mail }];

// Real sample content the admin can seed into the live backend (POST /storefront/sections)
// so each segment has data to view and edit — not mock, persisted via the API.
const SAMPLE_SECTIONS = [
  { section_type: 'hero', title: '🔥 Flame-Grilled, Campus-Fresh', subtitle: 'Order fresh meals straight to your hostel in minutes.', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80', cta_text: 'Order now', cta_url: '/menu', placement: 'home', sort_order: 0 },
  { section_type: 'banner', title: 'Free Side on Your First Order', subtitle: 'Unlock a free side when you place your first order today.', image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80', cta_text: 'Claim', cta_url: '/menu', placement: 'home', sort_order: 1 },
  { section_type: 'promo', title: 'Squad Feast — Save Together', subtitle: 'Order with your squad and unlock group discounts on platters.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', cta_text: 'Start a squad', cta_url: '/events', placement: 'home', sort_order: 2 },
  { section_type: 'testimonial', content: { name: 'Omoayena A.', text: 'It was wonderful 😭 I was even so full and it came right to my hostel. The HP rewards keep me coming back!', rating: 5 } },
  { section_type: 'share_template', title: 'Share Template', content: { base_image_url: 'https://images.unsplash.com/photo-1513104890-87103ece8d46?w=1200&q=80', caption_template: 'I just earned {hp} Holy Points at Holy Grills 🔥' } },
];

// /storefront/sections requires a unique `key` + `section_type` on create.
const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
const keyFor = (type, title) => `${type}_${slug(title)}_${Date.now().toString(36)}`;
const blankSection = (type) => ({ section_type: type, title: '', subtitle: '', image_url: '', cta_text: '', cta_url: '', placement: 'home', sort_order: 0, testimonial_name: '', testimonial_review: '', testimonial_rating: 5, caption_template: '' });

export default function AdminStorefront() {
  const [tab, setTab] = useState('hero');
  const [sections, setSections] = useState([]);
  const [supporters, setSupporters] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [busy, setBusy] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [supporterForm, setSupporterForm] = useState({ full_name: '', photo_url: '', note: '', twitter: '', instagram: '', linkedin: '' });
  const [newSection, setNewSection] = useState(blankSection('hero'));
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const [b, s, n] = await Promise.all([mockApi.admin.getStorefrontSections(), mockApi.admin.getEarlySupporters(), mockApi.admin.getNewsletterSubscribers()]);
      setSections(Array.isArray(b) ? [...b].sort((a, c) => (a.sort_order ?? 0) - (c.sort_order ?? 0)) : []);
      setSupporters(Array.isArray(s) ? s : []); setSubscribers(Array.isArray(n) ? n : []);
    } catch { setSections([]); }
    setLoaded(true);
  };
  useEffect(() => { load(); }, []);

  const isSectionType = SECTION_TYPES.some((t) => t.id === tab);
  const visible = sections.filter((s) => s.section_type === tab);

  const upd = (id, patch) => setSections((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const save = async (s) => { setBusy(s.id); try { await mockApi.admin.updateStorefrontSection(s.id, s); toast({ title: '✅ Section saved' }); } catch (e) { toast({ title: 'Save failed', description: e.message, variant: 'destructive' }); } setBusy(null); await load(); };
  const move = async (s, dir) => {
    const sameType = sections.filter((x) => x.section_type === s.section_type).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const i = sameType.findIndex((x) => x.id === s.id); const j = i + dir; if (j < 0 || j >= sameType.length) return;
    const other = sameType[j];
    setBusy(`mv-${s.id}`);
    try { await Promise.all([mockApi.admin.updateStorefrontSection(s.id, { sort_order: other.sort_order ?? j }), mockApi.admin.updateStorefrontSection(other.id, { sort_order: s.sort_order ?? i })]); await load(); }
    catch (e) { toast({ title: 'Reorder failed', description: e.message, variant: 'destructive' }); }
    setBusy(null);
  };
  const toggleActive = async (s, v) => { setBusy(`act-${s.id}`); try { await mockApi.admin.updateStorefrontSection(s.id, { is_active: v }); await load(); } catch (e) { toast({ title: 'Failed', description: e.message, variant: 'destructive' }); } setBusy(null); };
  const del = async (id) => { if (!confirm('Delete this storefront section? It will be removed from the live homepage.')) return; try { await mockApi.admin.deleteStorefrontSection(id); toast({ title: '✅ Deleted' }); await load(); } catch (e) { toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }); } };

  const seedSamples = async () => {
    setSeeding(true); let ok = 0;
    for (const sample of SAMPLE_SECTIONS) {
      try {
        const body = { ...sample, is_active: true, key: keyFor(sample.section_type, sample.title || sample.content?.name) };
        if (sample.section_type === 'share_template') body.key = 'share_template';
        if (sample.section_type === 'testimonial') body.title = sample.content.name;
        await mockApi.admin.createStorefrontSection(body); ok++;
      } catch (e) { /* skip duplicates / failures */ }
    }
    toast({ title: `Seeded ${ok} sample section(s)`, description: 'Edit them below to see how each type renders.' });
    setSeeding(false); await load();
  };

  const create = async () => {
    const t = newSection.section_type;
    if (t === 'testimonial') { if (!newSection.testimonial_name || !newSection.testimonial_review) { toast({ title: 'Name and review required', variant: 'destructive' }); return; } }
    else if (t === 'share_template') { if (!newSection.image_url) { toast({ title: 'Base image required', variant: 'destructive' }); return; } }
    else { if (!newSection.title || !newSection.image_url) { toast({ title: 'Title and image required', variant: 'destructive' }); return; } }
    setBusy('create');
    try {
      // `key` + `section_type` are both required by POST /storefront/sections — derive a
      // unique key so hero/banner/promo creation no longer throws "key is required".
      const body = { section_type: t, placement: newSection.placement || 'home', sort_order: Number(newSection.sort_order) || 0, is_active: true, key: keyFor(t, t === 'testimonial' ? newSection.testimonial_name : newSection.title) };
      if (t === 'testimonial') { body.title = newSection.testimonial_name; body.content = { name: newSection.testimonial_name, text: newSection.testimonial_review, rating: Number(newSection.testimonial_rating) || 5 }; }
      else if (t === 'share_template') { body.title = newSection.title || 'Share Template'; body.key = 'share_template'; body.content = { base_image_url: newSection.image_url, caption_template: newSection.caption_template || '' }; }
      else { body.title = newSection.title; body.subtitle = newSection.subtitle; body.image_url = newSection.image_url; body.cta_text = newSection.cta_text; body.cta_url = newSection.cta_url; }
      await mockApi.admin.createStorefrontSection(body);
      setAddOpen(false); setNewSection(blankSection(t)); await load();
    } catch (e) { toast({ title: 'Failed to create', description: e.message, variant: 'destructive' }); }
    setBusy(null);
  };

  const addSupporter = async () => {
    if (!supporterForm.full_name) return;
    try {
      const social_links = {};
      if (supporterForm.twitter) social_links.twitter = supporterForm.twitter;
      if (supporterForm.instagram) social_links.instagram = supporterForm.instagram;
      if (supporterForm.linkedin) social_links.linkedin = supporterForm.linkedin;
      await mockApi.admin.addEarlySupporter({ full_name: supporterForm.full_name, photo_url: supporterForm.photo_url || undefined, note: supporterForm.note || undefined, social_links: Object.keys(social_links).length ? social_links : undefined });
      setSupporterForm({ full_name: '', photo_url: '', note: '', twitter: '', instagram: '', linkedin: '' });
      setAddOpen(false); await load();
    } catch (e) { toast({ title: 'Failed', description: e.message, variant: 'destructive' }); }
  };
  const removeSupporter = async (id) => { await mockApi.admin.removeEarlySupporter(id); await load(); };
  const unsubscribe = async (email) => { setBusy(email); await mockApi.admin.unsubscribeNewsletter({ email }); await load(); setBusy(null); };

  if (!loaded) return <LoadingSpinner label="Loading..." />;

  return (
    <div className="space-y-4">
      {/* Segment chips — slide through to see each storefront kind */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {ALL_TABS.map((t) => {
          const count = t.id === 'early_supporter' ? supporters.length : t.id === 'newsletter' ? subscribers.length : sections.filter((s) => s.section_type === t.id).length;
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap ${tab === t.id ? 'flame-gradient text-white shadow-selected-soft' : 'bg-white border border-cocoa-200 text-cocoa-600'}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label} <span className={`ml-0.5 text-[10px] ${tab === t.id ? 'text-white/80' : 'text-cocoa-400'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {isSectionType && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[11px] text-cocoa-400 capitalize">{tab.replace(/_/g, ' ')} sections — render on the live homepage in sort order.</p>
            <div className="flex gap-2">
              {visible.length === 0 && <button onClick={seedSamples} disabled={seeding} className="flex items-center gap-1 px-3 py-2 rounded-full bg-cocoa-800 text-white text-xs font-bold disabled:opacity-50"><Sparkles className="w-3.5 h-3.5" /> {seeding ? 'Seeding...' : 'Seed samples'}</button>}
              <button onClick={() => { setNewSection(blankSection(tab)); setAddOpen(true); }} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Add</button>
            </div>
          </div>
          {visible.length === 0 ? (
            <Card><p className="text-xs text-cocoa-400 text-center py-6">No {tab.replace(/_/g, ' ')} sections yet. Click "Seed samples" to insert real example sections you can edit, or "Add" to create your own.</p></Card>
          ) : visible.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center gap-2 mb-2">
                <Pill tone="blue">{(s.section_type || 'banner').toUpperCase()}</Pill>
                {s.placement && <span className="text-[10px] text-cocoa-400 uppercase tracking-wide">{s.placement}</span>}
                <div className="ml-auto flex items-center gap-1.5">
                  <button type="button" onClick={() => move(s, -1)} className="px-2 py-1 rounded-lg hover:bg-cocoa-50 text-cocoa-500 text-xs" title="Move up">↑</button>
                  <button type="button" onClick={() => move(s, 1)} className="px-2 py-1 rounded-lg hover:bg-cocoa-50 text-cocoa-500 text-xs" title="Move down">↓</button>
                  <Toggle checked={!!(s.is_active ?? s.active)} onChange={(v) => toggleActive(s, v)} disabled={busy === `act-${s.id}`} />
                </div>
              </div>
              {s.section_type === 'testimonial' ? (
                <>
                  <input value={s.title || s.content?.name || ''} onChange={(e) => upd(s.id, { title: e.target.value, content: { ...s.content, name: e.target.value } })} className="w-full mb-2 p-2 rounded-lg border border-cocoa-200 text-sm font-bold" placeholder="Customer name" />
                  <textarea value={s.content?.text || s.content?.review || ''} onChange={(e) => upd(s.id, { content: { ...s.content, text: e.target.value } })} rows={2} className="w-full mb-2 p-2 rounded-lg border border-cocoa-200 text-sm" placeholder="Review text" />
                  <div className="flex items-center gap-2"><span className="text-xs text-cocoa-500">Rating</span><input type="number" min={1} max={5} value={s.content?.rating ?? 5} onChange={(e) => upd(s.id, { content: { ...s.content, rating: Number(e.target.value) } })} className="w-16 p-1.5 rounded-lg border border-cocoa-200 text-sm" /></div>
                </>
              ) : s.section_type === 'share_template' ? (
                <>
                  <input value={s.title || ''} onChange={(e) => upd(s.id, { title: e.target.value })} className="w-full mb-2 p-2 rounded-lg border border-cocoa-200 text-sm font-bold" placeholder="Title" />
                  <ImageUploader value={s.content?.base_image_url || s.image_url || ''} onChange={(url) => upd(s.id, { content: { ...s.content, base_image_url: url }, image_url: url })} folder="share_templates" />
                  <textarea value={s.content?.caption_template || ''} onChange={(e) => upd(s.id, { content: { ...s.content, caption_template: e.target.value } })} rows={2} className="w-full mt-2 p-2 rounded-lg border border-cocoa-200 text-sm" placeholder="Caption template — use {hp} for the student's HP" />
                </>
              ) : (
                <>
                  <input value={s.title || ''} onChange={(e) => upd(s.id, { title: e.target.value })} className="w-full mb-2 p-2 rounded-lg border border-cocoa-200 text-sm font-bold" placeholder="Title" />
                  <input value={s.subtitle || ''} onChange={(e) => upd(s.id, { subtitle: e.target.value })} className="w-full mb-2 p-2 rounded-lg border border-cocoa-200 text-sm" placeholder="Subtitle" />
                  <ImageUploader value={s.image_url || ''} onChange={(url) => upd(s.id, { image_url: url })} folder="banners" />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input value={s.cta_text || ''} onChange={(e) => upd(s.id, { cta_text: e.target.value })} className="p-2 rounded-lg border border-cocoa-200 text-sm" placeholder="CTA text" />
                    <input value={s.cta_url || ''} onChange={(e) => upd(s.id, { cta_url: e.target.value })} className="p-2 rounded-lg border border-cocoa-200 text-sm" placeholder="CTA URL" />
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => save(s)} disabled={busy === s.id} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Save</button>
                <button onClick={() => del(s.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'early_supporter' && (
        <div className="space-y-2">
          <div className="flex justify-end"><button onClick={() => setAddOpen(true)} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Add</button></div>
          {supporters.length === 0 ? <Card><p className="text-xs text-cocoa-400 text-center py-6">No early supporters yet.</p></Card> : supporters.map((s) => (
            <Card key={s.id} className="!p-3">
              <div className="flex items-center gap-3">
                {s.photo_url ? <img src={s.photo_url} alt={s.full_name} className="w-10 h-10 rounded-full object-cover shrink-0" /> : <div className="w-10 h-10 rounded-full bg-flame-50 flex items-center justify-center shrink-0"><Heart className="w-4 h-4 text-flame-500" /></div>}
                <div className="flex-1 min-w-0"><div className="font-bold text-sm text-cocoa-800">{s.full_name}</div><div className="text-xs text-cocoa-400">Joined {s.joined_at || '—'} · +{s.bonus_hp ?? 0} HP</div></div>
                {s.badge_awarded && <Pill tone="flame">Badged</Pill>}
                <button onClick={() => removeSupporter(s.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
              {s.note && <p className="text-xs text-cocoa-500 mt-2">{s.note}</p>}
              {(() => {
                const socials = s.social_links || s.socials || {};
                const links = [socials.twitter && { label: 'Twitter', url: socials.twitter.startsWith('http') ? socials.twitter : `https://twitter.com/${socials.twitter.replace('@','')}` }, socials.instagram && { label: 'Instagram', url: socials.instagram.startsWith('http') ? socials.instagram : `https://instagram.com/${socials.instagram.replace('@','')}` }, socials.linkedin && { label: 'LinkedIn', url: socials.linkedin }, socials.website && { label: 'Website', url: socials.website }].filter(Boolean);
                if (!links.length) return null;
                return (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {links.map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-flame-600 underline">{l.label}</a>)}
                  </div>
                );
              })()}
            </Card>
          ))}
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="space-y-2">
          <div className="rounded-xl bg-cocoa-50 border border-cocoa-100 p-3 text-xs text-cocoa-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {subscribers.length} subscribers.</div>
          {subscribers.length === 0 ? <Card><p className="text-xs text-cocoa-400 text-center py-6">No newsletter subscribers yet.</p></Card> : subscribers.map((s) => (
            <Card key={s.id} className="flex items-center gap-3 !p-3">
              <div className="w-9 h-9 rounded-full bg-flame-50 text-flame-600 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0"><div className="font-bold text-sm text-cocoa-800 truncate">{s.email}</div><div className="text-[11px] text-cocoa-400">{s.full_name || '—'} · via {s.source || '—'} · {formatDate(s.subscribed_at)}</div></div>
              <button onClick={() => unsubscribe(s.email)} disabled={busy === s.email} className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold disabled:opacity-50">Unsubscribe</button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={addOpen && isSectionType} onClose={() => setAddOpen(false)} title={`Create ${tab.replace(/_/g, ' ')} section`}>
        <div className="space-y-3">
          {newSection.section_type === 'testimonial' ? (
            <>
              <Field label="Customer name (required)"><TextInput value={newSection.testimonial_name} onChange={(e) => setNewSection({ ...newSection, testimonial_name: e.target.value })} placeholder="Omoayena A" /></Field>
              <Field label="Review text (required)"><textarea value={newSection.testimonial_review} onChange={(e) => setNewSection({ ...newSection, testimonial_review: e.target.value })} rows={3} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm" placeholder="It was wonderful 😭..." /></Field>
              <Field label="Rating (1-5)"><TextInput type="number" value={newSection.testimonial_rating} onChange={(e) => setNewSection({ ...newSection, testimonial_rating: e.target.value })} /></Field>
            </>
          ) : newSection.section_type === 'share_template' ? (
            <>
              <div className="rounded-xl bg-cocoa-50 p-3 text-xs text-cocoa-500">Students' share cards overlay their name and HP on the base image.</div>
              <Field label="Base share image (required)"><ImageUploader value={newSection.image_url} onChange={(url) => setNewSection({ ...newSection, image_url: url })} folder="share_templates" /></Field>
              <Field label="Caption template"><textarea value={newSection.caption_template} onChange={(e) => setNewSection({ ...newSection, caption_template: e.target.value })} rows={2} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm" placeholder="I just earned {hp} HP at Holy Grills 🔥" /></Field>
            </>
          ) : (
            <>
              <Field label="Title (required)"><TextInput value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} /></Field>
              <Field label="Subtitle"><TextInput value={newSection.subtitle} onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })} /></Field>
              <Field label="Image (required)"><ImageUploader value={newSection.image_url} onChange={(url) => setNewSection({ ...newSection, image_url: url })} folder="banners" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA text"><TextInput value={newSection.cta_text} onChange={(e) => setNewSection({ ...newSection, cta_text: e.target.value })} placeholder="Order now" /></Field>
                <Field label="CTA URL"><TextInput value={newSection.cta_url} onChange={(e) => setNewSection({ ...newSection, cta_url: e.target.value })} placeholder="/menu" /></Field>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Placement"><select value={newSection.placement} onChange={(e) => setNewSection({ ...newSection, placement: e.target.value })} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm"><option value="home">Home</option><option value="menu">Menu</option><option value="checkout">Checkout</option></select></Field>
            <Field label="Sort order"><TextInput type="number" value={newSection.sort_order} onChange={(e) => setNewSection({ ...newSection, sort_order: e.target.value })} /></Field>
          </div>
          <button onClick={create} disabled={busy === 'create'} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50">{busy === 'create' ? 'Creating...' : 'Create Section'}</button>
        </div>
      </Modal>

      <Modal open={addOpen && tab === 'early_supporter'} onClose={() => setAddOpen(false)} title="Add Early Supporter">
        <div className="space-y-3">
          <Field label="Full name"><TextInput value={supporterForm.full_name} onChange={(e) => setSupporterForm({ ...supporterForm, full_name: e.target.value })} /></Field>
          <Field label="Photo URL (optional)"><TextInput value={supporterForm.photo_url} onChange={(e) => setSupporterForm({ ...supporterForm, photo_url: e.target.value })} placeholder="https://..." /></Field>
          <Field label="Note (optional)"><textarea value={supporterForm.note} onChange={(e) => setSupporterForm({ ...supporterForm, note: e.target.value })} rows={2} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm" placeholder="Why they support us" /></Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Twitter"><TextInput value={supporterForm.twitter} onChange={(e) => setSupporterForm({ ...supporterForm, twitter: e.target.value })} placeholder="@handle" /></Field>
            <Field label="Instagram"><TextInput value={supporterForm.instagram} onChange={(e) => setSupporterForm({ ...supporterForm, instagram: e.target.value })} placeholder="@handle" /></Field>
            <Field label="LinkedIn"><TextInput value={supporterForm.linkedin} onChange={(e) => setSupporterForm({ ...supporterForm, linkedin: e.target.value })} placeholder="url" /></Field>
          </div>
          <button onClick={addSupporter} disabled={!supporterForm.full_name} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50">Add</button>
        </div>
      </Modal>
    </div>
  );
}