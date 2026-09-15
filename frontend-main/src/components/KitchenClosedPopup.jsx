import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar } from 'lucide-react';
import { formatTime } from '@/lib/hgUtils';

/**
 * KitchenClosedPopup — informational only. Auto-appears when the kitchen is
 * closed (no ordering window open). Does NOT block ordering — cart/menu/
 * checkout stay live. "Schedule Future Order" opens a date + window picker,
 * then carries the student to the menu page.
 *
 * Dismissed state persists for the session so it doesn't nag.
 */
export default function KitchenClosedPopup({ status, scheduledWindows = [] }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [chosenDate, setChosenDate] = useState(0);
  const [chosenWindow, setChosenWindow] = useState(null);

  const dismissed = typeof window !== 'undefined' && sessionStorage.getItem('hg_kc_dismissed') === '1';

  useEffect(() => {
    if (status && !status.is_open && !dismissed) setOpen(true);
  }, [status, dismissed]);

  useEffect(() => {
    if (!open) return;
    // Backend returns next_window_starts_at (timestamp) when closed; the liveApi
    // normalises it into next_window.starts_at too. Read either for the countdown.
    const startsAt = status?.next_window_starts_at || status?.next_window?.starts_at;
    if (!startsAt) return;
    const target = new Date(startsAt).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setCountdown('Opening soon'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [open, status]);

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem('hg_kc_dismissed', '1'); } catch (e) { /* ignore */ }
  };

  const selectedW = scheduledWindows.find((w) => w.id === chosenWindow);

  // Auto-select the next available future window the first time the scheduler
  // opens (spec: the next available window is auto-selected as the default).
  useEffect(() => {
    if (scheduling && chosenWindow == null && scheduledWindows.length) {
      setChosenWindow(scheduledWindows[0].id);
    }
  }, [scheduling, chosenWindow, scheduledWindows]);

  const confirmSchedule = () => {
    if (selectedW) {
      try { sessionStorage.setItem('hg_scheduled_window', JSON.stringify(selectedW)); } catch { /* ignore */ }
    }
    setOpen(false);
    setScheduling(false);
    navigate('/menu');
  };

  const dates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="bg-white rounded-3xl w-full max-w-md p-6 relative"
          >
            <button onClick={close} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-cocoa-100 transition-colors">
              <X className="w-4 h-4 text-cocoa-500" />
            </button>

            {!scheduling ? (
              <div className="text-center">
                <div className="text-4xl mb-2">🔥</div>
                <h2 className="font-heading font-extrabold text-xl text-cocoa-800">We're Closed, Back Soon!</h2>
                <p className="text-sm text-cocoa-500 mt-1">{status?.message || 'Kitchen is currently closed.'}</p>
                {countdown && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-flame-50 border border-flame-200">
                    <Clock className="w-4 h-4 text-flame-600" />
                    <span className="text-sm font-bold text-flame-600">Back in {countdown}</span>
                  </div>
                )}
                <p className="text-xs text-cocoa-400 mt-3">Plan ahead with saved items or schedule your next order once the window reopens.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setScheduling(true)}
                    className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Schedule Future Order
                  </button>
                  <button onClick={close} className="w-full py-2.5 text-sm text-cocoa-500 font-semibold">Maybe later</button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-heading font-extrabold text-lg text-cocoa-800 mb-3">Schedule Future Order</h2>
                <label className="text-xs font-bold text-cocoa-500 uppercase tracking-wide">Choose a day</label>
                <div className="flex gap-2 mt-2 mb-3 overflow-x-auto scrollbar-hide">
                  {dates.map((d, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChosenDate(idx)}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${chosenDate === idx ? 'border-flame-400 bg-flame-50 text-flame-700' : 'border-cocoa-200 text-cocoa-600'}`}
                    >
                      {d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric' })}
                    </button>
                  ))}
                </div>
                <label className="text-xs font-bold text-cocoa-500 uppercase tracking-wide">Choose a time window</label>
                <select
                  value={chosenWindow ?? ''}
                  onChange={(e) => setChosenWindow(e.target.value)}
                  className="w-full mt-2 mb-4 p-3 rounded-xl border border-cocoa-200 text-sm bg-white focus:outline-none focus:border-flame-400"
                >
                  <option value="" disabled>Select a window</option>
                  {scheduledWindows.map((w) => (
                    <option key={w.id} value={w.id}>{w.label} · {formatTime(w.starts_at)}–{formatTime(w.ends_at)}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setScheduling(false)} className="flex-1 py-3 rounded-full border border-cocoa-200 text-cocoa-600 font-semibold text-sm">Back</button>
                  <button onClick={confirmSchedule} disabled={!chosenWindow} className="flex-1 py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-40">Confirm</button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}