import React, { useState, useEffect } from 'react';
import { Crown, Share2, Award, X, Download } from 'lucide-react';
import { liveApi } from '@/lib/liveApi';
import { isFeatureEnabled } from '@/lib/featureConfig';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

// Hall of Fame — inductees are users with 3+ Top 4 finishes. Each inductee gets
// a shareable card. Inducted users earn a 🏅 Hall of Fame Reward tag on their
// orders (a free reward item added by the backend).
export default function HallOfFame() {
  const [inductees, setInductees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [cardLoading, setCardLoading] = useState(null);
  const enabled = isFeatureEnabled('hall_of_fame', true);

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    (async () => {
      try {
        const res = await liveApi.leaderboard.getHallOfFame();
        const list = Array.isArray(res) ? res : (res?.inductees || res?.winners || res?.hall_of_fame || []);
        setInductees(list);
      } catch (e) { /* ignore */ }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewCard = async (inductee) => {
    const cardId = inductee?.id || inductee?.winner?.user_id || inductee?.user_id;
    if (!cardId) { toast({ title: 'Card unavailable', description: 'This inductee has no shareable card yet.', variant: 'destructive' }); return; }
    setCardLoading(cardId);
    try {
      const res = await liveApi.leaderboard.getHallOfFameCard(cardId);
      setCard(res);
    } catch (e) {
      toast({ title: 'Could not load card', description: e.message, variant: 'destructive' });
    }
    setCardLoading(null);
  };

  const handleShare = async (inductee) => {
    const name = inductee?.winner?.full_name || inductee?.full_name || inductee?.name || 'This griller';
    const finishes = inductee?.winner?.streak_count || inductee?.streak_count || inductee?.top4_finishes || 3;
    const text = `🏅 ${name} just got inducted into the Holy Grills Hall of Fame with ${finishes}+ Top 4 finishes! 🔥`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Holy Grills Hall of Fame', text }); } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(text); toast({ title: 'Copied!', description: 'Share text copied to clipboard.' }); }
      catch { toast({ title: 'Share unavailable', description: text, variant: 'destructive' }); }
    }
  };

  if (loading) return <LoadingSpinner label="Loading Hall of Fame…" />;

  if (!enabled) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-4xl mb-3">🏅</div>
        <h2 className="font-heading font-bold text-lg text-cocoa-800">Hall of Fame is coming soon</h2>
        <p className="text-sm text-cocoa-400 mt-1">Inductees are added after each season. Check back!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-heading font-bold text-xl text-cocoa-800">Hall of Fame 🏅</h1>
        <p className="text-sm text-cocoa-400">Legends with 3+ Top 4 finishes. Inducted grillers earn a 🏅 Hall of Fame Reward on their orders.</p>
      </div>

      {inductees.length === 0 ? (
        <div className="rounded-2xl bg-white border border-cocoa-100 p-8 text-center">
          <Crown className="w-8 h-8 text-cocoa-200 mx-auto mb-2" />
          <p className="text-sm text-cocoa-400">No inductees yet this season. Climb the leaderboard and you could be first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inductees.map((entry, i) => {
            const w = entry.winner || entry;
            const name = w.full_name || w.name || 'Griller';
            const finishes = w.streak_count || w.top4_finishes || entry.top4_finishes || 3;
            const period = entry.period_key || entry.period_label || entry.inducted_at;
            return (
              <div key={entry.id || w.user_id || i} className="rounded-2xl bg-gradient-to-br from-cocoa-700 to-cocoa-900 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flame-gradient flex items-center justify-center text-xl font-bold shrink-0">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-base">{name}</div>
                    <div className="text-xs text-cocoa-300 flex items-center gap-1">
                      <Award className="w-3 h-3" /> {finishes}+ Top 4 finishes
                    </div>
                    {period && <div className="text-[10px] text-cocoa-400 mt-0.5">Inducted {new Date(period).toLocaleDateString()}</div>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleViewCard(entry)}
                      disabled={cardLoading === (entry.id || entry.winner?.user_id)}
                      className="px-3 py-2 rounded-full bg-gold-400 text-cocoa-800 text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {cardLoading === (entry.id || entry.winner?.user_id) ? '…' : <>🏅 Card</>}
                    </button>
                    <button onClick={() => handleShare(entry)} className="px-3 py-2 rounded-full bg-white/15 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform shrink-0">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inductee card modal — fetched from /leaderboard/hall-of-fame/inductees/{id}/card */}
      {card && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setCard(null)}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-heading font-bold text-base text-cocoa-800">Hall of Fame Card 🏅</h3>
              <button onClick={() => setCard(null)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            {card.image_url ? (
              <img src={card.image_url} alt="Hall of Fame card" className="w-full rounded-2xl mb-3 object-cover" />
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-cocoa-700 to-cocoa-900 p-6 text-center text-white mb-3">
                <div className="text-5xl mb-2">🏅</div>
                <div className="font-heading font-bold text-lg">{card.full_name || card.name || 'Inductee'}</div>
                <div className="text-xs text-cocoa-300 mt-1">{card.top4_finishes || card.finishes || 3}+ Top 4 finishes</div>
                {card.inducted_at && <div className="text-[10px] text-cocoa-400 mt-1">Inducted {new Date(card.inducted_at).toLocaleDateString()}</div>}
              </div>
            )}
            <p className="text-xs text-cocoa-500 text-center mb-3">{card.share_text || `🏅 ${card.full_name || card.name || 'This griller'} is a Holy Grills Hall of Fame inductee — a 🏅 reward on every order.`}</p>
            <div className="flex gap-2">
              {card.image_url && (
                <a href={card.image_url} download className="flex-1 py-2.5 rounded-full bg-cocoa-100 text-cocoa-700 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Save
                </a>
              )}
              <button
                onClick={async () => {
                  const text = card.share_text || `🏅 ${card.full_name || card.name || 'This griller'} — Holy Grills Hall of Fame!`;
                  if (navigator.share) { try { await navigator.share({ title: 'Hall of Fame', text }); } catch { /* cancelled */ } }
                  else { try { await navigator.clipboard.writeText(text); toast({ title: 'Copied!' }); } catch { toast({ title: 'Share unavailable', description: text, variant: 'destructive' }); } }
                }}
                className="flex-1 py-2.5 rounded-full flame-gradient text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}