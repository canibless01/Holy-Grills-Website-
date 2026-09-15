'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublicConfig } from '@/services/api/storefront.service';

export function WhatsAppFloatingButton() {
  const [dismissed, setDismissed] = useState(false);

  const { data: publicConfig } = useQuery({
    queryKey: ['storefront-public-config'],
    queryFn: getPublicConfig,
  });

  if (dismissed) return null;

  const rawPhone =
    (publicConfig as Record<string, unknown>)?.whatsapp_phone ||
    (publicConfig as Record<string, unknown>)?.support_phone ||
    '2348000000000';

  const resolvedNumber = String(rawPhone).replace(/\D/g, '');
  const message = 'Hello, I need help with my order';
  const href = `https://wa.me/${resolvedNumber || '2348000000000'}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition-all group md:bottom-6"
    >
      <MessageCircle className="w-5 h-5 fill-white/20" />
      <span className="text-xs font-bold whitespace-nowrap">Chat with us</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          setDismissed(true);
        }}
        className="ml-1 p-1 rounded-full hover:bg-black/20 text-white transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </a>
  );
}
