"use client";

import { SiteLayout } from "@/app/layouts/SiteLayout";
import { TRUST_PAGE_CONTENT } from '@/content/staticPagesContent';

export default function TrustPage() {
  return (
    <SiteLayout title={TRUST_PAGE_CONTENT.title}>
      <main className="flex-1 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-4">
          <h1 className="font-display font-bold text-foreground text-2xl">{TRUST_PAGE_CONTENT.title}</h1>
          {TRUST_PAGE_CONTENT.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-muted-foreground font-body">
              {paragraph}
            </p>
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}
