"use client";

import { SiteLayout } from "@/app/layouts/SiteLayout";
import { SUPPORT_PAGE_CONTENT, SUPPORT_WHATSAPP_URL } from '@/content/staticPagesContent';

export default function SupportPage() {
  return (
    <SiteLayout title={SUPPORT_PAGE_CONTENT.title}>
      <main className="flex-1 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-4">
          <h1 className="font-display font-bold text-foreground text-2xl">{SUPPORT_PAGE_CONTENT.title}</h1>
          {SUPPORT_PAGE_CONTENT.paragraphs.map((paragraph) => (
            paragraph.toLowerCase().includes('whatsapp') ? (
              <a
                key={paragraph}
                href={SUPPORT_WHATSAPP_URL}
                className="inline-flex text-muted-foreground font-body hover:text-primary"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp support
              </a>
            ) : (
              <p key={paragraph} className="text-muted-foreground font-body">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}
