import React, { useState } from "react";

interface FoodImageProps {
  src: string;
  alt: string;
  emoji: string;
  className?: string; // Sizing and rounding
}

export function FoodImage({ src, alt, emoji, className = "w-full h-full object-cover" }: FoodImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div 
        className={`${className} bg-[#FFF0F3] border border-[#FFE3ED] flex items-center justify-center font-bold text-center select-none`}
        style={{ fontSize: "65%" }}
      >
        <span>{emoji}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}
