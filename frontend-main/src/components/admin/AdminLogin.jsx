import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Lock, Mail } from 'lucide-react';
import { liveApi } from '@/lib/liveApi';

// Role-based login routine — the single doorway into the staff panels.
// After POST /api/auth/login, the user's role routes them to the right panel:
// admin/super_admin → /admin, kitchen → /kitchen, rider → /rider, student → / (site).
const ROLE_HOME = { admin: '/admin', super_admin: '/admin', kitchen: '/kitchen', rider: '/rider', student: '/' };

export default function AdminLogin({ onAuthed }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await liveApi.auth.login({ email, password });
      const role = data?.user?.role || 'student';
      if (onAuthed) onAuthed(role);
      navigate(ROLE_HOME[role] || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cocoa-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl flame-gradient flex items-center justify-center mb-3 shadow-lg">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-xl text-cocoa-800">Holy Grills Login</h1>
          <p className="text-xs text-cocoa-400 mt-1">Sign in — you'll be routed to your panel by role</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl bg-white border border-cocoa-100 p-5 space-y-3 shadow-sm">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@holygrills.ng"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
          </div>
          {error && <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-[11px] text-cocoa-400 text-center">Calls POST /api/auth/login — your token is stored locally for panel API calls.</p>
        </form>
      </div>
    </div>
  );
}