import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Flame, Users, Award, TrendingUp, ArrowUp, ArrowDown, Minus, Clock } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { TIERS } from '@/lib/mockData';
import { isFeatureEnabled } from '@/lib/featureConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import SpinWheel from '@/components/SpinWheel';
import LeaderboardPrizeBadge from '@/components/LeaderboardPrizeBadge';

const VIEWS = [
  { id: 'user', label: 'User' },
  { id: 'squad', label: 'Squad' },
];

const PERIODS = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'all_time', label: 'All-time' },
];

const getWeeklyCountdown = () => {
  const now = new Date();
  const next = new Date(now);
  const day = now.getDay();
  const daysUntil = day === 0 ? 0 : 7 - day;
  next.setDate(now.getDate() + daysUntil);
  next.setHours(23, 59, 59, 0);
  let diff = next - now;
  if (diff < 0) diff = 0;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours };
};

function RankChange({ change }) {
  if (!change || change === 0) return <Minus className="w-3 h-3 text-cocoa-300" />;
  return change > 0 ? (
    <span className="flex items-center gap-0.5 text-green-600 text-[10px] font-bold">
      <ArrowUp className="w-3 h-3" />{change}
    </span>
  ) : (
    <span className="flex items-center gap-0.5 text-cocoa-400 text-[10px] font-bold">
      <ArrowDown className="w-3 h-3" />{Math.abs(change)}
    </span>
  );
}

export default function Leaderboard() {
  const { hpBalance, user } = useHolyGrill();
  const [view, setView] = useState('user');
  const [period, setPeriod] = useState('monthly');
  const [rankings, setRankings] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [squadRankings, setSquadRankings] = useState([]);
  const [hallOfFame, setHallOfFame] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(getWeeklyCountdown());
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [exclusiveStatus, setExclusiveStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setCountdown(getWeeklyCountdown()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Promise.allSettled so guests (no my-rank access) still see the public
      // snapshot rankings + hall of fame — the page never blanks out.
      const [lb, my, squad, hof, prizeList, exSpin] = await Promise.allSettled([
        mockApi.leaderboard.get({ period_type: period }),
        mockApi.leaderboard.getMyRank({ period_type: period }),
        mockApi.leaderboard.getSquad({ period_type: period }),
        mockApi.leaderboard.getHallOfFame(),
        mockApi.leaderboard.getPrizes({ period_type: period }),
        mockApi.hp.getExclusiveSpinStatus(),
      ]);
      const lbRes = lb.status === 'fulfilled' ? lb.value : null;
      setRankings(lbRes?.rankings || (Array.isArray(lbRes) ? lbRes : []));
      // Snapshots are generated daily at 00:01 WAT — surface the freshness date.
      setLastUpdated(lbRes?.generated_at || lbRes?.snapshot_date || lbRes?.last_updated || null);
      setMyRank(my.status === 'fulfilled' ? (my.value?.rank_entry || my.value) : null);
      const sqRes = squad.status === 'fulfilled' ? squad.value : null;
      setSquadRankings(sqRes?.rankings || (Array.isArray(sqRes) ? sqRes : []));
      const hofRes = hof.status === 'fulfilled' ? hof.value : [];
      setHallOfFame(Array.isArray(hofRes) ? hofRes : []);
      const prRes = prizeList.status === 'fulfilled' ? prizeList.value : [];
      setPrizes(Array.isArray(prRes) ? prRes : (prRes?.prizes || []));
      setExclusiveStatus(exSpin.status === 'fulfilled' ? exSpin.value : null);
      setLoading(false);
    };
    load();
  }, [period]);

  const getTierIcon = (tierSlug) => TIERS.find((t) => t.slug === tierSlug)?.icon || '🔥';

  if (loading) return <LoadingSpinner label="Loading leaderboard..." />;

  const ahead = myRank ? rankings.find((r) => r.rank === myRank.rank - 1) : null;
  const diff = ahead && myRank ? ahead.hp_total - myRank.hp_total : 0;
  // Exclusive spin is wired to the backend's exclusive_spins credits — not just
  // a rank threshold. spins_available > 0 means the user has unexpired leaderboard
  // prize spins. hasSpun is derived from whether any spins have been used.
  const spinsAvailable = exclusiveStatus?.spins_available ?? exclusiveStatus?.spins ?? exclusiveStatus?.spin_count ?? 0;
  const spinEarned = spinsAvailable > 0;
  const hasSpun = spinEarned && spinsAvailable === 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header + freshness note */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-xl text-cocoa-800">Leaderboard 🏆</h1>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cocoa-50 border border-cocoa-200">
            <Clock className="w-3.5 h-3.5 text-cocoa-500" />
            <span className="text-[10px] font-bold text-cocoa-500">Updated {new Date(lastUpdated).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
          </div>
        )}
      </div>

      {/* Pinned user banner — always visible regardless of scroll */}
      {myRank && (
        <div className="sticky top-16 z-20 rounded-2xl bg-gradient-to-br from-cocoa-700 to-cocoa-900 p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flame-gradient flex items-center justify-center font-bold text-sm">
                #{myRank.rank}
              </div>
              <div>
                <div className="text-xs font-semibold">{user?.full_name?.split(' ')[0] || 'You'}</div>
                <div className="text-[10px] text-cocoa-300">{myRank.hp_total} HP this {period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'season'}</div>
              </div>
            </div>
            <div className="text-lg">{getTierIcon(hpBalance?.tier?.slug)}</div>
          </div>
        </div>
      )}

      {/* User ↔ Squad connected slider */}
      <div className="relative flex bg-cocoa-100 rounded-full p-1 max-w-xs">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${view === v.id ? 'flame-gradient text-white shadow-selected-soft' : 'text-cocoa-600'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Period pills */}
      {view !== 'squad' && (
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${period === p.id ? 'bg-flame-600 text-white' : 'bg-white text-cocoa-600 border border-cocoa-200'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Content with crossfade on tab/period switch */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view + period}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* USER */}
          {view === 'user' && (
            <>
              {hallOfFame.length > 0 && (
                <div className="rounded-2xl bg-gold-50 border border-gold-200 p-3 flex items-center gap-3 mb-4">
                  <Crown className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <div className="hg-body">
                    <span className="font-semibold text-cocoa-800">Hall of Fame:</span> {hallOfFame[0].winner.full_name} — {hallOfFame[0].winner.streak_count} months at the top 👑
                  </div>
                </div>
              )}

              {rankings.length >= 3 && (
                <div className="flex items-end justify-center gap-2 py-4 mb-4">
                  <PodiumBar rank={rankings[1]} place={2} height={96} delay={0.15} />
                  <PodiumBar rank={rankings[0]} place={1} height={128} delay={0} />
                  <PodiumBar rank={rankings[2]} place={3} height={80} delay={0.3} />
                </div>
              )}

              {/* Leaderboard-exclusive spin wheel — wired to exclusive_spins credits */}
              <div className={`rounded-2xl border p-4 mb-4 ${spinEarned ? 'bg-gradient-to-br from-flame-50 to-gold-50 border-flame-200' : 'bg-cocoa-50 border-cocoa-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${spinEarned ? 'bg-flame-600' : 'bg-cocoa-200'}`}>
                    🎡
                  </div>
                  <div className="flex-1">
                    {spinEarned ? (
                      <>
                        <div className="font-heading font-bold text-sm text-cocoa-800">{spinsAvailable} Spin{spinsAvailable !== 1 ? 's' : ''} Available! 🎉</div>
                        <div className="text-xs text-cocoa-500">Spin to win bonus HP, free sides, or exclusive prizes.</div>
                      </>
                    ) : (
                      <>
                        <div className="font-heading font-bold text-sm text-cocoa-400">No Spins Available</div>
                        <div className="text-xs text-cocoa-400">Win leaderboard prizes to earn exclusive spins.</div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => spinEarned && setShowSpinModal(true)}
                    disabled={!spinEarned}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-transform shrink-0 ${
                      spinEarned
                        ? 'flame-gradient text-white active:scale-95'
                        : 'bg-cocoa-200 text-cocoa-400 cursor-not-allowed'
                    }`}
                  >
                    Spin
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {rankings.map((entry, i) => (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${entry.is_current_user ? 'bg-flame-50 border-flame-300 ring-2 ring-flame-300' : 'hg-card'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${entry.rank <= 3 ? 'flame-gradient text-white' : 'bg-cocoa-100 text-cocoa-600'}`}>
                      {entry.rank}
                    </div>
                    {isFeatureEnabled('leaderboard_prizes', true) && (
                      <LeaderboardPrizeBadge rank={entry.rank} prize={prizes.find((p) => p.rank === entry.rank)} />
                    )}
                    <div className="text-sm">{getTierIcon(entry.tier)}</div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${entry.is_current_user ? 'text-flame-700' : 'text-cocoa-800'}`}>
                        {entry.full_name}{entry.is_current_user && ' (You)'}
                      </div>
                    </div>
                    <RankChange change={entry.rank_change} />
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-flame-500" />
                      <span className="font-semibold text-cocoa-800">{entry.hp_total}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* SQUAD */}
          {view === 'squad' && (
            <>
              <div className="flex items-center gap-2 hg-caption mb-3">
                <Users className="w-4 h-4 text-flame-600" />
                Squad rankings — order together, climb together.
              </div>
              {squadRankings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-cocoa-100 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-cocoa-300" />
                  </div>
                  <p className="text-sm font-semibold text-cocoa-600">No squad rankings yet</p>
                  <p className="text-xs text-cocoa-400 mt-1">Create a squad order from your cart to start climbing the squad leaderboard!</p>
                  <Link to="/cart" className="inline-block mt-4 px-5 py-2.5 rounded-full flame-gradient text-white text-xs font-bold">Start a Squad Order</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {squadRankings.map((squad, i) => (
                    <motion.div
                      key={squad.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="hg-card flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${squad.rank <= 3 ? 'flame-gradient text-white' : 'bg-cocoa-100 text-cocoa-600'}`}>{squad.rank}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-cocoa-800">{squad.squad_name}</div>
                        <div className="hg-caption">{squad.squad_size} members · {squad.squad_order_count} orders</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-flame-500" />
                        <span className="font-semibold text-cocoa-800">{squad.total_hp}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Spin wheel full-screen modal */}
      <SpinWheel
        open={showSpinModal}
        onClose={() => setShowSpinModal(false)}
        onResult={async () => {
          // Reload exclusive spin status after a spin to reflect the new count.
          try { setExclusiveStatus(await mockApi.hp.getExclusiveSpinStatus()); } catch { /* ignore */ }
        }}
        canSpin={spinEarned && !hasSpun}
      />
    </div>
  );
}

function PodiumBar({ rank, place, height, delay }) {
  const colors = ['from-gold-300 to-gold-500', 'from-cocoa-200 to-cocoa-300', 'from-gold-500 to-gold-700'];
  return (
    <div className="flex flex-col items-center" style={{ order: place === 1 ? 1 : place === 2 ? 0 : 2 }}>
      <div className="text-xs font-semibold text-cocoa-800 text-center max-w-[80px] truncate">{rank.full_name}</div>
      <div className="flex items-center gap-0.5 text-xs text-flame-600 font-semibold mb-1">
        <Flame className="w-3 h-3" />{rank.hp_total}
      </div>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height, opacity: 1 }}
        transition={{ delay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className={`w-16 rounded-t-xl bg-gradient-to-b ${colors[place - 1]} flex items-start justify-center pt-2 overflow-hidden`}
      >
        <span className="text-white font-bold text-lg">#{place}</span>
      </motion.div>
    </div>
  );
}