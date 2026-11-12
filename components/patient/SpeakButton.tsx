"use client";

import { Volume2 } from "lucide-react";
import { speech } from "@/lib/speech";

interface SpeakButtonProps {
  textToSpeak: string;
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SpeakButton({
  textToSpeak,
  ariaLabel = "Read this aloud",
  className = "",
  size = "md",
}: SpeakButtonProps) {
  const sizeClasses = {
    sm: "w-10 h-10 p-2",
    md: "w-12 h-12 p-2.5",
    lg: "w-14 h-14 p-3",
  }[size];

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  }[size];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speech.speak(textToSpeak);
      }}
      aria-label={ariaLabel}
      className={`rounded-2xl bg-white hover:bg-gray-100 border border-gray-200 text-[#2E7D32] shadow-sm flex items-center justify-center transition active:scale-95 shrink-0 ${sizeClasses} ${className}`}
    >
      <Volume2 className={iconSizes} />
    </button>
  );
}

