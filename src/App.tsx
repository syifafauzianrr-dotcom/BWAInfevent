import React, { useState, useEffect } from 'react';
import SoloDecider from './components/SoloDecider';
import GroupDecider from './components/GroupDecider';
import { SurvivalGuide } from './components/SurvivalGuide';
import { 
  HelpCircle, 
  HelpCircle as QuestionIcon, 
  Sparkles, 
  Users, 
  Zap, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  BrainCircuit, 
  Flame,
  MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'solo' | 'group'>('solo');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [initialRoomId, setInitialRoomId] = useState<string | null>(null);

  // Parse URL search parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('roomId');
    if (roomParam) {
      setInitialRoomId(roomParam.toUpperCase());
      setActiveTab('group');
    }
  }, []);

  // Sync URL search queries
  const clearRoomParamFromUrl = () => {
    setInitialRoomId(null);
    const url = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: url }, '', url);
  };

  // Fun "Overthinking Level Meter" states
  const [mentalLoad, setMentalLoad] = useState(25);
  useEffect(() => {
    // Slowly fluctuate mental load over time to represent active thoughts
    const interval = setInterval(() => {
      setMentalLoad(prev => {
        const drift = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const target = prev + drift;
        return Math.max(15, Math.min(95, target));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getMentalStatus = (load: number) => {
    if (load < 35) return { text: "Aman Sejahtera (Rileks) ✨", color: "text-[#10B981]", bg: "bg-emerald-500/5 border-[#10B981]/25" };
    if (load < 65) return { text: "Mulai Kebingungan... 🥺", color: "text-[#FF8E53]", bg: "bg-orange-500/5 border-[#FF8E53]/25" };
    if (load < 85) return { text: "Overthinking Berat! 🤯💕", color: "text-[#FF6584]", bg: "bg-pink-500/5 border-[#FF6584]/25 animate-pulse" };
    return { text: "Korsleting Otak Cantik! ⚡🔥", color: "text-[#DE3B60] animate-bounce", bg: "bg-rose-500/10 border-[#DE3B60]/30 font-black" };
  };

  const status = getMentalStatus(mentalLoad);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF5F6] via-[#FFF0F4] to-[#FFF9FB] text-[#4A1521] font-sans antialiased selection:bg-[#FF6584] selection:text-white pb-12 flex flex-col justify-between">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF6584]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#A78BFA]/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <header className="border-b-2 border-[#FFE3ED] bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FF6584] rotate-3 flex items-center justify-center shadow-md relative overflow-hidden group">
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <BrainCircuit className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight uppercase text-[#4A1521]">
                  Pilih<span className="text-[#FF6584]">Mana</span>
                </span>
                <span className="text-[9px] bg-[#FFF0F3] text-[#FF6584] border border-[#FFD5E5] font-black px-1.5 py-0.5 rounded-full tracking-wider uppercase">
                  🌸 v2.0
                </span>
              </div>
              <p className="text-[10px] text-[#FFA6C9] font-black leading-none uppercase tracking-wide">Penyelamat Overthinker Cantik</p>
            </div>
          </div>

          {/* Funny Live Overthinking Level Gauge */}
          <div className={`hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${status.bg}`}>
            <Flame className={`w-4 h-4 ${status.color}`} />
            <div className="text-left leading-none space-y-0.5">
              <div className="text-[9px] text-[#FFA6C9] uppercase font-mono font-black tracking-wider">Tingkat Overthink: {mentalLoad}%</div>
              <div className={`text-[10px] font-black ${status.color}`}>{status.text}</div>
            </div>
          </div>

          {/* Master Sounds Controller */}
          <div className="flex items-center gap-2">
            <button
              id="global-audio-toggle"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-3.5 py-2.5 rounded-xl bg-[#FFF9FA] hover:bg-[#FFF0F3] border-2 border-[#FFE3ED] text-[#FF6584] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none text-xs font-bold"
              title={soundEnabled ? "Mute All" : "Unmute All"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[10px] text-slate-600 font-bold hidden sm:inline uppercase tracking-tight">Klip: Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#FF4066]" />
                  <span className="text-[10px] text-slate-400 font-bold hidden sm:inline uppercase tracking-tight">Klip: Bisu</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        
        {/* FUN INTRODUCTION CAROUSEL TITLE SECTION */}
        <div className="text-center max-w-2xl mx-auto space-y-3 bg-[#FFF0F3]/60 border-2 border-[#FFE3ED] p-6 rounded-[32px] shadow-xs relative overflow-hidden backdrop-blur-xs">
          <div className="absolute -top-3 -left-3 text-lg opacity-40">🍜</div>
          <div className="absolute -bottom-3 -right-3 text-lg opacity-40">🍰</div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#4A1521] uppercase leading-none">
            Mikir Menu Makan Capek Banget? ✨🍲
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed font-sans max-w-xl mx-auto uppercase tracking-wide">
            Usir penderitaan lapar tapi gak tau mau makan apa! PilihMana mengundi takdir dalam visualisasi kuliner lezat yang bikin lapar mata. Ajak sobat kantormu mufakat bareng lewat Link Group!
          </p>
        </div>

        {/* MODE NAVIGATION TOGGLER (TABS) */}
        <div className="flex justify-center">
          <div className="bg-white border-2 border-[#FFE3ED] rounded-2xl p-1.5 flex gap-2 w-full max-w-md shadow-xs">
            <button
              id="tab-mode-solo"
              onClick={() => setActiveTab('solo')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'solo'
                  ? 'bg-[#FF6584] text-white shadow-md shadow-[#FFD5E5]'
                  : 'text-[#FFA6C9] hover:text-[#FF6584] hover:bg-[#FFF9FA]'
              }`}
            >
              <MousePointerClick className="w-4 h-4" />
              <span>Mandiri / Solo 👩‍🍳</span>
            </button>
            <button
              id="tab-mode-group"
              onClick={() => setActiveTab('group')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'group'
                  ? 'bg-[#FF6584] text-white shadow-md shadow-[#FFD5E5]'
                  : 'text-[#FFA6C9] hover:text-[#FF6584] hover:bg-[#FFF9FA]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Grup Kongkow 🍭</span>
            </button>
          </div>
        </div>

        {/* GUIDELINE HELPER CARD */}
        <div className="max-w-md mx-auto w-full">
          <SurvivalGuide />
        </div>

        {/* ACTIVE DECIDER INTERFACE PANEL */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'solo' ? (
              <motion.div
                key="solo-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <SoloDecider 
                  soundEnabled={soundEnabled} 
                  setSoundEnabled={setSoundEnabled} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="group-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <GroupDecider 
                  soundEnabled={soundEnabled} 
                  setSoundEnabled={setSoundEnabled} 
                  initialRoomId={initialRoomId}
                  onClearRoomParam={clearRoomParamFromUrl}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* FOOTER CONTROLS */}
      <footer className="border-t border-[#FFE3ED] bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[#FFA6C9] uppercase tracking-tight">
          <p>© 2026 PilihMana. Dibuat murni dengan penuh rasa lapar di kepala. 💖</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-[#FF6584]">
              <Zap className="w-3.5 h-3.5 fill-current text-[#FF6584]" />
              Terpantau Real-time
            </span>
            <span className="text-[#FFE3ED]">|</span>
            <span className="text-[#FFA6C9]">Bebas Iklan &amp; Girly</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
