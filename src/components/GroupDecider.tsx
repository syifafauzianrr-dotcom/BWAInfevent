import React, { useState, useEffect, useRef } from 'react';
import { Option, Room, Template } from '../types';
import { templates, pastelColors } from '../templates';
import DynamicCarousel from './DynamicCarousel';
import { playVetoSound, playSuccessSound } from '../utils/audio';
import { getFoodVisuals } from '../utils/foodVisuals';
import { FoodImage } from './FoodImage';
import { 
  Users, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Share2, 
  Check, 
  Play, 
  Ban, 
  CornerDownRight, 
  MapPin, 
  UserPlus, 
  Copy,
  ArrowRight,
  Sparkles,
  RefreshCw,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GroupDeciderProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  initialRoomId: string | null;
  onClearRoomParam: () => void;
}

export default function GroupDecider({ 
  soundEnabled, 
  setSoundEnabled, 
  initialRoomId, 
  onClearRoomParam 
}: GroupDeciderProps) {
  // Local storage keys
  const USER_NAME_KEY = 'pilihmana_voter_name';

  // State
  const [roomId, setRoomId] = useState<string | null>(initialRoomId);
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Create Room Form State
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createOptions, setCreateOptions] = useState<string[]>(['', '', '']);
  
  // Active Room state (Polled)
  const [room, setRoom] = useState<Room | null>(null);
  const [addOptionVal, setAddOptionVal] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Input join manually code
  const [manualCode, setManualCode] = useState('');

  // Refs
  const pollingIntervalRef = useRef<number | null>(null);

  // Initialize username from local storage if exists
  useEffect(() => {
    const savedName = localStorage.getItem(USER_NAME_KEY);
    if (savedName) {
      setUsername(savedName);
    }
  }, []);

  // Poll room data when joined
  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      // Start polling every 1.5 seconds for real-time synchronization
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      
      pollingIntervalRef.current = window.setInterval(() => {
        fetchRoomDataSilent();
      }, 1500);
    } else {
      setRoom(null);
      setIsJoined(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [roomId]);

  // Load a template into the creation options form
  const handleLoadTemplateToForm = (tpl: Template) => {
    setCreateTitle(tpl.title);
    setCreateDescription(tpl.description);
    setCreateOptions([...tpl.options]);
  };

  // Add field in options template
  const handleAddField = () => {
    setCreateOptions([...createOptions, '']);
  };

  // Remove field in options template
  const handleRemoveField = (idx: number) => {
    if (createOptions.length <= 2) return; // keep minimum 2 items
    const filt = createOptions.filter((_, i) => i !== idx);
    setCreateOptions(filt);
  };

  // Create standard room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const validOptions = createOptions.filter(o => o.trim().length > 0);
    if (!createTitle.trim()) {
      setErrorMsg("Nama ruangan harus diisi.");
      setLoading(false);
      return;
    }
    if (validOptions.length < 2) {
      setErrorMsg("Harap masukkan minimal 2 pilihan belanja/makanan.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createTitle,
          description: createDescription,
          optionsText: validOptions
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal membuat ruangan.");
      }

      const freshRoom: Room = await res.json();
      setRoomId(freshRoom.id);
      setRoom(freshRoom);
      
      // Auto register name as creator (or wait for join login screen)
      // We will show the join credential card next
    } catch (e: any) {
      const errMsg = e.message || "";
      if (errMsg.includes("Unexpected token") || errMsg.includes("not valid JSON")) {
        setErrorMsg("Server sedang melakukan persiapan/membangun ulang setelah update. Harap tunggu 3-5 detik lalu klik konfirmasi lagi! 🚀");
      } else {
        setErrorMsg(errMsg || "Gagal menghubungi server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Room Data (with loaders)
  const fetchRoomData = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) {
        throw new Error("Ruangan tidak ditemukan atau server offline.");
      }
      const data: Room = await res.json();
      setRoom(data);
      
      // If user's registered username is in voters list, they are marked as joined!
      const savedName = localStorage.getItem(USER_NAME_KEY);
      if (savedName && data.voters[savedName] !== undefined) {
        setIsJoined(true);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal terhubung dengan server.");
      setRoomId(null);
    }
  };

  // Silent polling to avoid interface visual flickering
  const fetchRoomDataSilent = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (res.ok) {
        const data: Room = await res.json();
        setRoom(data);
        
        const savedName = localStorage.getItem(USER_NAME_KEY);
        if (savedName && data.voters[savedName] !== undefined) {
          setIsJoined(true);
        }
      }
    } catch (e) {
      // Ignore background errors
    }
  };

  // Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomId) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal bergabung.");
      }

      localStorage.setItem(USER_NAME_KEY, username.trim());
      setIsJoined(true);
      await fetchRoomData();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Cast vote
  const handleCastVote = async (optionId: string | null) => {
    if (!roomId || !username || !isJoined) return;
    try {
      const currentVote = room?.voters[username];
      const targetVote = currentVote === optionId ? null : optionId; // toggle off if double clicked

      const res = await fetch(`/api/rooms/${roomId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, optionId: targetVote })
      });

      if (res.ok) {
        const updated: Room = await res.json();
        setRoom(updated);
      }
    } catch (e) {
      // Fail silently for instant responses
    }
  };

  // Add Custom Option inside Room in real-time
  const handleAddOptionRealtime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addOptionVal.trim() || !roomId) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}/add-option`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: addOptionVal })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Gagal menambahkan.");
        return;
      }

      const updated: Room = await res.json();
      setRoom(updated);
      setAddOptionVal('');
    } catch (e) {
      // error
    }
  };

  // Delete option from room in real-time
  const handleDeleteOptionRealtime = async (e: React.MouseEvent, optionId: string) => {
    e.stopPropagation(); // Prevent triggering cast-vote of parent card!
    if (!roomId) return;

    if (room && room.options.length <= 2) {
      alert("Aduh, butuh minimal 2 pilihan sisa demi perdamaian batin harian!");
      return;
    }

    if (!confirm("Yakin ingin menghapus menu pilihan ini dari voting?")) {
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}/delete-option`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Gagal menghapus.");
        return;
      }

      const updated: Room = await res.json();
      setRoom(updated);
    } catch (err) {
      // ignore
    }
  };

  // Spin Roulette (Host or participant trigger)
  const handleSpinGroup = async () => {
    if (!roomId || !room) return;
    
    const active = room.options.filter(o => !o.isEliminated);
    if (active.length < 2) {
      alert("Aduh, butuh minimal 2 pilihan aktif untuk mengundi takdir!");
      return;
    }

    // Determine the winner from voters weights or random
    // Dynamic weight logic: Each option gets weights according to current room votes
    // Compute votes tally
    const tallies: { [key: string]: number } = {};
    active.forEach(o => tallies[o.id] = 1); // Baseline weight of 1

    let hasVotes = false;
    Object.values(room.voters).forEach(optId => {
      if (typeof optId === 'string' && tallies[optId] !== undefined) {
        tallies[optId] += 3; // Boost weight by 3 for each direct human vote!
        hasVotes = true;
      }
    });

    // Pick according to weighted entries
    const weightedPool: string[] = [];
    for (const optId in tallies) {
      const weight = tallies[optId];
      for (let w = 0; w < weight; w++) {
        weightedPool.push(optId);
      }
    }

    const winnerId = weightedPool[Math.floor(Math.random() * weightedPool.length)];

    try {
      // 1. Notify spinning set true
      await fetch(`/api/rooms/${roomId}/spin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spinning: true })
      });
      
      // 2. Short wait, then commit winner
      setTimeout(async () => {
        await fetch(`/api/rooms/${roomId}/spin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spinning: true, resultOptionId: winnerId })
        });
      }, 300);

    } catch (e) {
      // Error
    }
  };

  // VETO CURRENT RESULT (Real-time sync)
  const handleVetoGroup = async () => {
    if (!roomId || !room?.resultOptionId) return;
    
    try {
      if (soundEnabled) playVetoSound();

      // Submit Veto
      const res = await fetch(`/api/rooms/${roomId}/veto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: room.resultOptionId })
      });

      if (!res.ok) return;

      // Soft reset spinning state and automatically initiate next spin among remaining active
      await fetch(`/api/rooms/${roomId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullReset: false })
      });

      // Fetch fresh and auto spin if more than 2 items are active
      const updatedRoom: Room = await res.json();
      const remainCount = updatedRoom.options.filter(o => !o.isEliminated).length;
      if (remainCount >= 2) {
        setTimeout(() => {
          handleSpinGroup();
        }, 500);
      }
    } catch (e) {
      // Fail
    }
  };

  // Reset entire room (Full reset: restores Veto, clears votes)
  const handleResetGroup = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullReset: true })
      });

      if (res.ok) {
        const data = await res.json();
        setRoom(data);
      }
    } catch (e) {
      // Reset fail
    }
  };

  // Leave room
  const handleLeaveRoom = () => {
    setRoomId(null);
    setRoom(null);
    setIsJoined(false);
    onClearRoomParam();
  };

  // Share URL Generator & Clipboard Trigger
  const getShareLink = () => {
    return `${window.location.origin}${window.location.pathname}?room=${roomId}`;
  };

  const copyToClipboard = () => {
    const link = getShareLink();
    try {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Clipboards fallback
      const el = document.createElement('textarea');
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate vote scores
  const getVotesTally = () => {
    const count: { [key: string]: number } = {};
    if (!room) return count;

    room.options.forEach(o => {
      count[o.id] = 0;
    });

    Object.values(room.voters).forEach(voteOptId => {
      if (typeof voteOptId === 'string' && count[voteOptId] !== undefined) {
        count[voteOptId]++;
      }
    });

    return count;
  };

  const getVotersByOption = (optionId: string) => {
    if (!room) return [];
    return Object.entries(room.voters)
      .filter(([_, optId]) => optId === optionId)
      .map(([name]) => name);
  };

  // Total voters connected
  const totalVotesCast = room ? Object.values(room.voters).filter(v => v !== null).length : 0;
  const votersCount = room ? Object.keys(room.voters).length : 0;

  // Render Section
  if (roomId) {
    if (!room) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-sm">Menghubungkan ke ruang {roomId}...</p>
        </div>
      );
    }

    // Join login screen if name not in directory
    if (!isJoined) {
      return (
        <div className="max-w-md mx-auto bg-white border-2 border-[#FFE3ED] rounded-[24px] p-6 shadow-xs space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFF0F3] rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
          <div className="text-center relative z-10">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#FFF0F3] flex items-center justify-center border-2 border-[#FFE3ED] mb-3">
              <Users className="w-6 h-6 text-[#FF6584]" />
            </div>
            <h2 className="text-lg font-black text-[#5C1A2E] uppercase tracking-tight">Bergabung ke Room Voting 🍭</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Ruangan: <span className="font-extrabold text-[#FF6584] uppercase bg-[#FFF0F3] px-2 py-0.5 rounded">{room.title}</span>
            </p>
            {room.description && (
              <p className="text-xs font-semibold text-slate-400 mt-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 inline-block">
                &quot;{room.description}&quot;
              </p>
            )}
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-black text-[#5C1A2E] uppercase tracking-wide mb-1">Siapa Nama Cantikmu? 🌸</label>
              <input
                id="join-voter-name-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: Siska, Caca, Andi..."
                maxLength={15}
                className="w-full bg-[#FFF9FA] border-2 border-[#FFE3ED] rounded-xl px-4 py-3 text-sm text-[#5C1A2E] focus:outline-none focus:border-[#FF6584] font-sans transition-all placeholder:text-[#FFA6C9]/60"
              />
            </div>

            <button
              id="join-voter-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6584] hover:bg-[#FF4066] text-white rounded-xl py-3 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-95 shadow-md shadow-[#FFD5E5]"
            >
              <span>{loading ? "Bergabung..." : "Masuk ke Ruangan Cantik"}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-red-500 font-bold text-center z-10 relative">{errorMsg}</p>
          )}

          <div className="text-center pt-2 border-t border-[#FFE3ED] z-10 relative">
            <button
              onClick={handleLeaveRoom}
              className="text-xs text-[#FF6584] hover:text-[#FF4066] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        </div>
      );
    }

    const voteTallies = getVotesTally();
    const activeOptions = room.options.filter(o => !o.isEliminated);

    // VOTING DASHBOARD STAGE WITH FRIENDS
    return (
      <div className="space-y-6">
        {/* Header Widget */}
        <div className="bg-white border-2 border-[#FFE3ED] rounded-[24px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] bg-[#FFF0F3] text-[#FF6584] border border-[#FFD5E5] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                Group Room 🍭
              </span>
              <h1 className="text-xl font-black text-[#5C1A2E] tracking-tight uppercase">{room.title}</h1>
            </div>
            <p className="text-xs font-bold text-[#FFA6C9] uppercase tracking-wide">{room.description || "Mari berunding mufakat demi kedamaian batin harianmu."}</p>
          </div>

          {/* Invitation Copy links */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Room ID Badge */}
            <div className="bg-[#FFF9FA] border-2 border-[#FFE3ED] rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
              <span className="text-[#FFA6C9] font-black uppercase text-[10px]">Room Code:</span>
              <span className="font-mono font-black text-[#FF6584] text-sm tracking-wide">{room.id}</span>
            </div>

            {/* Copy Button */}
            <button
              id="copy-invite-link-btn"
              onClick={copyToClipboard}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 select-none transition-all cursor-pointer ${
                copied 
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-600 font-extrabold' 
                  : 'bg-[#FF6584] hover:bg-[#FF4066] border-[#FFC2D1] text-white hover:scale-[1.02] active:scale-95 shadow-[#FFD5E5]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 animate-bounce stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[3]" />}
              <span>{copied ? "Link Tersalin!" : "Ajak Teman Kos 💖"}</span>
            </button>

            {/* Leave button */}
            <button
              onClick={handleLeaveRoom}
              className="p-2.5 rounded-xl bg-gray-55 hover:bg-red-50 border-2 border-gray-100 hover:border-red-200 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              title="Keluar Ruangan"
            >
              <LogOut className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Carousel Reel */}
        <div className="bg-white border-2 border-gray-150 rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Decision Stage</h3>
            <span className="text-[10px] font-bold text-[#10B981] animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Real-time Terkoneksi
            </span>
          </div>

          <DynamicCarousel
            options={room.options}
            spinning={room.spinning}
            resultOptionId={room.resultOptionId}
            onSpinComplete={() => {
              // Wait, in group mode everyone's browser detects result independently via polling.
              // We just let the client play success sound
              if (soundEnabled && room.resultOptionId) {
                // If we just got the result, play it once
                playSuccessSound();
              }
            }}
            soundEnabled={soundEnabled}
          />

          {/* Trigger controls */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              id="group-spin-btn"
              onClick={handleSpinGroup}
              disabled={room.spinning || activeOptions.length < 2 || room.isEnded}
              className={`flex-1 py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 transition-all select-none text-xs tracking-wider uppercase ${
                room.isEnded
                  ? 'bg-gray-100 text-gray-400 border-2 border-gray-250'
                  : activeOptions.length < 2
                    ? 'bg-gray-150 border-2 border-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#FFD100] text-black shadow-[0_6px_0_0_#B49400] active:translate-y-1.5 active:shadow-none font-black text-sm cursor-pointer'
              }`}
            >
              <Play className="w-4 h-4 fill-current animate-pulse" />
              <span>
                {room.spinning 
                  ? 'MENGUNDI SEJAWAT...' 
                  : room.isEnded 
                    ? `HASIL DIPANDU TAKDIR!` 
                    : `SINKRON SPIN PILIHMANA (${activeOptions.length} OPSI)`}
              </span>
            </button>

            {/* Group veto button */}
            <AnimatePresence>
              {room.isEnded && room.resultOptionId && (
                <motion.button
                  id="group-veto-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleVetoGroup}
                  className="bg-black text-white rounded-2xl px-5 py-4 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm uppercase tracking-wider"
                >
                  <Ban className="w-4 h-4 text-red-500 stroke-[3]" />
                  <span>Veto &amp; Spin Ulang</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Clear-Reset board */}
            {room.isEnded && (
              <button
                id="group-reset-btn"
                onClick={handleResetGroup}
                className="bg-white hover:bg-gray-50 border-2 border-gray-150 text-gray-700 font-black rounded-2xl px-5 py-4 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs uppercase tracking-wider"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                <span>Reset Vote &amp; Veto</span>
              </button>
            )}
          </div>
        </div>

        {/* MAIN SPLIT: Options & Participants */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Options List Grid (Voting target widgets) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border-2 border-gray-150 shadow-xs">
              <span className="text-xs font-black text-gray-900 pl-2 uppercase tracking-tight">Pilihan untuk Dicoblos</span>
              
              {/* Inline suggestion form */}
              <form onSubmit={handleAddOptionRealtime} className="flex gap-1 max-w-[280px]">
                <input
                  type="text"
                  required
                  value={addOptionVal}
                  onChange={(e) => setAddOptionVal(e.target.value)}
                  placeholder="Tambahkan ide..."
                  maxLength={25}
                  className="bg-[#FFF9FA] border border-[#FFE3ED] rounded-lg px-2.5 py-1 text-xs text-[#5C1A2E] placeholder-[#FFA6C9]/70 focus:outline-none focus:border-[#FF6584] font-sans"
                />
                <button
                  id="group-add-opt-btn"
                  type="submit"
                  className="bg-[#FF6584] hover:bg-[#FF4066] text-white rounded-lg px-2 flex items-center justify-center transition-colors shadow-xs py-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {room.options.map((opt) => {
                const votes = voteTallies[opt.id] || 0;
                const isMyVote = room.voters[username] === opt.id;
                const pct = totalVotesCast > 0 ? (votes / totalVotesCast) * 100 : 0;
                const votersOnThis = getVotersByOption(opt.id);
                const food = getFoodVisuals(opt.text);

                return (
                  <div
                    key={opt.id}
                    id={`voter-widget-opt-${opt.id}`}
                    onClick={() => {
                      if (!opt.isEliminated && !room.isEnded) {
                        handleCastVote(opt.id);
                      }
                    }}
                    className={`text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden select-none group flex flex-col justify-between min-h-[120px] ${
                      opt.isEliminated
                        ? 'bg-gray-100/50 border-gray-200 text-gray-400 opacity-50'
                        : room.isEnded
                          ? 'bg-gray-50/70 border-gray-150'
                          : isMyVote
                            ? 'bg-[#FFF0F3] border-[#FF6584] ring-2 ring-[#FF6584]/15 cursor-pointer'
                            : 'bg-white border-[#FFE3ED] hover:border-[#FFB6C1] hover:bg-[#FFF9FA] cursor-pointer'
                    }`}
                  >
                    {/* Progress bar background for voting tally */}
                    {!opt.isEliminated && totalVotesCast > 0 && (
                      <div 
                        className="absolute bottom-0 left-0 top-0 bg-[#FF6584]/8 transition-all duration-500 ease-out z-0" 
                        style={{ width: `${pct}%` }}
                      />
                    )}

                    {/* Badge header */}
                    <div className="flex justify-between items-start z-10 w-full mb-2">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className={`w-2 h-2 rounded-full ${opt.isEliminated ? 'bg-gray-300' : ''}`}
                          style={opt.isEliminated ? {} : { backgroundColor: opt.color || food.color }}
                        />
                        <span className="font-extrabold text-[8px] text-slate-400 uppercase tracking-widest">
                          {opt.isEliminated ? 'ELIMINATED' : food.categoryName}
                        </span>
                      </div>

                      {/* Vote tally bubbles & Delete option button */}
                      <div className="flex items-center gap-1.5 z-20">
                        {isMyVote && !opt.isEliminated && (
                          <span className="text-[8px] bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Pilihanmu 💖
                          </span>
                        )}
                        {!opt.isEliminated && (
                          <span className="text-[10px] bg-[#FFF0F3] text-[#FF6584] font-black px-2 py-0.5 rounded-full border border-[#FFD5E5]">
                            {votes} Coblos
                          </span>
                        )}
                        
                        {/* Real-time delete option button */}
                        {!room.isEnded && (
                          <button
                            id={`delete-opt-realtime-${opt.id}`}
                            type="button"
                            onClick={(e) => handleDeleteOptionRealtime(e, opt.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF4066] hover:bg-[#FFF0F3] transition-all cursor-pointer pointer-events-auto shrink-0"
                            title="Hapus pilihan ini dari voting"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Appetizing Food Item Body Row */}
                    <div className="flex gap-2.5 items-center z-10 w-full mb-1">
                      <div className="w-10 h-10 rounded-full border-2 border-[#FFF0F3] overflow-hidden shrink-0 relative bg-neutral-100">
                        <FoodImage 
                          src={food.imageUrl} 
                          alt={opt.text} 
                          emoji={food.emoji}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black text-slate-500 flex items-center gap-1`}>
                          <span>{food.emoji}</span>
                          <span className="truncate max-w-[100px] uppercase text-[9px] tracking-wider leading-none">Menu Pilihan</span>
                        </p>
                        <p className={`text-sm font-black mt-0.5 text-[#5C1A2E] truncate ${opt.isEliminated ? 'line-through text-gray-400 font-bold' : ''}`}>
                          {opt.text}
                        </p>
                      </div>
                    </div>

                    {/* Voter tags below options */}
                    {!opt.isEliminated && votersOnThis.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-1 z-10">
                        {votersOnThis.map(name => (
                          <span 
                            key={name}
                            className={`text-[9px] px-2 py-0.5 rounded-full font-black flex items-center gap-0.5 ${
                              name === username 
                                ? 'bg-[#FF6584]/15 border border-[#FF6584]/20 text-[#FF6584]' 
                                : 'bg-slate-50 text-slate-500 border border-slate-100'
                            }`}
                          >
                            <Users className="w-2 h-2 text-slate-400" />
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected Voters list sidebar */}
          <div className="lg:col-span-4 bg-white border-2 border-[#FFE3ED] rounded-[24px] p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#FFE3ED] pb-3">
              <h3 className="text-xs font-black text-[#5C1A2E] uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF6584]" />
                <span>PARTISIPAN ({votersCount})</span>
              </h3>
              
              <span className="text-[10px] bg-[#FFF0F3] border border-[#FFD5E5] text-[#FF6584] font-black px-2 py-0.5 rounded-full">
                {totalVotesCast}/{votersCount} Coblos 🗳️
              </span>
            </div>

            {/* Voter list */}
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {Object.entries(room.voters).map(([name, optId]) => {
                const actsName = name === username;
                const votedOption = room.options.find(o => o.id === optId);

                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between p-2.5 rounded-xl border-2 select-none text-xs ${
                      actsName 
                        ? 'bg-[#FFF0F3] border-[#FF6584] text-[#FF6584] font-black' 
                        : 'bg-[#FFF9FA] border-[#FFE3ED] text-[#5C1A2E]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black uppercase text-[11px]">
                      <div className={`w-1.5 h-1.5 rounded-full ${votedOption ? 'bg-[#10B981]' : 'bg-[#FFD100] animate-pulse'}`} />
                      <span className="truncate max-w-[100px]">{name} {actsName && <span className="text-[9px] text-gray-400 font-bold ml-1">(Kamu)</span>}</span>
                    </div>

                    <div className="flex items-center gap-2 max-w-[130px]">
                      {votedOption ? (
                        <span className="text-[10px] font-black bg-gray-100 border border-gray-200 text-gray-800 px-2 py-0.5 rounded truncate uppercase">
                          {votedOption.text}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-bold italic animate-pulse uppercase">
                          Mikir...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed text-center bg-gray-50 p-3 rounded-xl border border-gray-150 uppercase tracking-wide">
              Undang kolega kantor atau teman kosanmu dengan membagikan link halaman ini! Setiap pilihan dan hasil undian akan tersinkronisasi otomatis.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ROOM GENERATION / CODE SUBMISSION CREATOR PAGE
  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Selector Options Tab: Join code manually */}
      <div className="bg-white border-2 border-[#FFE3ED] rounded-[24px] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-[#5C1A2E] uppercase tracking-tight flex items-center gap-2">
            <UserPlus className="w-4.5 h-4.5 text-[#FF6584]" />
            <span>Punya Kode Ruangan? 🔑</span>
          </h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Masukkan 6-karakter kode ruangan untuk langsung join.</p>
        </div>

        <div className="flex w-full sm:w-auto gap-2">
          <input
            id="join-code-input"
            type="text"
            placeholder="CONTOH: X7H2KP"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-28 sm:w-28 bg-[#FFF9FA] border-2 border-[#FFE3ED] rounded-xl px-3 py-2 text-center font-mono text-sm uppercase text-[#5C1A2E] placeholder-[#FFA6C9]/55 tracking-wider focus:outline-none focus:border-[#FF6584]"
          />
          <button
            id="join-code-btn"
            onClick={() => {
              if (manualCode.trim().length === 6) {
                setRoomId(manualCode.trim());
              } else {
                alert("Kode ruangan harus pas 6 karakter!");
              }
            }}
            className="bg-[#FF6584] hover:bg-[#FF4066] text-white rounded-xl px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#FFD5E5]"
          >
            Join
          </button>
        </div>
      </div>

      {/* Creation form */}
      <div className="bg-white border-2 border-[#FFE3ED] rounded-[28px] p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-black text-[#5C1A2E] uppercase tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF6584]" />
            <span>Buat Ruang Voting Baru 🍭</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide leading-relaxed">Ciptakan ruang diskusi cepat dengan teman kos/kantor di mana pilihan voting terintegrasi sinkron secara real-time.</p>
        </div>

        {/* Preset quick templates to load direct options into the creation fields */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-[#FFA6C9]">Load Template Cepat:</label>
          <div className="flex flex-wrap gap-1.5">
            {templates.slice(0, 3).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                id={`load-form-template-${tpl.id}`}
                onClick={() => handleLoadTemplateToForm(tpl)}
                className="text-left text-[11px] font-black uppercase bg-[#FFF9FA] hover:bg-[#FFF0F3] text-[#A78BFA] border border-[#FFE3ED] hover:border-[#FFB6C1] px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer transition-all"
              >
                + {tpl.title.split(" ")[0]} ({tpl.title.split(" ").slice(1).join(" ")})
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#5C1A2E] mb-1">Nama Ruangan</label>
            <input
              id="room-title-form-input"
              type="text"
              required
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="Contoh: Makan Siang Kosan, Nonton Bioskop..."
              maxLength={40}
              className="w-full bg-[#FFF9FA] border-2 border-[#FFE3ED] rounded-xl px-4 py-2.5 text-sm text-[#5C1A2E] focus:outline-none focus:border-[#FF6584] font-sans transition-all placeholder-[#FFA6C9]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#5C1A2E] mb-1">Keterangan / Deskripsi (Opsional)</label>
            <input
              id="room-description-form-input"
              type="text"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Contoh: Putar jam 12 siang ya, yang kalah bayar es teh"
              maxLength={100}
              className="w-full bg-[#FFF9FA] border-2 border-[#FFE3ED] rounded-xl px-4 py-2.5 text-sm text-[#5C1A2E] focus:outline-none focus:border-[#FF6584] font-sans transition-all placeholder-[#FFA6C9]/60"
            />
          </div>

          {/* Dynamic option builder list */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-[#FFA6C9]">Daftar Pilihan</label>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {createOptions.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center font-sans">
                  <span className="font-mono text-[#FFA6C9] text-xs shrink-0 w-5">#{idx + 1}</span>
                  <input
                    id={`opt-form-input-${idx}`}
                    type="text"
                    required={idx < 2} // first 2 are mandatory
                    value={opt}
                    onChange={(e) => {
                      const updated = [...createOptions];
                      updated[idx] = e.target.value;
                      setCreateOptions(updated);
                    }}
                    placeholder={`Contoh pilihan ke-${idx + 1}`}
                    maxLength={30}
                    className="flex-1 bg-[#FFF9FA] border-2 border-[#FFE3ED] rounded-xl px-3.5 py-2 text-xs text-[#5C1A2E] focus:outline-none focus:border-[#FF6584] font-sans"
                  />
                  {createOptions.length > 2 && (
                    <button
                      id={`remove-opt-form-btn-${idx}`}
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="p-2 text-slate-400 hover:text-[#C12E53] transition-colors cursor-pointer"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              id="add-opt-field-form-btn"
              type="button"
              onClick={handleAddField}
              className="text-xs text-[#FF6584] hover:text-[#FF4066] font-black flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Tambah Kotak Pilihan</span>
            </button>
          </div>

          <button
            id="create-room-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6584] hover:bg-[#FF4066] text-white rounded-xl py-3.5 text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md shadow-[#FFD5E5] uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-[#FFD100] animate-pulse fill-current" />
            <span>{loading ? "Menciptakan Ruangan..." : "Konfirmasi & Buka Ruang Voting!"}</span>
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-red-500 font-black text-center">{errorMsg}</p>
        )}
      </div>

    </div>
  );
}
