import { useState } from 'react';
import { MOCK_TICKETS } from '@/data/mockOrders';
import type { SupportTicket, TicketStatus, TicketPriority } from '@/types';
import { MessageSquare, Search, X, Send, AlertTriangle, Clock, CheckCircle2, XCircle, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  open: { label: 'Open', color: 'text-primary', bgColor: 'bg-primary/10', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-accent', bgColor: 'bg-accent/10', icon: Clock },
  resolved: { label: 'Resolved', color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: XCircle },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-foreground' },
  high: { label: 'High', color: 'text-accent' },
  urgent: { label: 'Urgent', color: 'text-destructive' },
};

const AdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = tickets.filter((t) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicket);

  const sendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: `m-${Date.now()}`, sender: 'admin' as const, message: replyText, timestamp: new Date().toISOString() },
              ],
              status: t.status === 'open' ? 'in_progress' as TicketStatus : t.status,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setReplyText('');
    toast.success('Reply sent');
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              updatedAt: new Date().toISOString(),
              ...(status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}),
            }
          : t
      )
    );
    toast.success(`Ticket ${STATUS_CONFIG[status].label.toLowerCase()}`);
  };

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const urgentCount = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        {/* Ticket list */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-body font-medium transition-all ${
                    statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_CONFIG[s as TicketStatus]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
            {filtered.map((ticket) => {
              const sConfig = STATUS_CONFIG[ticket.status];
              const pConfig = PRIORITY_CONFIG[ticket.priority];
              const isActive = selectedTicket === ticket.id;

              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-body font-medium truncate">{ticket.subject}</p>
                      <p className="text-[10px] text-muted-foreground font-body">{ticket.userName} · {ticket.id}</p>
                    </div>
                    {ticket.priority === 'urgent' && <AlertTriangle size={12} className="text-destructive shrink-0 mt-0.5" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-body font-medium ${sConfig.bgColor} ${sConfig.color}`}>
                      {sConfig.label}
                    </span>
                    <span className={`text-[9px] font-body font-medium ${pConfig.color}`}>
                      {pConfig.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-body ml-auto">
                      {ticket.messages.length} msg{ticket.messages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground font-body">No tickets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
          {activeTicket ? (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-foreground text-base">{activeTicket.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-body">{activeTicket.userName}</span>
                      <span className="text-[10px] text-muted-foreground font-body">·</span>
                      <span className="text-xs text-muted-foreground font-body">{activeTicket.userEmail}</span>
                      {activeTicket.orderId && (
                        <>
                          <span className="text-[10px] text-muted-foreground font-body">·</span>
                          <span className="text-xs text-primary font-body font-medium">#{activeTicket.orderId}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {activeTicket.status !== 'resolved' && activeTicket.status !== 'closed' && (
                      <button
                        onClick={() => updateTicketStatus(activeTicket.id, 'resolved')}
                        className="px-2.5 py-1 rounded-md bg-success/10 text-success text-[10px] font-body font-semibold hover:bg-success/20 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 size={10} /> Resolve
                      </button>
                    )}
                    {activeTicket.status === 'resolved' && (
                      <button
                        onClick={() => updateTicketStatus(activeTicket.id, 'closed')}
                        className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[10px] font-body font-semibold hover:bg-border transition-colors flex items-center gap-1"
                      >
                        <XCircle size={10} /> Close
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeTicket.messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'admin' ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                      {msg.sender === 'admin' ? (
                        <span className="text-[9px] font-bold text-primary font-body">A</span>
                      ) : (
                        <User size={12} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className={`max-w-[75%] ${msg.sender === 'admin' ? 'text-right' : ''}`}>
                      <div className={`p-3 rounded-xl text-sm font-body ${
                        msg.sender === 'admin'
                          ? 'bg-primary/10 text-foreground rounded-tr-sm'
                          : 'bg-secondary text-foreground rounded-tl-sm'
                      }`}>
                        {msg.message}
                      </div>
                      <p className="text-[9px] text-muted-foreground font-body mt-1">
                        {new Date(msg.timestamp).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              {activeTicket.status !== 'closed' && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!replyText.trim()}
                      className="px-4 py-2.5 rounded-lg bg-gradient-fire text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-body">Select a ticket to view conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
