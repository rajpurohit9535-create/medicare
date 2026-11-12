"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPatientHeaderDate } from "@/lib/time";
import { SpeakButton } from "./SpeakButton";
import { User } from "lucide-react";

interface PatientHeaderProps {
  displayName?: string;
  timeZone?: string;
}

export function PatientHeader({
  displayName = "Amma",
  timeZone = "Asia/Kolkata",
}: PatientHeaderProps) {
  const [headerInfo, setHeaderInfo] = useState<{
    dayAndDate: string;
    period: string;
    timeString: string;
    fullString: string;
  } | null>(null);

  useEffect(() => {
    setHeaderInfo(formatPatientHeaderDate(new Date(), timeZone));
    const interval = setInterval(() => {
      setHeaderInfo(formatPatientHeaderDate(new Date(), timeZone));
    }, 30000);
    return () => clearInterval(interval);
  }, [timeZone]);

  const displayString = headerInfo?.fullString || "Today. CareCompanion.";
  const spokenText = `${displayString} Hello, ${displayName}.`;

  return (
    <header className="w-full bg-white border-b-2 border-gray-200 py-3 px-4 sm:px-6 shadow-xs">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href="/patient/me"
            className="inline-flex items-center gap-1.5 text-lg font-bold text-gray-600 hover:text-[#2E7D32] transition"
            title="Tap to see who you are"
          >
            <User className="w-5 h-5 text-[#2E7D32]" />
            <span>Hello, <strong className="text-gray-900 underline decoration-2">{displayName}</strong></span>
          </Link>
          <p className="text-xl sm:text-2xl font-extrabold text-[#1F2937] truncate mt-0.5">
            {displayString}
          </p>
        </div>

        <SpeakButton
          textToSpeak={spokenText}
          ariaLabel="Read date and time aloud"
          size="md"
        />
      </div>
    </header>
  );
}
