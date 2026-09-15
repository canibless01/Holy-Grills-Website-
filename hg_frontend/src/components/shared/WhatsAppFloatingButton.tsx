'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublicConfig } from '@/services/api/storefront.service';

export function WhatsAppFloatingButton() {
  const { data: publicConfig } = useQuery({
    queryKey: ['storefront-public-config'],
    queryFn: getPublicConfig,
  });

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
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition-all md:bottom-6"
    >
      <MessageCircle className="h-6 w-6 fill-white/20" />
    </a>
  );
}
