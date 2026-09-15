import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Flame, Mail, Lock, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { toast } from '@/components/ui/use-toast';

// Role-based login — after POST /api/auth/login the user's role routes them:
// admin/super_admin → /admin, kitchen → /kitchen, rider → /rider, student → /.
const ROLE_HOME = { admin: '/admin', super_admin: '/admin', kitchen: '/kitchen', rider: '/rider', student: '/' };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useHolyGrill();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => localStorage.getItem('hg_remember') === '1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const autoKickedRef = useRef(false);

  const doLogin = async (emailVal, passwordVal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(emailVal, passwordVal);
      const role = data?.role || data?.user?.role || 'student';
      toast({ title: '🔥 Welcome back!', description: `Good to see you again, ${data?.user?.full_name?.split(' ')[0] || 'griller'}.` });
      // Role-based routing: staff (admin/kitchen/rider) ALWAYS land on their own
      // role page — never on a student route, regardless of any `from` deep-link.
      // Students return to the page they were trying to reach IF it's a student
      // route; otherwise they land on the student home.
      const isStaff = ['admin', 'super_admin', 'kitchen', 'rider'].includes(role);
      const from = location.state?.from;
      const studentRoutes = ['/', '/menu', '/cart', '/checkout', '/orders', '/track-orders', '/dashboard', '/hp-education', '/rewards', '/wallet', '/profile', '/addresses', '/notifications', '/notification-preferences', '/referrals', '/order-locks', '/streak', '/leaderboard', '/events', '/marketplace', '/faq', '/terms', '/our-story', '/hall-of-fame'];
      const isStudentRoute = (p) => studentRoutes.includes(p) || /^\/(menu|orders|marketplace|events)\//.test(p);
      let dest;
      if (isStaff) {
        dest = ROLE_HOME[role] || '/admin';
      } else if (from && isStudentRoute(from)) {
        dest = from;
      } else {
        dest = ROLE_HOME[role] || '/';
      }
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (remember) localStorage.setItem('hg_remember', '1'); else localStorage.removeItem('hg_remember');
    await doLogin(email, password);
  };

  // Auto-kickstart: if the browser autofilled both fields (without the user
  // typing), submit immediately instead of waiting for the Sign In press.
  // Autofill doesn't fire React onChange, so we poll the DOM values via refs.
  useEffect(() => {
    const poll = setInterval(() => {
      const eVal = emailRef.current?.value || '';
      const pVal = passwordRef.current?.value || '';
      if (eVal && pVal && !autoKickedRef.current) {
        autoKickedRef.current = true;
        setEmail(eVal);
        setPassword(pVal);
        // Persist the remember-me preference before login so the token
        // lands in the right storage (localStorage vs sessionStorage).
        if (remember) localStorage.setItem('hg_remember', '1'); else localStorage.removeItem('hg_remember');
        clearInterval(poll);
        doLogin(eVal, pVal);
      }
    }, 250);
    const stop = setTimeout(() => clearInterval(poll), 3000);
    return () => { clearInterval(poll); clearTimeout(stop); };
  }, [remember]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo — flame icon only, no image */}
        <div className="w-14 h-14 rounded-2xl flame-gradient flex items-center justify-center shadow-selected mb-4">
          <Flame className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-heading font-bold text-xl text-foreground tracking-tight">HOLY GRILLS</h1>
        <p className="text-xs text-muted-foreground mt-1">FUTA's Only Flame Grill 🔥</p>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-button bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                placeholder="student@futa.edu.ng"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={passwordRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-button bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me + forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${remember ? 'bg-flame-600 border-flame-600' : 'border-border bg-input'}`}>
                {remember && <Check className="w-3 h-3 text-white" />}
              </span>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only" />
              <span className="text-xs font-semibold text-muted-foreground">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground font-semibold hover:text-primary">Forgot password?</Link>
          </div>

          {error && <div className="text-xs text-primary font-semibold">{error}</div>}

          {/* Core standalone CTA — gradient */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-button flame-gradient text-white font-bold shadow-selected-soft disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>

          <div className="text-center pt-1">
            <Link to="/register" className="text-xs text-primary font-bold">Create account →</Link>
          </div>
        </form>
      </div>
    </div>
  );
}