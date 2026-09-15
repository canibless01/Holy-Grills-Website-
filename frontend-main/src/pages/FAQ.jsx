import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Flame, Search } from 'lucide-react';

const FAQS = [
  {
    q: 'When does the kitchen open?',
    a: "The kitchen runs in delivery windows through the week — usually Thursday to Sunday, opening at 10:00 and closing at 22:00. Check the Kitchen Radar on the home or menu page to see the live status and the next delivery window. You can place an order any time, even while the kitchen is closed — it will be processed as soon as the next window opens.",
  },
  {
    q: 'How do Holy Points work?',
    a: 'Every Holy Grills order earns Holy Points (HP) based on what you order. The more you order, the higher you climb on the leaderboard and the more rewards you unlock. Points are split into Active (spendable on rewards) and Pending (becomes active after your order is delivered). Higher tiers also earn bonus multipliers.',
  },
  {
    q: 'Can I redeem Holy Points for food?',
    a: 'Holy Points unlock free sides, upgrades, rewards from the Rewards shelf, marketplace drops, and event tickets. Visit the Rewards page to see what is currently available.',
  },
  {
    q: 'What is a Squad Order?',
    a: 'Order with your squad — combine at least two items in your cart into one delivery and everyone gets 10% off. Add a squad name and your squad emails at checkout to split the HP across members.',
  },
  {
    q: 'Where do you deliver?',
    a: 'We deliver on and off campus around FUTA, Akure. Pick On Campus or Off Campus at checkout and we route the order to the right delivery batch.',
  },
  {
    q: 'How do I pay?',
    a: 'You can pay with your Holy Grills wallet, a card, or a split of both. Wallet funds are instant; cards add a short payment-confirmation step before the kitchen starts grilling.',
  },
  {
    q: 'Can I save an item for later?',
    a: 'Yes — tap the heart on any menu item page to add it to your Saved Items. Visit the Cart page and switch to the "Saved Items" tab to move favourites back into your cart.',
  },
  {
    q: 'What happens if my order includes a sold-out item?',
    a: "We will not let you check out with an item that is no longer available. We will ask you to remove it from your cart before you can finish — that way you are never charged for something we cannot deliver.",
  },
];

const CATEGORIES = [
  { label: 'Orders & Delivery', icon: '🛵' },
  { label: 'Holy Points & Rewards', icon: '🔥' },
  { label: 'Payment & Wallet', icon: '💳' },
  { label: 'Account & Profile', icon: '👤' },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  const [query, setQuery] = useState('');

  const filtered = query
    ? FAQS.filter((f) => (f.q + f.a).toLowerCase().includes(query.toLowerCase()))
    : FAQS;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-flame-50 text-flame-600 text-[11px] font-bold uppercase tracking-wider rounded-lg">
          <Flame className="w-3.5 h-3.5" /> Questions? We've Got You
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-cocoa-800 mt-3">Frequently Asked Questions</h1>
        <p className="text-sm text-cocoa-500 mt-2 max-w-md mx-auto">
          Quick answers about the kitchen, your orders, Holy Points, payment, and your account.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the FAQs..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400 transition-colors"
        />
      </div>

      {/* Quick categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((c) => (
          <div key={c.label} className="rounded-xl bg-white border border-cocoa-100 p-4 text-center">
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-xs font-bold text-cocoa-700">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-cocoa-400 py-8">No questions match your search.</p>
        )}
        {filtered.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="rounded-xl bg-white border border-cocoa-100 overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-bold text-sm text-cocoa-800 pr-3">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-cocoa-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-cocoa-600 leading-relaxed animate-fade-in">{f.a}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still curious */}
      <div className="rounded-2xl bg-cocoa-800 p-6 text-center text-white">
        <h3 className="font-heading font-bold text-lg mb-1">Still can't find what you're looking for?</h3>
        <p className="text-sm text-cocoa-300 mb-4">Hit us up directly — we reply fast.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <a href="mailto:holygrillfuta@gmail.com" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-semibold">Email us</a>
          <a href="tel:+2348056789012" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-semibold">Call us</a>
          <Link to="/menu" className="px-4 py-2 rounded-lg flame-gradient font-bold">Order now →</Link>
        </div>
      </div>
    </div>
  );
}