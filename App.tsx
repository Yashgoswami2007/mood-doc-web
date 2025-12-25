
import React, { useState, useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatWindow from './components/ChatWindow';
import Settings from './components/Settings';
import Auth from './components/Auth';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import SafetyPlan from './components/SafetyPlan';
import { MoodState, SupportMode, MoodLogEntry } from './types';
import { cloudService } from './services/cloudService';
import { supabase } from './lib/supabase';

type AppState = 'auth' | 'splash' | 'onboarding' | 'main';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('auth');
  const [userName, setUserName] = useState(() => localStorage.getItem('md_username') || '');
  const [activeTab, setActiveTab] = useState('home');
  const [currentMood, setCurrentMood] = useState<MoodState | null>(null);
  const [supportMode, setSupportMode] = useState<SupportMode>(SupportMode.LISTENING);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('md_theme') as Theme) || 'light';
  });

  // Track Guest Mode separately to bypass Supabase session checks
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('md_is_guest') === 'true');
  const [moodLogs, setMoodLogs] = useState<MoodLogEntry[]>([]);
  const stateRef = useRef(appState);

  useEffect(() => {
    stateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    // Initial Auth Logic
    const initAuth = async () => {
      // If we are already a guest, skip session check
      if (isGuest) {
        if (localStorage.getItem('md_username')) {
          setAppState('main');
        } else {
          setAppState('onboarding');
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const storedName = localStorage.getItem('md_username');
        if (storedName) {
          setUserName(storedName);
          setAppState('main');
        } else {
          setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Explorer');
          setAppState('onboarding');
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore if currently in Guest mode
      if (localStorage.getItem('md_is_guest') === 'true') return;

      if (session) {
        if (stateRef.current === 'auth') {
          setAppState('splash');
        }
      } else if (event === 'SIGNED_OUT') {
        setAppState('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [isGuest]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('md_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (appState === 'main' && !isGuest) {
      cloudService.getMoodLogs().then(setMoodLogs).catch(console.error);
    }
  }, [appState, isGuest]);

  const handleLogin = (user: any, token: string) => {
    if (token === 'guest-token') {
      setIsGuest(true);
      localStorage.setItem('md_is_guest', 'true');
    }

    if (user?.full_name) {
      setUserName(user.full_name);
    }
    setAppState('splash');
  };

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
    localStorage.setItem('md_username', name);
    setAppState('main');
  };

  const handleMoodDetected = async (mood: MoodState, mode: SupportMode) => {
    setCurrentMood(mood);
    setSupportMode(mode);
    const today = new Date().toISOString().split('T')[0];
    const newScore = Math.round((1 - mood.risk_score) * 100);
    const newEntry = { date: today, mood: mood.dominant_mood, energy: mood.energy_level, score: newScore };

    setMoodLogs(prev => {
      const existingIndex = prev.findIndex(l => l.date === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newEntry;
        return updated;
      }
      return [...prev, newEntry];
    });

    if (!isGuest) {
      await cloudService.saveMoodEntry(newEntry).catch(console.error);
    }
  };

  const handleLogout = async () => {
    setIsGuest(false);
    localStorage.removeItem('md_is_guest');
    localStorage.removeItem('md_username');
    await supabase.auth.signOut();
    setAppState('auth');
  };

  if (appState === 'auth') return <Auth onLogin={handleLogin} />;
  if (appState === 'splash') return <SplashScreen onComplete={() => setAppState('onboarding')} />;
  if (appState === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className={`flex flex-col lg:flex-row min-h-[100dvh] transition-colors duration-500 overflow-hidden ${theme === 'dark' ? 'bg-premium-dark text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 lg:ml-72 flex flex-col h-[100dvh] relative overflow-hidden">
        {/* Animated Orbs - Reduced size for mobile performance */}
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex-1 p-4 sm:p-6 lg:p-10 z-10 overflow-y-auto no-scrollbar pb-24 lg:pb-12">
          <div className="max-w-5xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'home' && <Dashboard userName={userName} moodLogs={moodLogs} />}
            {activeTab === 'chat' && <ChatWindow currentMood={currentMood} onMoodDetected={handleMoodDetected} />}
            {activeTab === 'history' && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="text-brand-600 animate-pulse" size={28} />
                </div>
                <h2 className="text-xl font-black mb-2 tracking-tight">Analytical Lab</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium max-w-xs">
                  Synthesizing stability metrics. Detailed biometrics are private to your device.
                </p>
                <div className="mt-8 px-5 py-2 bg-brand-600/10 text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Coming Soon</div>
              </div>
            )}
            {activeTab === 'safety' && <SafetyPlan />}
            {activeTab === 'settings' && (
              <Settings
                userName={userName}
                onUpdateName={setUserName}
                onClearHistory={() => setMoodLogs([])}
                theme={theme}
                onThemeChange={setTheme}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
