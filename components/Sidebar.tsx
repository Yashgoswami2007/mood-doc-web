
import React from 'react';
import { 
  Home, 
  Sparkles, 
  Settings as SettingsIcon, 
  LogOut, 
  Activity, 
  ShieldAlert,
  Heart
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Vault' },
    { id: 'chat', icon: Sparkles, label: 'Sanctuary' },
    { id: 'history', icon: Activity, label: 'Analytics' },
    { id: 'safety', icon: ShieldAlert, label: 'Safety' },
    { id: 'settings', icon: SettingsIcon, label: 'Protocol' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 bg-white/80 dark:bg-slate-900/80 h-screen border-r border-gray-100 dark:border-slate-800 flex flex-col fixed left-0 top-0 backdrop-blur-xl z-50">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-600/30">
            <Heart className="text-white w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">MoodDoctor</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-500 opacity-80">Elite Wellness</p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-brand-600 text-white shadow-2xl shadow-brand-600/20 scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="font-bold text-[13px] uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Sync: Online</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Terminate</span>
          </button>
        </div>
      </div>

      {/* Optimized Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] px-3 pb-4 pt-2 pointer-events-none">
        <nav className="glass-morphism pointer-events-auto flex items-center justify-around p-1.5 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/5 max-w-sm mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-300 relative ${
                activeTab === item.id 
                  ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/30 scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
              {activeTab === item.id && (
                <span className="text-[7px] font-black uppercase tracking-tighter mt-1 animate-in slide-in-from-bottom-1">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
