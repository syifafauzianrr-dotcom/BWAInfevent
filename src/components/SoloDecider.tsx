import React, { useState, useEffect } from 'react';
import { Option, Template } from '../types';
import { templates, pastelColors } from '../templates';
import DynamicCarousel from './DynamicCarousel';
import { playVetoSound, playTickSound } from '../utils/audio';
import { getFoodVisuals } from '../utils/foodVisuals';
import { FoodImage } from './FoodImage';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Play, 
  Ban, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SoloDeciderProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export default function SoloDecider({ soundEnabled, setSoundEnabled }: SoloDeciderProps) {
  // Option lists
  const [options, setOptions] = useState<Option[]>([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Decider state
  const [spinning, setSpinning] = useState(false);
  const [resultOptionId, setResultOptionId] = useState<string | null>(null);

  // Pre-load default template (e.g. 'makan-siang') on mount
  useEffect(() => {
    loadTemplate(templates[0]);
  }, []);

  // Helper to load template
  const loadTemplate = (template: Template) => {
    setSelectedTemplateId(template.id);
    const loaded = template.options.map((text, idx) => ({
      id: `opt-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      text,
      isEliminated: false,
      color: pastelColors[idx % pastelColors.length]
    }));
    setOptions(loaded);
    setResultOptionId(null);
    setSpinning(false);
  };

  // Add custom option
  const handleAddOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newOptionText.trim();
    if (!trimmed) return;

    // Check duplicate
    if (options.some(o => o.text.toLowerCase() === trimmed.toLowerCase())) {
      alert("Uh-oh! Pilihan itu sudah ada di dalam list.");
      return;
    }

    const newOpt: Option = {
      id: `opt-${options.length}-${Math.random().toString(36).substring(2, 7)}`,
      text: trimmed,
      isEliminated: false,
      color: pastelColors[options.length % pastelColors.length]
    };

    setOptions([...options, newOpt]);
    setNewOptionText('');
    setResultOptionId(null);
  };

  // Remove option from list
  const handleRemoveOption = (id: string) => {
    const filtered = options.filter(o => o.id !== id);
    setOptions(filtered);
    if (resultOptionId === id) {
      setResultOptionId(null);
    }
  };

  // Clear all options
  const handleClearAll = () => {
    setOptions([]);
    setResultOptionId(null);
    setSelectedTemplateId(null);
    setSpinning(false);
  };

  // Reset eliminated/vetoed choices
  const handleResetVetoes = () => {
    const reset = options.map(o => ({ ...o, isEliminated: false }));
    setOptions(reset);
    setResultOptionId(null);
    setSpinning(false);
  };

  // Sembur 5 menu acak anti-overthink!
  const handleMagicPopulate = () => {
    const allUniqueOptions = Array.from(new Set(templates.flatMap(t => t.options)));
    const shuffled = [...allUniqueOptions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    const loaded = selected.map((text, idx) => ({
      id: `opt-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      text,
      isEliminated: false,
      color: pastelColors[idx % pastelColors.length]
    }));
    setOptions(loaded);
    setResultOptionId(null);
    setSpinning(false);
    setSelectedTemplateId(null);
  };

  // Interactive Spin Trigger
  const handleSpinSubmit = () => {
    const active = options.filter(o => !o.isEliminated);
    if (active.length < 2) {
      alert("Aduh, butuh minimal 2 pilihan yang aktif untuk bisa mengundi takdir!");
      return;
    }

    setResultOptionId(null);
    setSpinning(true);

    // Pick random target winner from active ones
    const randomIndex = Math.floor(Math.random() * active.length);
    const winner = active[randomIndex];

    // Set immediate resultId to initiate Carousel target positioning, spin state keeps it animated
    setResultOptionId(winner.id);
  };

  const handleSpinFinished = () => {
    setSpinning(false);
  };

  // Veto Winner & Re-spin
  const handleVetoCurrentResult = () => {
    if (!resultOptionId) return;

    const vetoedText = options.find(o => o.id === resultOptionId)?.text || '';
    if (soundEnabled) playVetoSound();

    // Mark current winner as eliminated
    const updated = options.map(o => {
      if (o.id === resultOptionId) {
        return { ...o, isEliminated: true };
      }
      return o;
    });

    setOptions(updated);
    setResultOptionId(null);

    // Auto re-spin with upgraded delay for delightful tension
    const remainingActive = updated.filter(o => !o.isEliminated);
    if (remainingActive.length >= 2) {
      setTimeout(() => {
        setSpinning(true);
        const nextWinnerIndex = Math.floor(Math.random() * remainingActive.length);
        const nextWinner = remainingActive[nextWinnerIndex];
        setResultOptionId(nextWinner.id);
      }, 500);
    }
  };

  const activeOptionsCount = options.filter(o => !o.isEliminated).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Controls & Templates */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Input Card */}
        <div className="bg-white border-2 border-[#FFE3ED] rounded-[24px] p-6 shadow-xs relative overflow-hidden">
          {/* Decorative Pink Corner Gradient */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFF0F3] rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
          
          <h2 className="text-base font-black text-[#5C1A2E] uppercase tracking-tight flex items-center gap-2 mb-4 relative z-10">
            <Layers className="w-4.5 h-4.5 text-[#FF6584]" />
            <span>Masukkan Menu Idamanmu ✨</span>
          </h2>

          <form onSubmit={handleAddOption} className="flex gap-2 relative z-10">
            <input
              type="text"
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              placeholder="Contoh: Seblak Lv 5, Matcha Latte..."
              maxLength={40}
              className="flex-1 bg-[#FFF9FA] border-2 border-[#FFE3ED] rounded-xl px-4 py-2.5 text-sm text-[#5C1A2E] focus:outline-none focus:border-[#FF6584] font-sans transition-all placeholder:text-[#FFA6C9]/70"
            />
            <button
              id="add-pilihan-btn"
              type="submit"
              className="bg-[#FF6584] hover:bg-[#FF4066] text-white rounded-xl px-4 flex items-center justify-center transition-all cursor-pointer hover:scale-[1.03] active:scale-95 shadow-md shadow-[#FFD5E5]"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </form>

          {/* Quick Clear Controls */}
          {options.length > 0 ? (
            <div className="flex gap-2 mt-4 pt-3 border-t border-[#FFE3ED] justify-between text-[10px] font-black uppercase tracking-wider relative z-10 flex-wrap">
              <button
                id="reset-pilihan-btn"
                onClick={handleResetVetoes}
                disabled={!options.some(o => o.isEliminated)}
                className="text-[#A78BFA] hover:text-[#7C3AED] disabled:opacity-45 flex items-center gap-1 font-black transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
                <span>Mulai Ulang ({options.filter(o => o.isEliminated).length})</span>
              </button>

              <button
                id="magic-populate-btn"
                type="button"
                onClick={handleMagicPopulate}
                className="text-[#10B981] hover:text-emerald-600 flex items-center gap-1 font-black transition-colors cursor-pointer"
                title="Sembur 5 menu acak baru"
              >
                <span>🔮 Acak Baru</span>
              </button>
              
              <button
                id="clear-pilihan-btn"
                onClick={handleClearAll}
                className="text-[#FF6584] hover:text-[#FF4066] flex items-center gap-1 font-black transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Kosongkan</span>
              </button>
            </div>
          ) : (
            <div className="mt-3.5 relative z-10 flex justify-center">
              <button
                id="magic-populate-empty-btn"
                type="button"
                onClick={handleMagicPopulate}
                className="w-full bg-[#FFF0F3] hover:bg-[#FFF5F6] border-2 border-dashed border-[#FFC2D1] text-[#FF6584] rounded-xl py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-pulse"
              >
                <span>🔮 Sembur 5 Menu Acak (Anti-Pusing!)</span>
              </button>
            </div>
          )}
        </div>

        {/* Templates Bento Box */}
        <div className="bg-white border-2 border-[#FFE3ED] rounded-[24px] p-6 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-black text-[#5C1A2E] uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-[#FF9EB5] fill-[#FF9EB5]" />
              <span>Inspirasi Menu Enak 🌸</span>
            </h2>
            <span className="text-[10px] bg-[#FFF0F3] text-[#FF6584] border border-[#FFD5E5] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Yumm!
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4 font-bold leading-relaxed">
            Lagi mager mikir? Tap salah satu inspirasi menu di bawah untuk langsung menguji takdir kuliner cantikmu!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  id={`template-${tpl.id}`}
                  onClick={() => loadTemplate(tpl)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all text-sm group relative overflow-hidden ${
                    isSelected 
                      ? 'bg-[#FFF0F3] border-[#FF6584] shadow-xs scale-[1.01]' 
                      : 'bg-[#FFF9FA]/80 border-[#FFE3ED] hover:border-[#FF6584] hover:bg-white cursor-pointer'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-1">
                    <span className="font-black text-[#5C1A2E] uppercase text-[11px] tracking-tight group-hover:text-[#FF6584] transition-colors">
                      {tpl.title}
                    </span>
                    <span className="text-[8px] bg-white border border-[#FFE3ED] text-[#FF6584] font-black pb-0.5 pt-0.5 px-2 rounded-md shrink-0 uppercase">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {tpl.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Spin Stage & Options State */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Slot Stage Card */}
        <div className="bg-white border-2 border-[#FFE3ED] rounded-[24px] p-6 shadow-xs space-y-5 relative overflow-hidden">
          {/* Subtle Decorative Background Gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF0F3] rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="bg-[#FFF0F3] text-[#FF6584] border border-[#FFD5E5] text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                💖 TEMPAT PILIHAN CANTIK • CULINARY
              </span>
              <h1 className="text-2xl font-black text-[#5C1A2E] tracking-tight uppercase mt-1 leading-none flex items-center gap-1.5">
                <span>Putaran Takdir Kuliner</span>
                <span className="text-base">🎠</span>
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Putar komidi takdir kuliner untuk memilih menu terenakmu!</p>
            </div>
            
            {/* Audio Toggle Button */}
            <button
              id="toggle-muting-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-[#FFF9FA] hover:bg-[#FFF0F3] border-2 border-[#FFE3ED] text-[#FF6584] transition-all cursor-pointer shadow-xs"
              title={soundEnabled ? "Mute Suara" : "Unmute Suara"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#10B981]" /> : <VolumeX className="w-4 h-4 text-[#FF4066]" />}
            </button>
          </div>

          {/* Dynamic Interactive Carousel Reel */}
          <DynamicCarousel
            options={options}
            spinning={spinning}
            resultOptionId={resultOptionId}
            onSpinComplete={handleSpinFinished}
            soundEnabled={soundEnabled}
          />

          {/* Play Center Action Controls */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2 relative z-10">
            <button
              id="spin-submit-btn"
              onClick={handleSpinSubmit}
              disabled={spinning || activeOptionsCount < 2}
              className={`flex-1 py-4.5 px-6 rounded-2xl font-black flex items-center justify-center gap-2 select-none text-sm uppercase tracking-wider transition-all duration-150 ${
                activeOptionsCount < 2 
                  ? 'bg-gray-100 text-gray-400 border-2 border-gray-200/50 shadow-none cursor-not-allowed'
                  : 'bg-[#FF6584] text-white shadow-[0_6px_0_0_#CB3D5C] active:translate-y-1.5 active:shadow-none hover:brightness-105 cursor-pointer'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {spinning ? 'SEDANG MENERAWANG...' : activeOptionsCount < 2 ? 'MASUKKAN MINIMAL 2 MENU' : '🍔 TEMUKAN MENU CANTIKKU! 💖'}
              </span>
            </button>

            {/* VETO & ELIMINATE ELEMENT */}
            <AnimatePresence>
              {!spinning && resultOptionId && (
                <motion.button
                  id="veto-option-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleVetoCurrentResult}
                  className="bg-[#5C1A2E] text-white px-6 py-4.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer select-none transition-all hover:bg-[#431221] active:scale-95 shadow-xs uppercase tracking-wide shrink-0"
                >
                  <Ban className="w-4 h-4 text-[#FF6584] stroke-[3]" />
                  <span>Coret Ini &amp; Putar Ulang</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Option Status Management Pills */}
        <div className="bg-white border-2 border-[#FFE3ED] rounded-[24px] p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-[#5C1A2E] uppercase tracking-widest flex items-center gap-1.5">
              <span>Roster Menu Aktif</span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#FF6584] select-none border border-[#FFD5E5]">
                {activeOptionsCount}/{options.length} Menu
              </span>
            </h3>
            
            {options.length > 0 && (
              <span className="text-[9px] font-black text-[#FFA6C9] uppercase tracking-wider">
                *Tap tombol ban untuk coret cepat!
              </span>
            )}
          </div>

          {options.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-bold uppercase tracking-wider leading-relaxed bg-[#FFF9FA] rounded-2xl border border-dashed border-[#FFE3ED]">
              🍛 Belum ada menu cantik di list kamu.<br />Ketik di atas atau pilih salah satu inspirasi menu cepat!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {options.map((opt) => {
                const food = getFoodVisuals(opt.text);
                return (
                  <div
                    key={opt.id}
                    id={`option-pill-${opt.id}`}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all duration-205 ${
                      opt.isEliminated
                        ? 'bg-gray-100/50 border-gray-200 text-gray-400 line-through'
                        : 'bg-white text-[#5C1A2E] border-[#FFE3ED] hover:border-[#FFB6C1] hover:bg-[#FFF9FA]'
                    }`}
                  >
                    {/* Tiny Appetizing food image preview! */}
                    <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-[#FFF0F3] relative bg-neutral-100">
                      <FoodImage 
                        src={food.imageUrl} 
                        alt={opt.text} 
                        emoji={food.emoji}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Cute Category Emoji and label */}
                    <span className="text-xs" title={food.categoryName}>{food.emoji}</span>
                    <span className="max-w-[130px] truncate tracking-tight">{opt.text}</span>

                    {/* Veto marker */}
                    {opt.isEliminated && (
                      <span className="text-[8px] bg-red-100 text-[#C12E53] font-black uppercase px-1.5 py-0.5 rounded">
                        Dicoret
                      </span>
                    )}

                    {/* Quick toggle elimination state */}
                    <button
                      id={`toggle-opt-veto-${opt.id}`}
                      onClick={() => {
                        const changed = options.map(o => {
                          if (o.id === opt.id) {
                            return { ...o, isEliminated: !o.isEliminated };
                          }
                          return o;
                        });
                        setOptions(changed);
                        setResultOptionId(null);
                      }}
                      className="p-1 rounded-lg hover:bg-[#FFF0F3] text-[#FFA6C9] hover:text-[#FF4066] transition-colors cursor-pointer ml-1"
                      title={opt.isEliminated ? "Aktifkan Kembali" : "Coret Menu"}
                    >
                      <Ban className={`w-3.5 h-3.5 ${opt.isEliminated ? 'text-[#FF6584] stroke-[3]' : ''}`} />
                    </button>

                    {/* Remove Button */}
                    <button
                      id={`delete-opt-btn-${opt.id}`}
                      onClick={() => handleRemoveOption(opt.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
