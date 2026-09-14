"use client";

/**
 * HeroContent.tsx  –  Admin panel for managing hero carousel slides
 * ---------------------------------------------------------------------------
 * Allows the admin to:
 *  - View all existing hero slides.
 *  - Add new slides (up to a reasonable limit).
 *  - Edit any field: tag, title, description, image URL, CTA buttons.
 *  - Toggle a slide's active/inactive status.
 *  - Delete a slide.
 *  - Save all changes via PUT /api/hero.
 *
 * How this connects to the frontend:
 *  Admin saves here → PUT /api/hero updates the in-memory HERO_SLIDES store →
 *  Next page load of the homepage fetches the updated slides server-side (SSR) →
 *  Users see the new content without any client-side delay.
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Plus, Trash2, Edit3, Save, Eye, EyeOff, Image, ChevronUp, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { HeroSlide, HeroCTA } from '@/types';

/* ── Default empty slide template ── */
const EMPTY_SLIDE = (): HeroSlide => ({
  id: crypto.randomUUID(),
  tag: "FUTA's #1 Food Platform",
  title: 'Your Title\nGoes Here',
  description: 'Describe this slide in one or two sentences.',
  ctaButtons: [
    { label: 'Order Now', href: '/menu', variant: 'primary' },
    { label: 'Join for Free', href: '/signup', variant: 'secondary' },
  ],
  imageUrl: '',
  isActive: true,
});

const EMPTY_CTA = (): HeroCTA => ({ label: '', href: '/', variant: 'secondary' });

const AdminHeroContent = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Load current slides from the API on mount ── */
  useEffect(() => {
    fetch('/api/hero')
      .then((r) => r.json())
      .then((json) => {
        setSlides(json.data ?? []);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load hero slides');
        setIsLoading(false);
      });
  }, []);

  /* ── Helpers ── */
  const updateSlide = (id: string, patch: Partial<HeroSlide>) =>
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const updateCTA = (slideId: string, ctaIdx: number, patch: Partial<HeroCTA>) =>
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? {
              ...s,
              ctaButtons: s.ctaButtons.map((c, i) => (i === ctaIdx ? { ...c, ...patch } : c)),
            }
          : s
      )
    );

  const addCTA = (slideId: string) =>
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId && s.ctaButtons.length < 2
          ? { ...s, ctaButtons: [...s.ctaButtons, EMPTY_CTA()] }
          : s
      )
    );

  const removeCTA = (slideId: string, ctaIdx: number) =>
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? { ...s, ctaButtons: s.ctaButtons.filter((_, i) => i !== ctaIdx) }
          : s
      )
    );

  const addSlide = () => {
    const slide = EMPTY_SLIDE();
    setSlides((prev) => [...prev, slide]);
    setEditingId(slide.id);
  };

  const deleteSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
    toast.success('Slide removed');
  };

  const moveSlide = (id: string, dir: 'up' | 'down') => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  /* ── Save to API ── */
  const saveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Hero slides saved! Changes will appear on the next page load.');
    } catch {
      toast.error('Failed to save slides');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-body">
          {slides.length} slide{slides.length !== 1 ? 's' : ''} &middot; {slides.filter((s) => s.isActive).length} active
        </p>
        <button
          onClick={addSlide}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 font-display font-bold text-sm hover:bg-primary/20 transition-colors"
        >
          <Plus size={15} />
          Add Slide
        </button>
      </div>

      {/* Slide list */}
      <AnimatePresence initial={false}>
        {slides.map((slide, idx) => {
          const isEditing = editingId === slide.id;
          return (
            <motion.div
              key={slide.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={`bg-card rounded-xl border ${isEditing ? 'border-primary/40' : 'border-border'} overflow-hidden`}
            >
              {/* Slide header row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30">
                {/* Thumbnail */}
                <div className="w-12 h-8 rounded overflow-hidden shrink-0 bg-secondary">
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={12} className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Slide label */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display font-bold text-foreground truncate">
                    Slide {idx + 1}{slide.tag ? ` · ${slide.tag}` : ''}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body truncate">
                    {slide.title.replace(/\n/g, ' ')}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveSlide(slide.id, 'up')} disabled={idx === 0} aria-label="Move slide up" className="p-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-30">
                    <ChevronUp size={13} />
                  </button>
                  <button onClick={() => moveSlide(slide.id, 'down')} disabled={idx === slides.length - 1} aria-label="Move slide down" className="p-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-30">
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={() => updateSlide(slide.id, { isActive: !slide.isActive })}
                    className={`p-1.5 rounded transition-colors ${slide.isActive ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}
                    title={slide.isActive ? 'Active – click to hide' : 'Inactive – click to show'}
                  >
                    {slide.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => setEditingId(isEditing ? null : slide.id)}
                    className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Editable fields (expanded when editing) */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Tag */}
                      <Field label="Hero Tag" hint="Small badge text above the title">
                        <input
                          value={slide.tag}
                          onChange={(e) => updateSlide(slide.id, { tag: e.target.value })}
                          placeholder="FUTA's #1 Food Platform"
                          className={inputCls}
                        />
                      </Field>

                      {/* Title */}
                      <Field label="Hero Title" hint="Use newlines (↵) to create line breaks for dramatic effect">
                        <textarea
                          rows={3}
                          value={slide.title}
                          onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                          placeholder="Every Meal,&#10;Every Point,&#10;Every Moment."
                          className={`${inputCls} resize-none`}
                        />
                      </Field>

                      {/* Description */}
                      <Field label="Description">
                        <textarea
                          rows={2}
                          value={slide.description}
                          onChange={(e) => updateSlide(slide.id, { description: e.target.value })}
                          className={`${inputCls} resize-none`}
                        />
                      </Field>

                      {/* Image URL */}
                      <Field label="Hero Image URL" hint="Use a direct image URL (JPEG / PNG / WebP)">
                        <input
                          value={slide.imageUrl}
                          onChange={(e) => updateSlide(slide.id, { imageUrl: e.target.value })}
                          placeholder="https://..."
                          className={inputCls}
                        />
                      </Field>

                      {/* CTA Buttons */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-body font-medium text-foreground">CTA Buttons (max 2)</p>
                          {slide.ctaButtons.length < 2 && (
                            <button
                              onClick={() => addCTA(slide.id)}
                              className="text-[11px] text-primary font-body font-medium flex items-center gap-1 hover:underline"
                            >
                              <Plus size={11} /> Add button
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {slide.ctaButtons.map((cta, ci) => (
                            <div key={ci} className="flex items-center gap-2">
                              <input
                                value={cta.label}
                                onChange={(e) => updateCTA(slide.id, ci, { label: e.target.value })}
                                placeholder="Button label"
                                className={`${inputCls} flex-1`}
                              />
                              <input
                                value={cta.href}
                                onChange={(e) => updateCTA(slide.id, ci, { href: e.target.value })}
                                placeholder="/menu"
                                className={`${inputCls} w-28`}
                              />
                              <select
                                value={cta.variant}
                                onChange={(e) =>
                                  updateCTA(slide.id, ci, { variant: e.target.value as 'primary' | 'secondary' })
                                }
                                className={`${inputCls} w-28`}
                              >
                                <option value="primary">Primary</option>
                                <option value="secondary">Secondary</option>
                              </select>
                              {slide.ctaButtons.length > 1 && (
                                <button
                                  onClick={() => removeCTA(slide.id, ci)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {slides.length === 0 && (
        <div className="text-center py-12 text-muted-foreground font-body text-sm border border-dashed border-border rounded-xl">
          No slides yet. Click <strong>Add Slide</strong> to create the first one.
        </div>
      )}

      {/* Save button */}
      <button
        onClick={saveAll}
        disabled={isSaving}
        className="w-full py-3 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save size={15} />
        )}
        {isSaving ? 'Saving…' : 'Save All Slides'}
      </button>
    </div>
  );
};

/* ── Small helpers ── */
const inputCls =
  'w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground font-body mb-1">
        {label}
        {hint && <span className="ml-1 text-muted-foreground/60">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export default AdminHeroContent;
