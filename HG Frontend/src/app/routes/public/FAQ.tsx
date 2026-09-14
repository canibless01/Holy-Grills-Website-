'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Flame, Search } from 'lucide-react';

const FAQS = [
  { q: 'When does the kitchen open?', a: 'Check the live status strip on Home and Menu for the current delivery window.' },
  { q: 'How does HP work?', a: 'You earn HP from orders, referrals, and streak activity. Use HP across rewards and marketplace drops.' },
  { q: 'Can I pay with wallet?', a: 'Yes. Wallet balance is supported on checkout and can be topped up from the Wallet page.' },
  { q: 'How do events work?', a: 'Register for events and check in by scanning the event QR code to earn HP.' },
];

const FAQPage = () => {
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);
  const filtered = useMemo(() => {
    if (!query.trim()) return FAQS;
    return FAQS.filter((entry) => (entry.q + entry.a).toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Flame size={12} /> FAQ</span>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Frequently asked questions</h1>
        </section>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions..." className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <section className="space-y-2">
          {filtered.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.q} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button onClick={() => setOpenIndex(open ? -1 : index)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground">
                  {faq.q}
                  <ChevronDown size={15} className={open ? 'rotate-180 text-primary' : 'text-muted-foreground'} />
                </button>
                {open ? <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</p> : null}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default FAQPage;
