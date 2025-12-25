
import React, { useState } from 'react';
import { ShieldAlert, Phone, Heart, User, ListChecks, Plus, Trash2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

const SafetyPlan: React.FC = () => {
  const [copingStrategies, setCopingStrategies] = useState<string[]>([
    "Deep breathing (4-7-8 technique)",
    "Going for a 15-minute walk",
    "Listening to my 'Calm' playlist",
    "Calling my sister"
  ]);
  const [newStrategy, setNewStrategy] = useState('');

  const crisisResources = [
    { name: "National Suicide Prevention Lifeline", number: "988", desc: "Available 24/7 in English and Spanish" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", desc: "Free, 24/7 crisis counseling" },
    { name: "The Trevor Project", number: "1-866-488-7386", desc: "Crisis intervention for LGBTQ youth" }
  ];

  const handleAddStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStrategy.trim()) {
      setCopingStrategies([...copingStrategies, newStrategy.trim()]);
      setNewStrategy('');
    }
  };

  const removeStrategy = (index: number) => {
    setCopingStrategies(copingStrategies.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Personal Safety Plan</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">A structured guide for when things feel overwhelming.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Crisis Resources */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-red-100 dark:border-red-900/20 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Phone className="text-red-500" size={24} />
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Emergency Resources</h3>
          </div>
          <div className="space-y-4">
            {crisisResources.map((res, i) => (
              <div key={i} className="p-5 rounded-3xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 group hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-red-900 dark:text-red-400 text-sm">{res.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-500/80 font-bold mt-1">{res.number}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-2">{res.desc}</p>
                  </div>
                  <button className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coping Strategies */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-indigo-50 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Heart className="text-indigo-600" size={24} />
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Coping Strategies</h3>
          </div>
          <form onSubmit={handleAddStrategy} className="flex gap-2">
            <input 
              type="text" 
              value={newStrategy}
              onChange={(e) => setNewStrategy(e.target.value)}
              placeholder="Add a new strategy..."
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none"
            />
            <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
              <Plus size={20} />
            </button>
          </form>
          <div className="space-y-2">
            {copingStrategies.map((strat, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl group border border-transparent hover:border-indigo-100 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{strat}</p>
                </div>
                <button 
                  onClick={() => removeStrategy(i)}
                  className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Steps */}
      <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-none">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-white/20 rounded-2xl">
            <ListChecks size={28} />
          </div>
          <h3 className="text-2xl font-black">My Stability Protocol</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: 1, title: "Identify Triggers", icon: AlertTriangle, desc: "Recognize the situation causing distress." },
            { step: 2, title: "Use Strategies", icon: Heart, desc: "Apply my personal coping techniques." },
            { step: 3, title: "Reach Out", icon: User, desc: "Connect with my trusted inner circle." },
            { step: 4, title: "Seek Pro Support", icon: Phone, desc: "Contact emergency help if needed." }
          ].map((item, idx) => (
            <div key={idx} className="p-6 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/10 flex flex-col items-center text-center">
              <div className="text-xs font-black uppercase tracking-widest opacity-60 mb-3">Step {item.step}</div>
              <item.icon size={24} className="mb-4" />
              <h4 className="font-bold text-sm mb-2">{item.title}</h4>
              <p className="text-[11px] opacity-80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-[2rem] flex items-center gap-5">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-amber-500">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h4 className="font-black text-amber-900 dark:text-amber-400 text-sm">A Reminder from MoodDoctor</h4>
          <p className="text-xs text-amber-700 dark:text-amber-500/80 font-medium leading-relaxed mt-1">
            This safety plan is a tool for self-regulation. If you are in immediate danger of hurting yourself or others, please go to the nearest emergency room or call 911 immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyPlan;
