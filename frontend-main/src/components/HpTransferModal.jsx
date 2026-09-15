import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Send, Flame, AlertCircle, Check } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { toast } from '@/components/ui/use-toast';
import ModalPortal from '@/components/ModalPortal';

// Default minimum HP transfer — overridable by the `hp_transfer_min_amount`
// system setting so admins can change it without a code deploy.
const DEFAULT_MIN_TRANSFER = 10;

/**
 * HpTransferModal — send Holy Points to another student.
 * Recipients are sourced from the leaderboard (the student-accessible list of
 * active users). Self-transfer is blocked client-side and the backend rejects
 * it too.
 */
export default function HpTransferModal({ open, onClose }) {
  const { hpBalance, refreshHp, user, getSetting } = useHolyGrill();
  const MIN_AMOUNT = getSetting('hp_transfer_min_amount', DEFAULT_MIN_TRANSFER);
  const MIN_ORDERS = getSetting('hp_transfer_min_orders', 3);
  const [recipients, setRecipients] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [completedOrders, setCompletedOrders] = useState(null);
  const inputRef = useRef(null);

  // Eligibility: sender must have 3+ completed (delivered) orders before they
  // can transfer HP. The backend rejects with hp_transfer_min_orders; we check
  // client-side too so the user sees the requirement before picking a recipient.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    mockApi.orders
      .list({ limit: 100 })
      .then((orders) => {
        if (cancelled) return;
        const list = Array.isArray(orders) ? orders : [];
        setCompletedOrders(list.filter((o) => o.status === 'delivered').length);
      })
      .catch(() => { if (!cancelled) setCompletedOrders(0); });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoadingUsers(true);
    mockApi.leaderboard
      .get()
      .then((res) => {
        // Leaderboard may be { monthly, weekly, all_time } or a flat array.
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (res && typeof res === 'object') {
          list = [...(res.all_time || []), ...(res.monthly || []), ...(res.weekly || [])];
        }
        // De-duplicate by user id, drop the current user.
        const seen = new Set();
        const clean = [];
        for (const e of list) {
          const id = e.user_id || e.id;
          if (!id || seen.has(id) || id === user?.id) continue;
          seen.add(id);
          clean.push({ id, full_name: e.full_name || e.name || 'Student', tier: e.tier });
        }
        setRecipients(clean);
      })
      .catch(() => setRecipients([]))
      .finally(() => setLoadingUsers(false));
  }, [open, user?.id]);

  useEffect(() => {
    if (open) {
      setQuery(''); setSelected(null); setAmount(''); setNotes(''); setError(null); setDone(null);
    }
  }, [open]);

  if (!open) return null;

  // Eligibility gate — 3+ completed orders required before HP transfer.
  const eligible = completedOrders === null ? null : completedOrders >= MIN_ORDERS;

  const activeHp = hpBalance?.active || 0;
  const amt = parseInt(amount, 10);
  const amountValid = !isNaN(amt) && amt >= MIN_AMOUNT && amt <= activeHp;

  const filtered = query.trim()
    ? recipients.filter((r) => r.full_name.toLowerCase().includes(query.trim().toLowerCase()))
    : recipients.slice(0, 8);

  const handleSend = async () => {
    setError(null);
    if (!selected) { setError('Pick a recipient first.'); return; }
    if (selected.id === user?.id) { setError('You can\'t send HP to yourself.'); return; }
    if (isNaN(amt) || amt < MIN_AMOUNT) { setError(`Minimum transfer is ${MIN_AMOUNT} HP.`); return; }
    if (amt > activeHp) { setError('Insufficient HP balance.'); return; }
    setSending(true);
    try {
      const res = await mockApi.hp.transfer({ recipient_id: selected.id, amount: amt, notes: notes.trim() || undefined });
      await refreshHp();
      setDone({ amount: amt, name: res?.recipient_name || selected.full_name, newBalance: res?.new_balance });
      toast({ title: `🔥 ${amt} HP sent!`, description: `Sent to ${res?.recipient_name || selected.full_name}.`, sound: 'hp_transfer_sent' });
    } catch (e) {
      setError(e.message || 'Transfer failed.');
    }
    setSending(false);
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-cocoa-800">{done.amount} HP sent!</h3>
            <p className="text-sm text-cocoa-500 mt-1">Sent to {done.name}.{done.newBalance != null && ` New balance: ${done.new_balance} HP.`}</p>
            <button onClick={onClose} className="mt-5 w-full py-3 rounded-full flame-gradient text-white font-bold text-sm">Done</button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-lg text-cocoa-800 flex items-center gap-2"><Flame className="w-5 h-5 text-flame-600" /> Send HP</h3>
              <button onClick={onClose}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>

            <div className="rounded-2xl bg-cocoa-800 p-3 text-white mb-4">
              <div className="text-[10px] uppercase tracking-wide text-cocoa-300">Available HP</div>
              <div className="font-heading font-extrabold text-2xl">{activeHp}</div>
            </div>

            {/* Eligibility gate — 3+ completed orders required */}
            {eligible === false && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-amber-800">You need {MIN_ORDERS} completed orders to transfer HP</p>
                <p className="text-xs text-amber-600 mt-1">You've completed {completedOrders} so far. Order more to unlock HP transfer.</p>
                <button onClick={onClose} className="mt-3 px-5 py-2 rounded-full bg-amber-600 text-white text-xs font-bold">Got it</button>
              </div>
            )}

            {eligible !== false && (
            <>
            {/* Recipient search */}
            <label className="text-xs font-bold text-cocoa-500 uppercase">Recipient</label>
            <div className="relative mt-1">
              <Search className="w-4 h-4 text-cocoa-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                placeholder="Search by name…"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
              />
            </div>

            <div className="mt-2 max-h-40 overflow-y-auto space-y-1.5">
              {loadingUsers ? (
                <p className="text-xs text-cocoa-400 text-center py-2">Loading students…</p>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-cocoa-400 text-center py-2">No students found{query.trim() ? ' for that search' : ''}.</p>
              ) : (
                filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${selected?.id === r.id ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200 hover:border-cocoa-300'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-cocoa-100 flex items-center justify-center text-xs font-bold text-cocoa-600">
                      {r.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-cocoa-700 truncate">{r.full_name}</div>
                    </div>
                    {selected?.id === r.id && <Check className="w-4 h-4 text-flame-600" />}
                  </button>
                ))
              )}
            </div>

            {/* Amount */}
            <label className="text-xs font-bold text-cocoa-500 uppercase mt-4 block">Amount (min {MIN_AMOUNT} HP)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${MIN_AMOUNT}`}
              className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-lg font-bold focus:outline-none focus:border-flame-400"
            />
            <div className="flex gap-2 mt-2">
              {[10, 25, 50, 100].map((a) => (
                <button key={a} onClick={() => setAmount(String(a))} className="flex-1 py-1.5 rounded-lg bg-cocoa-50 text-xs font-bold text-cocoa-600">{a}</button>
              ))}
            </div>

            <label className="text-xs font-bold text-cocoa-500 uppercase mt-4 block">Note (optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Treat yourself!"
              className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
            />

            {error && (
              <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="text-xs text-red-800">{error}</span>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !selected || !amountValid}
              className="w-full mt-4 py-3 rounded-full flame-gradient text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? 'Sending…' : (<><Send className="w-4 h-4" /> Send{amt && !isNaN(amt) ? ` ${amt} HP` : ''}</>)}
            </button>
            <p className="text-[10px] text-cocoa-400 text-center mt-2">HP comes from your Active balance. Recipients are notified instantly.</p>
            </>
            )}
          </>
        )}
      </div>
    </div>
    </ModalPortal>
  );
}