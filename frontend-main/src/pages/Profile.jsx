import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Calendar, Lock, Bell, LogOut, ChevronRight, Shield, Trash2, Flame, MapPin as MapPinIcon, Wallet as WalletIcon, Volume2, VolumeX, LayoutDashboard, ChefHat, Bike, Store, CalendarDays, Sparkles, Crown, GraduationCap, BookOpen, X } from 'lucide-react';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { mockApi } from '@/lib/mockApi';
import { useSound } from '@/lib/SoundProvider';
import { getTierProgress, formatDate } from '@/lib/hgUtils';
import ImageUploader from '@/components/admin/ImageUploader';

export default function Profile() {
  const navigate = useNavigate();
  const { user, hpBalance, logout, refreshUser } = useHolyGrill();
  const { soundOn, toggleSound } = useSound();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.profile?.phone || '',
    department_id: user?.profile?.department_id || '',
    academic_level_id: user?.profile?.academic_level_id || '',
    avatar_url: user?.avatar_url || user?.profile?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [freeSideCredits, setFreeSideCredits] = useState({ count: 0, expires_at: null });
  const [exclusiveStatus, setExclusiveStatus] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [academicLevels, setAcademicLevels] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    (async () => {
      try { setFreeSideCredits(await mockApi.rewards.getFreeSideCredits()); } catch { /* ignore */ }
      try { setExclusiveStatus(await mockApi.hp.getExclusiveSpinStatus()); } catch { /* ignore */ }
      try { setDepartments(await mockApi.departments.list()); } catch { /* ignore */ }
      try { setAcademicLevels(await mockApi.academicLevels.list()); } catch { /* ignore */ }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await mockApi.auth.updateProfile(form);
      await refreshUser();
      setEditing(false);
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (confirm('Log out of Holy Grill?')) {
      await logout();
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (!deletePassword.trim()) { setDeleteError('Enter your password to confirm.'); return; }
    setDeleting(true);
    try {
      await mockApi.auth.deleteAccount({ password: deletePassword, reason: deleteReason.trim() || undefined });
      await logout();
      navigate('/');
    } catch (e) {
      setDeleteError(e.message || 'Could not delete account.');
    }
    setDeleting(false);
  };

  const tierInfo = hpBalance ? getTierProgress(hpBalance.hp_earned_120day) : null;

  const links = [
    { to: '/streak', icon: Flame, label: 'Check-in Streak' },
    { to: '/leaderboard', icon: Sparkles, label: 'Exclusive Spin' },
    { to: '/hall-of-fame', icon: Crown, label: 'Hall of Fame' },
    { to: '/addresses', icon: MapPinIcon, label: 'Saved Addresses' },
    { to: '/notification-preferences', icon: Bell, label: 'Notification Preferences' },
    { to: '/referrals', icon: Flame, label: 'Referrals' },
    { to: '/wallet', icon: WalletIcon, label: 'Wallet' },
    { to: '/order-locks', icon: Lock, label: 'Order Locks' },
  ];

  const staffLinks = [
    { to: '/marketplace', icon: Store, label: 'Marketplace' },
    { to: '/events', icon: CalendarDays, label: 'Events' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Profile</h1>

      {/* Profile Card */}
      <div className="rounded-2xl bg-gradient-to-br from-cocoa-700 to-cocoa-900 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden flame-gradient flex items-center justify-center text-2xl font-bold shrink-0">
            {(user?.avatar_url || user?.profile?.avatar_url) ? (
              <img src={user?.avatar_url || user?.profile?.avatar_url} alt={user?.full_name} className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0)
            )}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="bg-white/20 rounded-lg px-2 py-1 text-white text-lg font-bold focus:outline-none"
              />
            ) : (
              <h2 className="font-heading font-bold text-lg">{user?.full_name}</h2>
            )}
            <p className="text-xs text-cocoa-300">{user?.email}</p>
          </div>
          {tierInfo && (
            <div className="text-right">
              <div className="text-2xl">{tierInfo.current.icon}</div>
              <div className="text-xs font-bold">{tierInfo.current.name}</div>
            </div>
          )}
        </div>
        {editing && (
          <div className="mt-3 space-y-2">
            <div className="bg-white/10 rounded-lg p-2">
              <ImageUploader value={form.avatar_url} onChange={(url) => setForm({ ...form, avatar_url: url })} folder="avatars" label="Avatar" />
            </div>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none placeholder-white/50"
              placeholder="Phone"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              >
                <option value="" className="text-cocoa-800">Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="text-cocoa-800">{d.name}</option>
                ))}
              </select>
              <select
                value={form.academic_level_id}
                onChange={(e) => setForm({ ...form, academic_level_id: e.target.value })}
                className="w-full bg-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              >
                <option value="" className="text-cocoa-800">Level</option>
                {academicLevels.map((l) => (
                  <option key={l.id} value={l.id} className="text-cocoa-800">{l.name || l.label || l.level}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="mt-3 flex gap-2">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-full bg-white text-cocoa-800 font-bold text-xs">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-full bg-white/20 text-white font-bold text-xs">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex-1 py-2 rounded-full bg-white/20 text-white font-bold text-xs">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-white border border-cocoa-100 p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-cocoa-400" />
          <span className="text-cocoa-600">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-cocoa-400" />
          <span className="text-cocoa-600">{user?.profile?.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-cocoa-400" />
          <span className="text-cocoa-600">DOB: {formatDate(user?.profile?.date_of_birth)}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="w-4 h-4 text-cocoa-400" />
          <span className="text-cocoa-600 capitalize">Role: {user?.role}</span>
        </div>
        {(departments.find((d) => d.id === user?.profile?.department_id)?.name || user?.profile?.department) && (
          <div className="flex items-center gap-3 text-sm">
            <BookOpen className="w-4 h-4 text-cocoa-400" />
            <span className="text-cocoa-600">{departments.find((d) => d.id === user?.profile?.department_id)?.name || user?.profile?.department}</span>
          </div>
        )}
        {(academicLevels.find((l) => l.id === user?.profile?.academic_level_id)?.name || user?.profile?.academic_level) && (
          <div className="flex items-center gap-3 text-sm">
            <GraduationCap className="w-4 h-4 text-cocoa-400" />
            <span className="text-cocoa-600">{academicLevels.find((l) => l.id === user?.profile?.academic_level_id)?.name || academicLevels.find((l) => l.id === user?.profile?.academic_level_id)?.label || user?.profile?.academic_level}</span>
          </div>
        )}
      </div>

      {/* Rewards summary */}
      <div className="rounded-2xl bg-white border border-cocoa-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-flame-600" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-flame-600">My Rewards</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/rewards" className="rounded-xl bg-flame-50 p-3 text-center">
            <div className="text-2xl">🏆</div>
            <div className="font-heading font-extrabold text-lg text-cocoa-800">{freeSideCredits?.count ?? 0}</div>
            <div className="text-[10px] text-cocoa-400">Free side credits</div>
          </Link>
          <Link to="/leaderboard" className="rounded-xl bg-cocoa-50 p-3 text-center">
            <div className="text-2xl">🎡</div>
            <div className="font-heading font-extrabold text-lg text-cocoa-800">{exclusiveStatus?.spins_available ?? exclusiveStatus?.spins ?? 0}</div>
            <div className="text-[10px] text-cocoa-400">Exclusive spins</div>
          </Link>
        </div>
      </div>

      {/* Sound Toggle */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-cocoa-100">
        <div className="w-9 h-9 rounded-full bg-flame-50 flex items-center justify-center">
          {soundOn ? <Volume2 className="w-5 h-5 text-flame-600" /> : <VolumeX className="w-5 h-5 text-cocoa-400" />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-cocoa-700">Sound Effects</div>
          <div className="text-xs text-cocoa-400">{soundOn ? 'On — amplifying moments that matter' : 'Off'}</div>
        </div>
        <button onClick={toggleSound} className={`w-11 h-6 rounded-full p-1 transition-colors ${soundOn ? 'flame-gradient' : 'bg-cocoa-200'}`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${soundOn ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Quick Links */}
      <div className="space-y-1">
        {links.map(link => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-cocoa-100 hover:shadow-sm transition-all"
          >
            <link.icon className="w-5 h-5 text-cocoa-400" />
            <span className="flex-1 text-left text-sm font-medium text-cocoa-700">{link.label}</span>
            <ChevronRight className="w-4 h-4 text-cocoa-300" />
          </button>
        ))}
      </div>

      {/* Explore */}
      <div className="space-y-2">
        <div className="px-1 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-flame-600" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-flame-600">Explore</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {staffLinks.map((s) => (
            <button
              key={s.to}
              onClick={() => navigate(s.to)}
              className="flex items-center gap-2 p-3 rounded-2xl bg-flame-50 border border-flame-200 hover:bg-flame-100 transition-colors"
            >
              <s.icon className="w-4 h-4 text-flame-600" />
              <span className="text-xs font-bold text-cocoa-700">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-1">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-red-50 border border-red-200">
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="flex-1 text-left text-sm font-bold text-red-600">Logout</span>
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-cocoa-100"
        >
          <Trash2 className="w-5 h-5 text-cocoa-400" />
          <span className="flex-1 text-left text-sm font-medium text-cocoa-500">Delete Account</span>
        </button>
      </div>

      {/* Delete Account Modal — requires the user's real password (spec §2.7). */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => !deleting && setShowDelete(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-heading font-bold text-lg text-cocoa-800">Delete Account</h3>
              <button onClick={() => setShowDelete(false)} disabled={deleting}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <p className="text-xs text-cocoa-500 mb-4">This permanently deactivates your account and removes your personal data. This action is irreversible.</p>
            <div className="space-y-3">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
              />
              <input
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Reason (optional)"
                className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
              />
              {deleteError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-xs text-red-700 font-semibold">{deleteError}</span>
                </div>
              )}
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full py-3 rounded-full bg-red-600 text-white font-bold text-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}