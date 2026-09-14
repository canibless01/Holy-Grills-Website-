import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/data/menu';
import { Search, X, Flame, TrendingUp, Crown, Edit3, ShieldAlert, CheckCircle, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { activateUser, changeUserRole, deactivateUser, getAdminUsers, getUserHpHistory, getUserOrderHistory } from '@/services/api/admin.service';

const ROLES = ['student', 'admin', 'kitchen', 'rider', 'super_admin'];

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'totalHP' | 'ordersCount' | 'totalSpent'>('totalHP');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const { data: fetchedUsers = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsers(),
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await changeUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success(`User role updated to ${newRole}`);
    } catch {
      toast.error('Only super_admin can assign super_admin role / Cannot change your own role');
    }
  };

  const handleToggleActive = async (user: (typeof users)[number]) => {
    try {
      if (user.is_active) {
        await deactivateUser(user.id);
        toast.success(`Deactivated account for ${user.name}`);
      } else {
        await activateUser(user.id);
        toast.success(`Reactivated account for ${user.name}`);
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !user.is_active } : u)));
    } catch {
      toast.error('Only super_admin users can deactivate a super_admin account');
    }
  };

  const handleViewUserDetail = async (userId: string) => {
    try {
      const [hpData, orders] = await Promise.all([
        getUserHpHistory(userId),
        getUserOrderHistory(userId),
      ]);
      const targetUser = users.find((u) => u.id === userId);
      setSelectedUserDetail({ user: targetUser, hpData, orders });
    } catch {
      toast.error("You don't have permission to view users from that campus");
    }
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
          <div className="col-span-2">Role</div>
          <div className="col-span-2">HP Balance</div>
          <div className="col-span-2">Status</div>
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
                    <button onClick={() => handleViewUserDetail(user.id)} className="text-sm text-foreground font-body font-medium truncate text-left hover:underline">
                      {user.name}
                    </button>
                    <p className="text-[10px] text-muted-foreground font-body truncate">{user.email}</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center">
                  <select
                    value={user.role || 'student'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-2 py-1 rounded bg-secondary border border-border text-xs font-body focus:outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center">
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-accent" />
                    <span className="font-body font-bold text-foreground text-sm">{user.totalHP}</span>
                    <span className="text-[10px] text-muted-foreground font-body">HP</span>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${user.is_active !== false ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                    {user.is_active !== false ? <CheckCircle size={11} /> : <ShieldAlert size={11} />}
                    {user.is_active !== false ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                      user.is_active !== false ? 'border-destructive/30 text-destructive hover:bg-destructive/10' : 'border-success/30 text-success hover:bg-success/10'
                    }`}
                  >
                    {user.is_active !== false ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUserDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display font-bold text-foreground text-lg">{selectedUserDetail.user?.name}</h3>
                <button onClick={() => setSelectedUserDetail(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Email:</strong> {selectedUserDetail.user?.email}</p>
                <p><strong className="text-foreground">Role:</strong> {selectedUserDetail.user?.role || 'student'}</p>
                <p><strong className="text-foreground">HP Balance:</strong> {selectedUserDetail.hpData?.hp_balance ?? selectedUserDetail.user?.totalHP ?? 0} HP</p>
                <p><strong className="text-foreground">Tier:</strong> {selectedUserDetail.hpData?.tier || 'Regular'} ({selectedUserDetail.hpData?.tier_multiplier || 1.0}x)</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">Order History</h4>
                {selectedUserDetail.orders?.length ? (
                  <div className="space-y-2 text-xs">
                    {selectedUserDetail.orders.map((o: any) => (
                      <div key={o.id} className="flex justify-between rounded-lg bg-secondary/50 p-2">
                        <span>{o.order_number || o.id}</span>
                        <span className="font-semibold text-foreground">{o.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No past orders found for this user.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
