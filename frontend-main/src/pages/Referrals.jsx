import React, { useState } from 'react';
import { Flame, Users, Copy, Check, Share2, Gift, Loader2 } from 'lucide-react';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import ShareSheet from '@/components/ShareSheet';

// Milestone rewards — the bonus HP a student earns when their referral count
// crosses each threshold. The `reached` flag is derived from the live count.
const MILESTONES = [
  { count: 5, hp: 150 },
  { count: 10, hp: 400 },
  { count: 20, hp: 750 },
  { count: 30, hp: 1200 },
  { count: 50, hp: 2500 },
  { count: 75, hp: 1500 },
];

export default function Referrals() {
  const { user, isLoading } = useHolyGrill();
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Read the real referral code + stats from the authenticated user object.
  // The backend assigns referral_code at signup; auth.me surfaces it (plus the
  // running referral count + HP earned). We fall back gracefully so the page
  // renders an honest empty state if the fields are absent.
  const referralCode = user?.referral_code || user?.profile?.referral_code || '';
  const referralLink = referralCode ? `https://holygrill.app/r/${referralCode}` : '';
  const referredCount = user?.referral_count ?? user?.profile?.referral_count ?? user?.referrals_count ?? 0;
  const hpEarned = user?.referral_hp_earned ?? user?.profile?.referral_hp_earned ?? 0;
  const milestonesReached = MILESTONES.filter((m) => referredCount >= m.count).length;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => { if (referralCode) setShowShare(true); };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-flame-600 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Referrals 🔥</h1>

      {/* Referral Code Card */}
      <div className="rounded-2xl flame-gradient p-5 text-white text-center">
        <div className="text-4xl mb-2">🤝</div>
        <h2 className="font-heading font-bold text-lg">Invite Friends, Earn HP</h2>
        <p className="text-xs text-white/85 mt-1">You get 75 HP when your friend places their first order. They get 50 HP too!</p>

        <div className="mt-4 p-3 rounded-xl bg-white/20">
          <div className="text-xs text-white/80 uppercase font-bold">Your Referral Code</div>
          <div className="font-heading font-extrabold text-2xl tracking-wider mt-1 break-all">
            {referralCode || '—'}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleCopy}
            disabled={!referralLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-white text-flame-700 font-bold text-sm disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handleShare}
            disabled={!referralCode}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-white/20 text-white font-bold text-sm border border-white/30 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
        {!referralCode && (
          <p className="text-[10px] text-white/70 mt-2">Your referral code will appear here once your profile is fully loaded.</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-cocoa-100 p-3 text-center">
          <Users className="w-5 h-5 text-cocoa-400 mx-auto mb-1" />
          <div className="font-heading font-bold text-xl text-cocoa-800">{referredCount}</div>
          <div className="text-[10px] text-cocoa-400">Referred</div>
        </div>
        <div className="rounded-2xl bg-white border border-cocoa-100 p-3 text-center">
          <Flame className="w-5 h-5 text-flame-600 mx-auto mb-1" />
          <div className="font-heading font-bold text-xl text-cocoa-800">{hpEarned}</div>
          <div className="text-[10px] text-cocoa-400">HP Earned</div>
        </div>
        <div className="rounded-2xl bg-white border border-cocoa-100 p-3 text-center">
          <Gift className="w-5 h-5 text-gold-500 mx-auto mb-1" />
          <div className="font-heading font-bold text-xl text-cocoa-800">{milestonesReached}</div>
          <div className="text-[10px] text-cocoa-400">Milestones</div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h2 className="font-heading font-bold text-lg text-cocoa-800 mb-2">Referral Milestones</h2>
        <div className="space-y-2">
          {MILESTONES.map(m => {
            const reached = referredCount >= m.count;
            return (
              <div key={m.count} className={`flex items-center gap-3 p-3 rounded-2xl border ${reached ? 'bg-green-50 border-green-200' : 'bg-white border-cocoa-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reached ? 'bg-green-500' : 'bg-cocoa-100'}`}>
                  {reached ? <Check className="w-5 h-5 text-white" /> : <Users className="w-5 h-5 text-cocoa-400" />}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-cocoa-800">{m.count} friends referred</div>
                  <div className="text-xs text-cocoa-400">Earn {m.hp} HP bonus</div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold ${reached ? 'text-green-600' : 'text-cocoa-400'}`}>
                  <Flame className="w-3 h-3" />{m.hp}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        type="referral"
        payload={{
          headline: 'Join Holy Grill',
          value: referralCode,
          caption: `Use my code ${referralCode} and we both earn 75 HP on your first order! 🔥`,
          link: referralLink,
        }}
      />
    </div>
  );
}