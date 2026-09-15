'use client';

import { useState } from 'react';
import { QrCode, Loader2, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { checkinEvent } from '@/services/api/events.service';

interface EventCheckInScannerProps {
  eventId?: string;
  onSuccess?: () => void;
}

export function EventCheckInScanner({ eventId, onSuccess }: EventCheckInScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    setLoading(true);
    try {
      const res = await checkinEvent(eventId || 'general', {
        email: '',
        ticket_id: ticketCode.trim(),
        qr_token: ticketCode.trim(),
      });
      toast.success(res.message || 'Check-In Successful!');
      if (onSuccess) onSuccess();
      setScanning(false);
      setTicketCode('');
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { error?: string } }; message?: string });
      toast.error(errRes.response?.data?.error || errRes.message || 'Check-in failed. Please verify the ticket code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode size={20} className="text-primary" />
          <h3 className="font-display font-bold text-foreground text-base">Event Check-In Scanner</h3>
        </div>
        {!scanning ? (
          <button
            onClick={() => setScanning(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs"
          >
            <Camera size={14} /> Scan QR
          </button>
        ) : (
          <button onClick={() => setScanning(false)} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        )}
      </div>

      {scanning && (
        <form onSubmit={handleScan} className="space-y-3 animate-in fade-in">
          <p className="text-xs text-muted-foreground">Scan event ticket QR code or enter ticket code manually below:</p>
          <div className="flex gap-2">
            <input
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              placeholder="e.g. TKT-EVENT-8821"
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono text-foreground"
            />
            <button
              type="submit"
              disabled={loading || !ticketCode.trim()}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs disabled:opacity-50 flex items-center gap-1"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Check In'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
