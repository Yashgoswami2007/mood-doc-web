
import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'hello' | 'name' | 'welcome'>('hello');
  const [name, setName] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (step === 'hello') {
      const timer = setTimeout(() => setStep('name'), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) setStep('welcome');
  };

  useEffect(() => {
    if (step === 'welcome') {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onComplete(name), 1000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, name, onComplete]);

  return (
    <div className={`fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[150] p-8 transition-all duration-1000 ${isExiting ? 'opacity-0 scale-110 blur-2xl' : 'opacity-100 scale-100'}`}>
      {/* Immersive background elements */}
      <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-brand-600/10 rounded-full blur-[140px] animate-float" />
      <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] animate-float [animation-delay:3s]" />
      
      <div className="max-w-2xl w-full text-center relative z-10">
        {step === 'hello' && (
          <div className="space-y-8">
            <div className="w-20 h-20 bg-brand-600/10 rounded-[2rem] mx-auto flex items-center justify-center border border-brand-500/20 animate-in zoom-in-50 duration-1000">
               <Star className="text-brand-500 fill-current w-8 h-8" />
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none animate-in slide-in-from-bottom-12 duration-1000">
              Welcome<span className="text-brand-600">.</span>
            </h1>
            <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-xs animate-in fade-in duration-1000 delay-500">
                Premium Wellness Protocol
            </p>
          </div>
        )}

        {step === 'name' && (
          <div className="animate-in slide-in-from-bottom-10 fade-in duration-1000 w-full">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-16 tracking-tighter leading-tight">
              What should we <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-400">call you?</span>
            </h2>
            <form onSubmit={handleNameSubmit} className="relative group max-w-lg mx-auto">
              <input
                autoFocus
                type="text"
                placeholder="Enter Identity..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-4xl md:text-5xl font-black py-8 bg-transparent border-b-2 border-slate-800 focus:border-brand-600 focus:outline-none transition-all duration-700 text-center placeholder:text-slate-900 text-white"
              />
              <div className={`mt-16 flex flex-col items-center transition-all duration-1000 ${name.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <button
                  type="submit"
                  className="w-24 h-24 bg-brand-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_60px_rgba(99,102,241,0.3)] hover:scale-110 active:scale-90 transition-all group"
                >
                  <ArrowRight size={40} className="group-hover:translate-x-2 transition-transform duration-300" />
                </button>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-brand-500 opacity-60">Authorize Protocol</p>
              </div>
            </form>
          </div>
        )}

        {step === 'welcome' && (
          <div className="animate-in zoom-in-95 fade-in duration-1000 flex flex-col items-center">
            <div className="w-28 h-28 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center mb-10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
              <Sparkles className="text-emerald-500 w-12 h-12 animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
              Hello, <span className="text-brand-600">{name}</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium max-w-sm leading-relaxed">
              Your personalized sanctuary is initialized and ready for exploration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
