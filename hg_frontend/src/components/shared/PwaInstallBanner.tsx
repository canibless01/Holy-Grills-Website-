'use client';

import { useState, useEffect } from 'react';
import { Download, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { challengesService } from '@/services/api/challenges.service';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const isDismissed = localStorage.getItem('hg_pwa_dismissed') === 'true';
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('Holy Grills App installed! HP bonus claimed.');
      try {
        if (challengesService && typeof challengesService.recordPwaInstalled === 'function') {
          await challengesService.recordPwaInstalled();
        }
      } catch {
        // ignore milestone network errors
      }
    }
    setIsVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hg_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-40 md:bottom-6 md:left-auto md:right-6 md:max-w-sm rounded-2xl border border-primary/30 bg-card p-3.5 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-fire text-primary-foreground">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="font-display font-bold text-xs text-foreground">Install Holy Grills App</p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">Faster orders + instant HP drops!</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
        >
          <Download size={13} />
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
