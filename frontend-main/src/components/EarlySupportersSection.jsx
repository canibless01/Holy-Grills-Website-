import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';

/**
 * EarlySupportersSection — homepage block listing the people who backed Holy
 * Grills early. Reads from GET /api/storefront/early-supporters (the same
 * endpoint the admin panel writes to) and renders each supporter's name, photo,
 * social links, and note. Hidden when there are no supporters.
 */
export default function EarlySupportersSection() {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await mockApi.admin.getEarlySupporters();
        setSupporters(Array.isArray(res) ? res : []);
      } catch { /* endpoint unavailable — hide section */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading || supporters.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-flame-600" />
        <div>
          <span className="hg-eyebrow">Grateful</span>
          <h2 className="font-heading font-bold text-lg text-cocoa-800">Early Supporters</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {supporters.map((s) => {
          const raw = s.social_links || s.socials || {};
          const norm = (url) => !url ? null : url.startsWith('http') ? url : `https://${url.replace(/^@/, '')}`;
          const links = [
            raw.twitter && { label: 'Twitter', url: raw.twitter.startsWith('http') ? raw.twitter : `https://twitter.com/${raw.twitter.replace('@', '')}` },
            raw.instagram && { label: 'Instagram', url: raw.instagram.startsWith('http') ? raw.instagram : `https://instagram.com/${raw.instagram.replace('@', '')}` },
            raw.linkedin && { label: 'LinkedIn', url: norm(raw.linkedin) },
            raw.website && { label: 'Website', url: norm(raw.website) },
          ].filter(Boolean);
          return (
            <div key={s.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 text-center">
              {s.photo_url ? (
                <img src={s.photo_url} alt={s.full_name} className="w-14 h-14 rounded-full object-cover mx-auto mb-2" />
              ) : (
                <div className="w-14 h-14 rounded-full flame-gradient flex items-center justify-center mx-auto mb-2 text-white text-lg font-bold">{(s.full_name || '?').charAt(0)}</div>
              )}
              <div className="font-bold text-sm text-cocoa-800">{s.full_name}</div>
              {s.note && <p className="text-[11px] text-cocoa-400 mt-1 leading-snug">{s.note}</p>}
              {links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {links.map((l) => (
                    <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-flame-600 underline">{l.label}</a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}