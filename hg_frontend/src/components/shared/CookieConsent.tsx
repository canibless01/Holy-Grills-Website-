'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';
import { Link } from '@/lib/router';

const STORAGE_KEY = 'hg_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 animate-in slide-in-from-bottom pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto rounded-2xl bg-card border border-border text-card-foreground p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm text-foreground mb-1">We use cookies 🔥</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies to keep you logged in, remember your cart, and send you order updates. By continuing, you agree to our{' '}
              <Link to="/trust" className="text-primary font-semibold underline">Terms & Privacy Policy</Link>.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAccept}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Accept all
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-bold border border-border hover:bg-secondary/80 transition-colors"
              >
                Essential only
              </button>
            </div>
          </div>
          <button onClick={handleDecline} className="p-1.5 rounded-lg hover:bg-secondary shrink-0 text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
