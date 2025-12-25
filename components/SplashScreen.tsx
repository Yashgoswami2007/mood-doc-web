
import React, { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => onComplete(), 3500)
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[200] overflow-hidden">
      {/* Background Ambience */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-600/10 rounded-full blur-[160px] transition-all duration-1000 ${phase >= 1 ? 'scale-150 opacity-100' : 'scale-50 opacity-0'}`} />
      
      <div className={`transition-all duration-1000 flex flex-col items-center ${phase >= 1 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90'}`}>
        <div className="relative mb-12 group">
          <div className="w-28 h-28 bg-brand-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.4)] relative z-10 animate-bounce">
            <Heart className="text-white w-14 h-14 fill-current" />
          </div>
          <div className="absolute inset-0 bg-brand-600 rounded-[2.5rem] animate-ping opacity-20 scale-150" />
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center blur-sm animate-pulse">
            <Sparkles className="text-brand-400 w-6 h-6" />
          </div>
        </div>
        
        <div className="text-center">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-4 animate-in slide-in-from-bottom-4 duration-1000">
                MoodDoctor<span className="text-brand-500">.</span>
            </h1>
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-brand-500/30" />
                    <p className="text-brand-400 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">
                        Elite Protocol Active
                    </p>
                    <div className="h-px w-8 bg-brand-500/30" />
                </div>
                
                <div className={`mt-8 w-64 h-1 bg-white/5 rounded-full overflow-hidden transition-all duration-1000 ${phase >= 2 ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="h-full bg-brand-600 rounded-full w-0 animate-[progress_2s_cubic-bezier(0.87,0,0.13,1)_forwards]" />
                </div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 40%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
