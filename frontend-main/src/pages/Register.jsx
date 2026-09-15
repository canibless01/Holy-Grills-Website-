import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, ArrowRight, Mail, Lock, User, Phone, Calendar, Gift, ChevronDown, AlertCircle, Eye, EyeOff, BookOpen, GraduationCap } from 'lucide-react';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { mockApi } from '@/lib/mockApi';
import { toast } from '@/components/ui/use-toast';

const ROLE_HOME = { admin: '/admin', super_admin: '/admin', kitchen: '/kitchen', rider: '/rider', student: '/' };
const STUDENT_HOME = '/';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useHolyGrill();
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm: '',
    phone: '', date_of_birth: '', department_id: '', academic_level_id: '', referred_by: '',
  });
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [academicLevels, setAcademicLevels] = useState([]);

  useEffect(() => {
    (async () => {
      try { setDepartments(await mockApi.departments.list()); } catch { /* ignore */ }
      try { setAcademicLevels(await mockApi.academicLevels.list()); } catch { /* ignore */ }
    })();
  }, []);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const validate = () => {
    if (!form.full_name.trim()) return 'Please enter your full name';
    if (!form.email.includes('@') || !form.email.includes('.')) return 'Enter a valid email';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) return 'Password needs uppercase, lowercase, number and special character';
    if (form.password !== form.confirm) return 'Passwords do not match';
    if (!form.phone.match(/^(0|\+234)\d{10}$/)) return 'Phone must be 11 digits (080...) or +234 + 10 digits';
    if (!form.date_of_birth) return 'Select your date of birth';
    const age = (Date.now() - new Date(form.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 16) return 'You must be at least 16 years old';
    if (!terms) return 'Please accept the Terms & Conditions';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      const phone = form.phone.startsWith('0') ? '+234' + form.phone.slice(1) : form.phone;
      const data = await register({
        full_name: form.full_name,
        email: form.email.toLowerCase(),
        password: form.password,
        phone,
        date_of_birth: form.date_of_birth,
        department_id: form.department_id || undefined,
        academic_level_id: form.academic_level_id || undefined,
        referred_by_code: form.referred_by || undefined,
      });
      toast({ title: '🔥 Account created', description: 'Welcome to Holy Grills — your grill journey starts now.' });
      const role = data?.role || data?.user?.role || 'student';
      const isStaff = ['admin', 'super_admin', 'kitchen', 'rider'].includes(role);
      window.location.href = isStaff ? (ROLE_HOME[role] || '/admin') : STUDENT_HOME;
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cocoa-50 flex flex-col">
      {/* Hero */}
      <div className="relative h-44 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=800&q=80" alt="Holy Grills" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-50 via-cocoa-900/60 to-cocoa-900/40" />
        <div className="relative h-full flex flex-col items-center justify-end pb-4">
          <div className="w-14 h-14 rounded-2xl flame-gradient flex items-center justify-center shadow-xl mb-2">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-xl text-white">JOIN THE GRILL</h1>
          <p className="text-xs text-cocoa-200">Create your Holy Grills account 🔥</p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-12 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field icon={User} label="Full Name">
            <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Jane Doe"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
          </Field>

          <Field icon={Mail} label="Email">
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="student@futa.edu.ng"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
          </Field>

          <Field icon={Phone} label="Phone Number">
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="08012345678 or +2348012345678"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
          </Field>

          <div className="rounded-xl bg-flame-50/60 border border-flame-100 p-3 -mt-1 mb-1">
            <p className="text-[11px] text-cocoa-500 font-medium leading-relaxed">Tell us a little about you — we use your date of birth and department to personalize your grill journey.</p>
          </div>

          <Field icon={Calendar} label="When's your birthday?">
            <input type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
          </Field>

          <Field icon={BookOpen} label="What are you studying?">
            <select value={form.department_id || ''} onChange={(e) => set('department_id', e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400 appearance-none">
              <option value="">Pick your department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400 pointer-events-none" />
          </Field>

          <Field icon={GraduationCap} label="Your level">
            <select value={form.academic_level_id || ''} onChange={(e) => set('academic_level_id', e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400 appearance-none">
              <option value="">Pick your level</option>
              {academicLevels.map((l) => (
                <option key={l.id} value={l.id}>{l.name || l.label || l.level}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400 pointer-events-none" />
          </Field>

          <Field icon={Lock} label="Password (min 8, uppercase + number + special)">
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 hover:text-cocoa-600" tabIndex={-1} aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Field>

          <Field icon={Lock} label="Confirm Password">
            <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 hover:text-cocoa-600" tabIndex={-1} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Field>

          <Field icon={Gift} label="Referral Code (optional)">
            <input value={form.referred_by} onChange={(e) => set('referred_by', e.target.value.toUpperCase())} placeholder="JANE123"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
          </Field>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-cocoa-100 cursor-pointer">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 w-4 h-4 accent-flame-600" />
            <span className="text-xs text-cocoa-600 leading-relaxed">
              I agree to the <span className="text-flame-600 font-bold">Terms & Conditions</span> and confirm I'm at least 16 years old. I consent to receive order notifications and marketing offers.
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs text-red-700 font-semibold">{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg flame-gradient text-white font-bold shadow-md disabled:opacity-50">
            {loading ? 'Creating account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-cocoa-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-flame-600 font-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-cocoa-500 uppercase">{label}</label>
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
        {children}
      </div>
    </div>
  );
}