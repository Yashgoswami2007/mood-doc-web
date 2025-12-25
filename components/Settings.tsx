
import React, { useState } from 'react';
import { 
  User, Bell, Shield, Brain, Eye, Trash2, CheckCircle2, ChevronRight, Smartphone, Mail, Moon, Sun, ShieldCheck, Sparkles, Activity, Key, RefreshCcw, Database, Watch, Loader2
} from 'lucide-react';

interface SettingsProps {
  userName: string;
  onUpdateName: (name: string) => void;
  onClearHistory: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

type SettingsSection = 'profile' | 'sync' | 'logic' | 'aesthetics' | 'privacy';

const Settings: React.FC<SettingsProps> = ({ userName, onUpdateName, onClearHistory, theme, onThemeChange }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [name, setName] = useState(userName);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('md_user_prefs');
    return saved ? JSON.parse(saved) : {
      notifications: { push: true, email: false, weekly: true },
      logic: { proactive: true, memory: true, crisis: true },
      sync: { cloud: true, wearable: false }
    };
  });

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(name);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const togglePref = (category: 'notifications' | 'logic' | 'sync', key: string) => {
    const newPrefs = { ...prefs, [category]: { ...prefs[category], [key]: !prefs[category][key] } };
    setPrefs(newPrefs);
    localStorage.setItem('md_user_prefs', JSON.stringify(newPrefs));
  };

  const sections = [
    { id: 'profile', label: 'Identity', icon: User },
    { id: 'sync', label: 'Sync', icon: Bell },
    { id: 'logic', label: 'Logic', icon: Brain },
    { id: 'aesthetics', label: 'Aesthetics', icon: Eye },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const renderSection = () => {
    const commonClasses = "bg-white/80 dark:bg-slate-900/60 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-in slide-in-from-right-4 duration-500 shadow-sm";
    
    switch (activeSection) {
      case 'profile':
        return (
          <div className={commonClasses}>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600"><User size={22} /></div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Identity Suite</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Cloud ID Reference</p>
                </div>
            </div>
            <form onSubmit={handleSaveName} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Signature</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-brand-600 rounded-xl text-sm font-bold transition-all text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Access</label>
                <div className="relative opacity-60">
                  <input
                    type="email"
                    disabled
                    value="vault_access@mooddoctor.ai"
                    className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs font-bold text-slate-500"
                  />
                  <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 bg-brand-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSaved ? <CheckCircle2 size={16} /> : null}
                {isSaved ? 'Identity Confirmed' : 'Update ID'}
              </button>
            </form>
          </div>
        );
      case 'sync':
        return (
          <div className={commonClasses}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600"><RefreshCcw size={22} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Synchronization</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Cloud & Device Bridge</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-brand-50/50 dark:bg-brand-900/20 rounded-2xl border border-brand-100 dark:border-brand-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-brand-600"><Database size={20} /></div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Cloud Backbone</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-1">Secure real-time history backup.</p>
                  </div>
                </div>
                <button 
                  onClick={() => togglePref('sync', 'cloud')}
                  className={`w-10 h-5 rounded-full relative transition-all duration-300 ${prefs.sync?.cloud ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${prefs.sync?.cloud ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-500"><Watch size={20} /></div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Wearable Integration</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-1">Connect Apple Watch or Garmin for biometric data.</p>
                  </div>
                </div>
                <button 
                  onClick={() => togglePref('sync', 'wearable')}
                  className={`w-10 h-5 rounded-full relative transition-all duration-300 ${prefs.sync?.wearable ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${prefs.sync?.wearable ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                  {isSyncing ? 'Synchronizing Vault...' : 'Run Manual Protocol Sync'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'logic':
        return (
          <div className={commonClasses}>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600"><Brain size={22} /></div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">AI Logic Engine</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Behavioral Processing</p>
                </div>
            </div>
            <div className="space-y-3">
              {[
                { id: 'proactive', label: 'Proactive Resonance', desc: 'Allow AI to initiate wellness check-ins.', icon: Sparkles },
                { id: 'memory', label: 'Cognitive Memory', desc: 'Retention of past emotional flux data.', icon: Activity },
                { id: 'crisis', label: 'Crisis Detection', desc: 'Enhanced scanning for risk triggers.', icon: ShieldCheck }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-amber-500"><item.icon size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-200 text-xs">{item.label}</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => togglePref('logic', item.id)}
                    className={`w-10 h-5 rounded-full relative transition-all duration-300 ${prefs.logic[item.id] ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${prefs.logic[item.id] ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'aesthetics':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Aesthetics</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'light', label: 'Solar', icon: Sun, color: 'amber' },
                { id: 'dark', label: 'Abyssal', icon: Moon, color: 'brand' }
              ].map(opt => (
                <button 
                    key={opt.id}
                    onClick={() => onThemeChange(opt.id as 'light' | 'dark')}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${theme === opt.id ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-900/20 shadow-xl' : 'border-slate-100 dark:border-slate-800 text-slate-400 opacity-60'}`}
                >
                    <div className={`p-4 rounded-xl transition-all ${theme === opt.id ? `bg-${opt.color}-500 text-white` : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <opt.icon size={24} />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className={commonClasses}>
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Security Protocol</h3>
             <div className="p-6 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/20">
               <h4 className="text-sm font-bold text-rose-900 dark:text-rose-400 mb-2">Vault Purge</h4>
               <p className="text-[10px] text-rose-600 dark:text-rose-500 font-medium leading-relaxed mb-6">
                 Executing this command will permanently erase all session history, stability streaks, and biometric analytical maps. This action is irreversible.
               </p>
               <button 
                onClick={() => { if(window.confirm("Purge vault?")) onClearHistory(); }}
                className="w-full py-3.5 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/20 active:scale-95"
               >
                 Purge All Signal Data
               </button>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="animate-in fade-in duration-700">
        <p className="text-brand-500 font-black uppercase tracking-widest text-[9px] mb-1">Central Protocol</p>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Preferences</h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0 animate-in slide-in-from-left-4 duration-700">
          {sections.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as SettingsSection)}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id 
                  ? 'bg-white dark:bg-slate-800 shadow-xl text-brand-600 border border-slate-100 dark:border-slate-800 scale-105 z-10' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <item.icon size={16} strokeWidth={activeSection === item.id ? 3 : 2} />
              <span className="font-bold text-[11px] uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </aside>
        <div className="flex-1 min-h-[400px]">{renderSection()}</div>
      </div>
    </div>
  );
};

export default Settings;
