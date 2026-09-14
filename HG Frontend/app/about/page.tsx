"use client";

import { SiteLayout } from "@/app/layouts/SiteLayout";
import { ABOUT_PAGE_CONTENT } from '@/content/staticPagesContent';
import { Link } from '@/lib/router';

export default function AboutPage() {
  return (
    <SiteLayout title={ABOUT_PAGE_CONTENT.title}>
      <main className="flex-1 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          <h1 className="font-display font-bold text-foreground text-2xl">{ABOUT_PAGE_CONTENT.title}</h1>
          {ABOUT_PAGE_CONTENT.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-muted-foreground font-body">
              {paragraph}
            </p>
          ))}
          <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            See what we&apos;re grilling today →
          </Link>
        </div>
      </main>
    </SiteLayout>
  );
}
