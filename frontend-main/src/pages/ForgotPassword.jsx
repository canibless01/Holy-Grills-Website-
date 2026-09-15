import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, Mail, ArrowRight, Check, ArrowLeft } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    try {
      await mockApi.auth.resetPassword({ email });
      setSent(true);
    } catch (err) {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cocoa-50 flex flex-col">
      <div className="relative h-40 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=800&q=80" alt="Holy Grill" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-50 via-cocoa-900/60 to-cocoa-900/40" />
        <div className="relative h-full flex flex-col items-center justify-end pb-4">
          <div className="w-12 h-12 rounded-2xl flame-gradient flex items-center justify-center shadow-xl mb-2">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-lg text-white">RESET PASSWORD</h1>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-12 max-w-md mx-auto w-full">
        {sent ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-heading font-bold text-lg text-cocoa-800 mb-2">Reset Link Sent</h2>
            <p className="text-sm text-cocoa-500 mb-6">
              If an account exists for {email}, a password reset link has been sent to your email. Check your inbox and follow the instructions.
            </p>
            <button onClick={() => navigate('/login')} className="w-full py-3 rounded-full flame-gradient text-white font-bold">
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => navigate('/login')} className="flex items-center gap-1 text-sm text-cocoa-500 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </button>
            <h2 className="font-heading font-bold text-xl text-cocoa-800 mb-1">Forgot your password?</h2>
            <p className="text-sm text-cocoa-400 mb-6">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-cocoa-500 uppercase">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@futa.edu.ng"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
                </div>
              </div>
              <button type="submit" disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full flame-gradient text-white font-bold shadow-lg disabled:opacity-50">
                {loading ? 'Sending...' : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-cocoa-500 mt-5">
          Remembered it? <Link to="/login" className="text-flame-600 font-bold">Log in</Link>
        </p>
        <p className="text-center text-xs text-cocoa-400 mt-2">🔥 Simulation mode</p>
      </div>
    </div>
  );
}