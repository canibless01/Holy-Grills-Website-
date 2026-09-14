import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/data/menu';
import { Search, X, Flame, TrendingUp, Crown, ChevronDown, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getAdminUsers } from '@/services/api/admin.service';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'totalHP' | 'ordersCount' | 'totalSpent'>('totalHP');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const { data: fetchedUsers = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  });
  const [users, setUsers] = useState(fetchedUsers);
  const [hpInput, setHpInput] = useState('');

  useEffect(() => {
    setUsers(fetchedUsers);
  }, [fetchedUsers]);

  const filtered = users
    .filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const totalHP = users.reduce((sum, u) => sum + u.totalHP, 0);
  const topUser = [...users].sort((a, b) => b.totalHP - a.totalHP)[0];

  const adjustHP = (userId: string) => {
    const amount = parseInt(hpInput);
    if (isNaN(amount)) return;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, totalHP: Math.max(0, u.totalHP + amount) } : u)));
    toast.success(`HP ${amount >= 0 ? 'added' : 'deducted'} successfully`);
    setEditingUser(null);
    setHpInput('');
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading users…</p> : null}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Flame size={20} className="text-accent" />
          </div>
          <div>
            <p className="font-display font-bold text-foreground text-lg">{totalHP.toLocaleString()} HP</p>
            <p className="text-xs text-muted-foreground font-body">Total HP distributed</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-foreground text-lg">{users.reduce((s, u) => s + u.ordersCount, 0)}</p>
            <p className="text-xs text-muted-foreground font-body">Total orders placed</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Crown size={20} className="text-success" />
          </div>
          <div>
            <p className="font-display font-bold text-foreground text-lg">{topUser?.name.split(' ')[0]}</p>
            <p className="text-xs text-muted-foreground font-body">Top HP earner — {topUser?.totalHP} HP</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[
            { value: 'totalHP' as const, label: 'HP' },
            { value: 'ordersCount' as const, label: 'Orders' },
            { value: 'totalSpent' as const, label: 'Spent' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                sortBy === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              Sort: {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 border-b border-border text-xs font-body font-medium text-muted-foreground">
          <div className="col-span-1">#</div>
          <div className="col-span-3">User</div>
          <div className="col-span-2">HP Balance</div>
          <div className="col-span-2">Orders</div>
          <div className="col-span-2">Total Spent</div>
          <div className="col-span-2">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((user, idx) => (
            <div key={user.id}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                <div className="md:col-span-1 flex items-center">
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold font-body ${
                    idx === 0 ? 'bg-accent/20 text-accent' : idx === 1 ? 'bg-muted text-foreground' : idx === 2 ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </span>
                </div>
                <div className="md:col-span-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary font-body">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-body font-medium truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-body truncate">{user.email}</p>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-accent" />
                    <span className="font-body font-bold text-foreground text-sm">{user.totalHP}</span>
                    <span className="text-[10px] text-muted-foreground font-body">HP</span>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <span className="text-sm text-foreground font-body">{user.ordersCount} orders</span>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <span className="text-sm text-foreground font-body font-medium">{formatPrice(user.totalSpent)}</span>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <button
                    onClick={() => { setEditingUser(editingUser === user.id ? null : user.id); setHpInput(''); }}
                    className="px-2.5 py-1 rounded-md bg-accent/10 text-accent text-[10px] font-body font-semibold hover:bg-accent/20 transition-colors flex items-center gap-1"
                  >
                    <Edit3 size={10} /> Adjust HP
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {editingUser === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-3 bg-secondary/10 border-t border-border flex items-center gap-3">
                      <input
                        type="number"
                        value={hpInput}
                        onChange={(e) => setHpInput(e.target.value)}
                        placeholder="+50 or -20"
                        className="w-32 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={() => adjustHP(user.id)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-body font-semibold hover:bg-primary-hover transition-colors"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-xs font-body hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
