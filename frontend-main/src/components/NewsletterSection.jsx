import React, { useState } from 'react';
import { Mail, Check, Flame } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

/**
 * NewsletterSection — on-brand "Fire Feast Squad" newsletter signup.
 * Replaces the cramped dark strip with a warm, prominent CTA card.
 */
export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast({ title: "🔥 You're in!", description: 'Watch your inbox for drops + challenges.' });
  };

  return (
    <section className="rounded-2xl bg-cocoa-800 text-white overflow-hidden relative">
      {/* Decorative flame glow */}
      <div className="absolute -right-8 -bottom-8 text-8xl opacity-10 select-none">🔥</div>

      <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
        <div className="flex items-center gap-3 shrink-0 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl flame-gradient flex items-center justify-center shadow-selected">
            <Flame className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-300 block">Fire Feast Squad</span>
            <h3 className="font-heading font-bold text-base text-white mt-0.5">Drops + challenges, first.</h3>
            <p className="text-xs text-cream-300 mt-0.5 hidden sm:block">Join the squad — never miss a reward drop.</p>
          </div>
        </div>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/15 border border-green-400/30 text-green-300 text-sm font-semibold sm:ml-auto">
            <Check className="w-4 h-4" /> You're in! Watch your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:max-w-md sm:ml-auto">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-cocoa-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-3 rounded-xl text-cocoa-800 text-sm bg-white border-0 focus:outline-none focus:ring-2 focus:ring-flame-400"
              />
            </div>
            <button type="submit" className="px-5 py-3 rounded-xl flame-gradient text-white font-bold text-sm whitespace-nowrap shadow-sm hover:scale-[1.02] transition-transform">
              Join
            </button>
          </form>
        )}
      </div>
    </section>
  );
}