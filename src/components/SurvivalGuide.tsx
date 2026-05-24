import React, { useState } from "react";
import { Sparkles, HelpCircle, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

export function SurvivalGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border-2 border-[#FFE3ED] rounded-[24px] p-5 shadow-xs relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFF9FA] rounded-full blur-xl pointer-events-none -mr-6 -mt-6" />
      
      <div 
        className="flex justify-between items-center cursor-pointer select-none relative z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFF0F3] border border-[#FFD5E5] flex items-center justify-center text-rose-500">
            <Sparkles className="w-4 h-4 fill-current text-[#FF6584] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#5C1A2E] uppercase tracking-wide flex items-center gap-1">
              <span>Buku Resep Anti-Overthink 📖</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tips jitu kelar mikir dalam 1 menit!</p>
          </div>
        </div>

        <button 
          id="toggle-guide-expand-btn"
          className="text-[#FF6584] hover:text-[#FF4066] transition-colors p-1"
        >
          {isOpen ? <ChevronUp className="w-4 h-4 stroke-[3]" /> : <ChevronDown className="w-4 h-4 stroke-[3]" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3.5 border-t border-[#FFE3ED] space-y-3.5 relative z-10 animate-fadeIn">
          <div className="flex gap-2.5 items-start">
            <div className="text-base shrink-0 mt-0.5">🌟</div>
            <div>
              <h4 className="text-xs font-black text-[#5C1A2E] uppercase tracking-tight">1. Mantra 5 Detik</h4>
              <p className="text-xs text-slate-500 font-bold mt-0.5 leading-relaxed">
                Ketik langsung ide pertama yang lewat di kepala, atau klik tombol <span className="text-[#FF6584] font-black">🔮 Sembur Acak</span> untuk memancing selera. Jangan kelamaan ditimbang!
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <div className="text-base shrink-0 mt-0.5">🔮</div>
            <div>
              <h4 className="text-xs font-black text-[#5C1A2E] uppercase tracking-tight">2. Gunakan Hak Veto Secara Bijak</h4>
              <p className="text-xs text-slate-500 font-bold mt-0.5 leading-relaxed">
                Bila roda berputar mendapat <span className="italic">&quot;Bakso&quot;</span> tapi hatimu berbisik <span className="italic">&quot;Ah, malas kuah...&quot;</span>, selamat! Itu tandanya alam bawah sadarmu aslinya pengen menu yang satunya lagi. Klik <span className="text-[#FF6584] font-black">Veto (Coret)</span> untuk mengeliminasi bakso lalu putar ulang!
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <div className="text-base shrink-0 mt-0.5">👥</div>
            <div>
              <h4 className="text-xs font-black text-[#5C1A2E] uppercase tracking-tight">3. Demokrasi Kilat bersama Bestie</h4>
              <p className="text-xs text-slate-500 font-bold mt-0.5 leading-relaxed">
                Punya grup gosip kantor atau kosan yang kerjanya berantem cuma perkara makan siang? Pindah ke tab <span className="text-violet-500 font-black">Group Room</span>, sebarkan link, pasang denda bagi yang paling lelet mencoblos!
              </p>
            </div>
          </div>

          <div className="bg-[#FFF9FA] border border-[#FFE3ED] p-3 rounded-xl text-center text-[10px] text-[#FF6584] font-black uppercase tracking-wider">
            ✨ PERCAYA PADA TAKDIR REJEKIMU HARI INI ✨
          </div>
        </div>
      )}
    </div>
  );
}
