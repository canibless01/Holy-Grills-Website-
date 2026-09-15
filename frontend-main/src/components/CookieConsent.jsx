import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'hg_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Small delay so it doesn't clash with page-load animations
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
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 animate-slide-up pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto rounded-2xl bg-cocoa-800 text-white p-4 shadow-2xl border border-cocoa-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-flame-600/20 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-flame-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-sm text-white mb-1">We use cookies 🔥</h3>
            <p className="text-xs text-cocoa-200 leading-relaxed">
              We use cookies to keep you logged in, remember your cart, and send you order updates. By continuing, you agree to our{' '}
              <Link to="/terms" className="text-flame-400 font-semibold underline">Terms & Privacy Policy</Link>.
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleAccept} className="flex items-center gap-1.5 px-4 py-2 rounded-full flame-gradient text-white text-xs font-bold shadow-md">
                <Check className="w-3.5 h-3.5" /> Accept all
              </button>
              <button onClick={handleDecline} className="px-4 py-2 rounded-full bg-cocoa-700 text-cocoa-200 text-xs font-bold border border-cocoa-600">
                Essential only
              </button>
            </div>
          </div>
          <button onClick={handleDecline} className="p-1.5 rounded-lg hover:bg-cocoa-700 shrink-0">
            <X className="w-4 h-4 text-cocoa-300" />
          </button>
        </div>
      </div>
    </div>
  );
}