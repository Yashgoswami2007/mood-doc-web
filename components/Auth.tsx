
import React, { useState } from 'react';
import { Heart, Mail, Lock, User, ArrowRight, UserCircle, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onLogin: (user: any, token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'signup' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (view === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: fullName } }
        });
        if (signupError) throw signupError;
        if (data.session) {
          onLogin(data.user?.user_metadata, data.session.access_token);
        } else {
          setSuccessMsg('Authentication code transmitted to your email.');
          setView('otp');
        }
      } else if (view === 'login') {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        onLogin(data.user?.user_metadata, data.session.access_token);
      } else if (view === 'otp') {
        const { data, error: otpError } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
        if (otpError) throw otpError;
        onLogin(data.user?.user_metadata, data.session?.access_token || '');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setLoading(true);
    // Simulate a brief delay for tactical feedback
    setTimeout(() => {
      onLogin({ full_name: 'Explorer', email: 'explorer@mooddoctor.ai' }, 'guest-token');
    }, 600);
  };

  const inputClasses = "w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-600 dark:focus:border-brand-500 rounded-2xl text-sm font-bold text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700";

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-premium-dark flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-600/5 dark:bg-brand-600/10 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-slow delay-200" />

      <div className="max-w-md w-full glass-morphism dark:bg-slate-900/60 rounded-[2.5rem] premium-shadow overflow-hidden animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="p-8 md:p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-brand-600/30 group active:scale-95 transition-transform">
            <Heart className="text-white w-8 h-8 fill-current" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">MoodDoctor</h1>
          <p className="text-slate-400 text-[9px] font-black tracking-widest uppercase mb-10">Elite Wellness Protocol</p>

          <div className="flex w-full mb-8 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <button
              onClick={() => { setView('login'); setError(null); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'login' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setView('signup'); setError(null); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'signup' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Join Club
            </button>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && <div className="p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-[10px] rounded-xl border border-rose-100 dark:border-rose-900/20 font-bold uppercase">{error}</div>}
            {successMsg && <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-xl border border-emerald-100 dark:border-emerald-900/20 font-bold uppercase flex items-center justify-center gap-2"><CheckCircle size={14} /> {successMsg}</div>}

            {view === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="Identity Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClasses} />
              </div>
            )}

            {view !== 'otp' && (
              <>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="email" placeholder="Email Identifier" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="password" placeholder="Key Passphrase" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} />
                </div>
              </>
            )}

            {view === 'otp' && (
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="6-Digit Protocol" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} maxLength={6} required className={`${inputClasses} tracking-[0.5em] text-center pl-6`} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-600/30 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {view === 'signup' ? 'Initiate' : (view === 'otp' ? 'Validate' : 'Authorize')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest"><span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Security Bypass</span></div>
            </div>

            <button
              onClick={handleGuestLogin}
              type="button"
              disabled={loading}
              className="w-full py-4 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
            >
              <UserCircle size={18} />
              Continue as Explorer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
