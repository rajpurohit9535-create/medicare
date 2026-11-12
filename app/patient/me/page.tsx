"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, ShieldCheck, Heart } from "lucide-react";
import { formatPatientHeaderDate } from "@/lib/time";
import { speech } from "@/lib/speech";

export default function WhoAmIPage() {
  // Default values for Amma
  const [profile] = useState({
    displayName: "Amma (Kamala Sharma)",
    homeAddress: "42 Shanti Nilayam, 4th Cross, Indiranagar, Bengaluru",
    livesWith: "Ravi (son), Priya (daughter-in-law), and Arjun (grandson)",
  });

  const [dateStr, setDateStr] = useState("Today");

  useEffect(() => {
    const headerDate = formatPatientHeaderDate(new Date(), "Asia/Kolkata");
    setDateStr(headerDate.dayAndDate);
  }, []);

  const fullSpeechText = `My name is ${profile.displayName}. Today is ${dateStr}. I live at ${profile.homeAddress}. I live with ${profile.livesWith}. You are safe. Your family is looking after you.`;

  return (
    <div className="py-2">
      {/* Top back & read aloud bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/patient"
          className="p-3 rounded-2xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center min-w-[56px] min-h-[56px]"
          aria-label="Back to routine"
        >
          <ArrowLeft className="w-8 h-8" />
        </Link>
        <button
          type="button"
          onClick={() => speech.speak(fullSpeechText)}
          className="px-5 py-3 rounded-2xl bg-white border border-gray-300 text-[#2E7D32] flex items-center gap-2 font-bold text-lg shadow-sm"
          aria-label="Read all details aloud"
        >
          <Volume2 className="w-7 h-7" />
          <span>Read aloud</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#2E7D32]/20 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-lg font-bold text-gray-500 uppercase tracking-wide">
            My Name
          </span>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-1">
            {profile.displayName}
          </p>
        </div>

        <div className="border-b border-gray-100 pb-4">
          <span className="text-lg font-bold text-gray-500 uppercase tracking-wide">
            Today
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#1F2937] mt-1">
            {dateStr}
          </p>
        </div>

        <div className="border-b border-gray-100 pb-4">
          <span className="text-lg font-bold text-gray-500 uppercase tracking-wide">
            Where I Live
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#1F2937] mt-1 leading-snug">
            {profile.homeAddress}
          </p>
        </div>

        <div className="border-b border-gray-100 pb-4">
          <span className="text-lg font-bold text-gray-500 uppercase tracking-wide">
            Who Lives With Me
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#1F2937] mt-1 leading-snug">
            {profile.livesWith}
          </p>
        </div>

        {/* Reassuring Footer */}
        <div className="p-6 rounded-2xl bg-green-50 border-2 border-green-200 flex items-start gap-4">
          <ShieldCheck className="w-10 h-10 text-[#2E7D32] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-2xl font-extrabold text-[#2E7D32]">
              You are safe.
            </h3>
            <p className="text-xl font-bold text-gray-800 mt-1">
              Your family is looking after you and loves you very much.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
