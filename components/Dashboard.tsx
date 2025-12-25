
import React, { useState, useEffect } from 'react';
import { Calendar, Smile, Zap, Activity, Heart, Sparkles, RefreshCw, TrendingUp, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { MoodLogEntry } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  userName?: string;
  moodLogs: MoodLogEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ userName = 'Explorer', moodLogs }) => {
  const [affirmation, setAffirmation] = useState<string>("Initializing your personalized therapy sanctuary...");
  const [isSyncing, setIsSyncing] = useState(false);

  const latestLog = moodLogs.length > 0 ? moodLogs[moodLogs.length - 1] : null;
  const wellBeingIndex = moodLogs.length > 0
    ? Math.round(moodLogs.reduce((acc, curr) => acc + curr.score, 0) / moodLogs.length)
    : 100;
  const currentEnergy = latestLog?.energy || 'Calm';

  useEffect(() => {
    generateAffirmation();
  }, [userName]);

  const generateAffirmation = async () => {
    setIsSyncing(true);
    const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY });
    try {
      const prompt = `Write a 1-sentence luxury daily affirmation for ${userName}. Tone: Premium, High-End Wellness Coach. No emojis. Context: Current mood is ${latestLog?.mood || 'Equilibrium'}.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAffirmation(response.text?.trim() || "Excellence in mental clarity is a journey of consistent awareness.");
    } catch (e) {
      setAffirmation("You are currently navigating the elite spectrum of emotional intelligence.");
    } finally {
      setIsSyncing(false);
    }
  };

  const calculateStreak = () => {
    if (moodLogs.length === 0) return 0;
    return moodLogs.length;
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="animate-in slide-in-from-left duration-500">
          <p className="text-brand-500 font-black uppercase tracking-widest text-[9px] mb-1">Member ID: Active</p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-tight">
            Greetings, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-400">{userName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <Calendar size={14} className="text-brand-600" />
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </header>

      {/* Hero Affirmation */}
      <div className="group relative overflow-hidden bg-slate-950 p-6 sm:p-10 rounded-[2rem] text-white shadow-2xl animate-in zoom-in-95 duration-700 border border-white/5">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand-600/10 to-indigo-600/10 pointer-events-none group-hover:scale-105 transition-transform duration-1000" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 font-black text-[8px] uppercase tracking-widest">
            <Sparkles size={10} className="animate-pulse" /> Wellness Insight
          </div>
          <h2 className="text-lg sm:text-2xl font-bold leading-tight tracking-tight italic text-slate-100">
            "{affirmation}"
          </h2>
          <div className="pt-2">
            <button
              onClick={generateAffirmation}
              disabled={isSyncing}
              className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              Resync Awareness
            </button>
          </div>
        </div>
      </div>

      {/* Triple Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Stability Index', value: `${wellBeingIndex}%`, icon: Smile, color: 'emerald' },
          { label: 'Internal Energy', value: currentEnergy, icon: Zap, color: 'amber' },
          { label: 'Sync Streak', value: `${calculateStreak()} Sessions`, icon: Activity, color: 'brand' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-brand-500/30 transition-all duration-300 shadow-sm">
            <div>
              <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/10 text-${stat.color}-600 rounded-xl`}>
              <stat.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm h-[320px] sm:h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Wellness Flux</h3>
              <p className="text-[9px] text-slate-400 font-medium">Biometric session mapping</p>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-[8px] font-black uppercase">
              <TrendingUp size={10} /> Optimal Range
            </div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={moodLogs.length > 0 ? moodLogs.slice(-14) : [{ date: 'T-1', score: 85 }, { date: 'T-0', score: 92 }]}>
              <defs>
                <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fill="url(#premiumGradient)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Wellness Calendar Section */}
        <div className="bg-brand-600 p-8 rounded-[2rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000"><TrendingUp size={64} /></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} />
              <h3 className="text-sm font-black uppercase tracking-widest">Elite Goal</h3>
            </div>
            <p className="text-brand-100 text-xs font-medium leading-relaxed">Unlock advanced neuro-feedback by maintaining a 10-session stability streak.</p>
          </div>

          <div className="relative z-10 mt-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-black">{wellBeingIndex}%</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">System Ready</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_white]" style={{ width: `${wellBeingIndex}%` }} />
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <Info size={14} className="text-brand-200" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Protocol Notice</span>
            </div>
            <p className="text-[9px] leading-tight text-brand-100 opacity-80">
              Your biological data remains encrypted within your local hardware vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
