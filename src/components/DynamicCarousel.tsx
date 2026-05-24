import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Option } from '../types';
import { playTickSound, playSuccessSound } from '../utils/audio';
import { Shuffle, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { getFoodVisuals } from '../utils/foodVisuals';
import { FoodImage } from './FoodImage';

interface DynamicCarouselProps {
  options: Option[];
  spinning: boolean;
  resultOptionId: string | null;
  onSpinComplete?: () => void;
  soundEnabled: boolean;
}

export default function DynamicCarousel({
  options,
  spinning,
  resultOptionId,
  onSpinComplete,
  soundEnabled
}: DynamicCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [containerWidth, setContainerWidth] = useState(0);

  // Filter out eliminated choices
  const activeOptions = options.filter(o => !o.isEliminated);

  // Width variables
  const cardWidth = 180; // w-44 is 176px + 4px margins
  const cardOuterWidth = cardWidth + 12; // 180px + 12px margin = 192px total gap

  // Keep track of container size
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Construct a long repeated tape of items for seamless rolling
  // We want to make sure the list is long, e.g., around 100 items
  const repeatCount = activeOptions.length > 0 ? Math.ceil(90 / activeOptions.length) : 0;
  const longTape: { option: Option; originalIndex: number; tapeIndex: number }[] = [];

  for (let r = 0; r < repeatCount; r++) {
    activeOptions.forEach((opt, idx) => {
      longTape.push({
        option: opt,
        originalIndex: idx,
        tapeIndex: longTape.length
      });
    });
  }

  const lastXRef = useRef(0);
  const soundTimerRef = useRef<number | null>(null);

  // Reset to static centered position or run animation when spinning updates
  useEffect(() => {
    if (activeOptions.length === 0 || containerWidth === 0) return;

    if (spinning && resultOptionId) {
      // Find the index of the winner in the active options
      const winnerActiveIndex = activeOptions.findIndex(o => o.id === resultOptionId);
      if (winnerActiveIndex === -1) return;

      // We want to land towards the end of the tape, e.g. the second-to-last repeat block
      const chosenRepeatBlock = Math.max(2, repeatCount - 2);
      const targetTapeIndex = chosenRepeatBlock * activeOptions.length + winnerActiveIndex;

      // Calculate the negative offset to align the winning card directly to the center of the container
      // Card width is 180, margin-right is 12. Center of card is x + cardWidth/2
      // Target offset = center of container - target center
      const targetCenter = targetTapeIndex * cardOuterWidth + cardWidth / 2;
      const finalX = containerWidth / 2 - targetCenter;

      // Reset position first to a rolling start (start near index 0 or 1 repeat block)
      const startTapeIndex = 1 * activeOptions.length + winnerActiveIndex;
      const startCenter = startTapeIndex * cardOuterWidth + cardWidth / 2;
      const startX = containerWidth / 2 - startCenter;

      controls.set({ x: startX });
      lastXRef.current = startX;

      // Clear any leftover ticks
      if (soundTimerRef.current) clearInterval(soundTimerRef.current);

      // Play sound ticks based on physics estimations
      let currentX = startX;
      const speedDeceleration = 0.985;
      let tickStep = cardOuterWidth;
      let nextTickTarget = startCenter + cardOuterWidth;
      
      // We animate from startX to finalX with custom cubic-bezier (fast swipe, slow ease down)
      controls.start({
        x: finalX,
        transition: {
          duration: 4.8,
          ease: [0.1, 0.85, 0.2, 1]
        }
      }).then(() => {
        if (soundEnabled) playSuccessSound();
        if (onSpinComplete) onSpinComplete();
      });

      // Sound ticker helper: monitor changes to visual x to tick on crossing card boundaries
      let animationFrameId: number;
      const monitorProgress = () => {
        // Unfortunately standard framer motion controls.start returns a promise upon completion.
        // We can check the transform style of the element to play tick sounds precisely!
        const element = document.getElementById('carousel-tape');
        if (element) {
          const style = window.getComputedStyle(element);
          const matrix = new WebKitCSSMatrix(style.transform);
          const currentPosX = matrix.m41;

          // Compute how many cards crossed
          const crossedBefore = Math.floor((-lastXRef.current + containerWidth / 2) / cardOuterWidth);
          const crossedNow = Math.floor((-currentPosX + containerWidth / 2) / cardOuterWidth);

          if (crossedNow !== crossedBefore && Math.abs(crossedNow - crossedBefore) < 5) {
            if (soundEnabled) {
              const speedFactor = Math.abs(currentPosX - finalX) / Math.abs(startX - finalX);
              // Pitch goes down slightly as it slows down
              const tone = 500 + 400 * Math.max(0.1, speedFactor);
              playTickSound(tone, 0.04, 'triangle');
            }
          }
          lastXRef.current = currentPosX;
        }

        if (spinning) {
          animationFrameId = requestAnimationFrame(monitorProgress);
        }
      };

      // Start ticker monitor
      animationFrameId = requestAnimationFrame(monitorProgress);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };

    } else if (!spinning) {
      // Static placement
      // If we have a resultOptionId, center it. Otherwise center index 0
      const targetOption = resultOptionId 
        ? activeOptions.find(o => o.id === resultOptionId)
        : activeOptions[0];

      const targetIndex = targetOption ? activeOptions.indexOf(targetOption) : 0;
      
      // Place near start block (index targetIndex + 1 repeat block) to have a nice context
      const staticTapeIndex = activeOptions.length > 0 ? (1 * activeOptions.length + targetIndex) : 0;
      const staticCenter = staticTapeIndex * cardOuterWidth + cardWidth / 2;
      const staticX = containerWidth / 2 - staticCenter;

      controls.set({ x: staticX });
      lastXRef.current = staticX;
    }
  }, [spinning, resultOptionId, activeOptions.length, containerWidth]);

  // If no options are active, show empty state
  if (activeOptions.length === 0) {
    return (
      <div className="w-full h-36 bg-gray-50 border-2 border-gray-150 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 gap-2 font-sans p-6 text-center">
        <AlertCircle className="w-8 h-8 text-[#FF6321] animate-pulse" />
        <div>
          <p className="font-bold text-gray-800">Belum Ada Pilihan</p>
          <p className="text-xs text-gray-400 mt-0.5">Tambahkan pilihan atau klik template di bawah!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Tape Roller Container */}
      <div 
        id="carousel-viewport"
        ref={containerRef}
        className="w-full h-36 bg-gray-50 border-2 border-gray-150 rounded-2xl flex items-center overflow-hidden relative shadow-inner"
      >
        {/* Shadow overlays for elegant fade off effect at sides */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        {/* Center Target Pointer Pin */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-1 bg-[#FF6321] z-20 pointer-events-none shadow-[0_0_15px_rgba(255,99,33,0.4)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF6321] rotate-45 rounded-sm" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF6321] rotate-45 rounded-sm" />
        </div>

        {/* Moving Tape */}
        <motion.div
          id="carousel-tape"
          animate={controls}
          className="flex whitespace-nowrap absolute"
          style={{ willChange: 'transform' }}
        >
          {longTape.map((card, idx) => {
            const isWinner = resultOptionId === card.option.id;
            const isStaticSelected = !spinning && isWinner;
            const food = getFoodVisuals(card.option.text);

            return (
              <div
                key={`${card.option.id}-${idx}`}
                style={{ width: `${cardWidth}px`, marginRight: '12px' }}
                className={`h-28 shrink-0 rounded-2xl border-2 flex flex-col items-center justify-between p-2.5 relative overflow-hidden transition-all duration-300 select-none ${
                  isStaticSelected 
                    ? 'border-[#FF6584] bg-[#FFF0F3] shadow-[0_4px_12px_rgba(255,101,132,0.25)] scale-105 z-10' 
                    : spinning 
                      ? 'border-[#FFE3ED]/60 bg-white/60' 
                      : 'border-[#FFE3ED] bg-white hover:border-[#FFA6C9] hover:bg-[#FFF9FA]'
                }`}
              >
                {/* Accent mini bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: card.option.color || food.color }}
                />

                {/* Index marker */}
                <span className="font-bold text-[8px] text-[#FFA6C9] absolute top-1.5 right-2 px-1 bg-[#FFF0F3] rounded-full">
                  #{card.originalIndex + 1}
                </span>

                {/* Gorgeous food visual badge with floating emoji */}
                <div className="relative mt-1">
                  <div className="w-12 h-12 rounded-full border-2 border-[#FFF0F3] overflow-hidden shadow-xs relative bg-neutral-100 hover:scale-110 transition-transform duration-300">
                    <FoodImage 
                      src={food.imageUrl} 
                      alt={card.option.text} 
                      emoji={food.emoji}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Floating Emoji Badge */}
                  <span className="absolute -bottom-1 -right-1.5 bg-white border-2 border-[#FFF0F3] text-[11px] w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
                    {food.emoji}
                  </span>
                </div>

                {/* Option Text and Category Title */}
                <div className="text-center w-full mt-1.5">
                  <p className="text-xs font-black text-[#5C1A2E] truncate w-full px-1">
                    {card.option.text}
                  </p>
                  <span 
                    className="text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full inline-block mt-0.5"
                    style={{ backgroundColor: `${food.color}15`, color: food.color }}
                  >
                    {food.categoryName}
                  </span>
                </div>

                {/* Highlight Winner overlay badge */}
                {isStaticSelected && (
                  <div className="absolute top-1.5 left-2 text-[#FF6584] animate-bounce">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Funny reassurance helper text underneath */}
      {!spinning && resultOptionId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center justify-center gap-2 text-xs text-[#DE3B60] font-extrabold bg-[#FFF0F3] border-2 border-[#FFC2D1] rounded-xl px-4 py-3 text-center shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-[#FF537D] animate-pulse" />
          <span>Takdir berbisik manis: 💖 <strong>&quot;{options.find(o => o.id === resultOptionId)?.text}&quot;</strong> 💖 adalah jawaban terbaik untuk nafsumu hari ini! Nyuumm~</span>
        </motion.div>
      )}
    </div>
  );
}
