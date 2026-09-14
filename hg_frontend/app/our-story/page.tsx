'use client';

import { SiteLayout } from '@/app/layouts/SiteLayout';
import { ABOUT_PAGE_CONTENT } from '@/content/staticPagesContent';
import { Link } from '@/lib/router';

export default function Page() {
  return (
    <SiteLayout title="Our Story">
      <main className="flex-1 pb-12 md:pt-24">
        <div className="container mx-auto max-w-3xl space-y-6 px-4">
          <h1 className="font-display text-2xl font-bold text-foreground">{ABOUT_PAGE_CONTENT.title}</h1>
          {ABOUT_PAGE_CONTENT.paragraphs.map((paragraph) => <p key={paragraph} className="text-muted-foreground">{paragraph}</p>)}
          <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">See what we&apos;re grilling today →</Link>
        </div>
      </main>
    </SiteLayout>
  );
}
