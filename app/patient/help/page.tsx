"use client";

import { useState } from "react";
import Link from "next/link";
import { LifeBuoy, ArrowLeft, Volume2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { speech } from "@/lib/speech";
import { BigButton } from "@/components/ui/BigButton";

export default function PatientHelpPage() {
  const [stage, setStage] = useState<"initial" | "confirm" | "sent">("initial");

  const handleInitialClick = () => {
    speech.speak("Do you need help? Tap Yes to tell your family.");
    setStage("confirm");
  };

  const handleConfirmHelp = () => {
    speech.speak("Help is on the way. Your family has been told.");
    setStage("sent");
  };

  const handleCancel = () => {
    speech.speak("Okay, taking you back.");
    setStage("initial");
  };

  return (
    <div className="py-2 flex flex-col items-center">
      {stage === "initial" && (
        <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-3xl bg-red-100 text-[#C62828] mb-2">
            <LifeBuoy className="w-16 h-16 stroke-[2.5]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">
            Emergency Help
          </h1>
          <p className="text-xl sm:text-2xl text-[#4B5563] font-medium leading-relaxed">
            If you feel lost, unwell, or need your family right away, tap the red button below.
          </p>

          <BigButton
            variant="danger"
            onClick={handleInitialClick}
            className="min-h-[80px] sm:min-h-[90px] text-2xl sm:text-3xl shadow-xl mt-4 cursor-pointer touch-manipulation"
          >
            <LifeBuoy className="w-9 h-9 stroke-[3]" />
            I Need Help
          </BigButton>

          <Link
            href="/patient"
            className="w-full min-h-[56px] rounded-2xl bg-white hover:bg-gray-100 active:scale-[0.98] text-gray-700 font-bold text-xl flex items-center justify-center gap-2 border border-gray-300 transition cursor-pointer touch-manipulation shadow-xs"
          >
            <ArrowLeft className="w-6 h-6" />
            Go back to routine
          </Link>
        </div>
      )}

      {stage === "confirm" && (
        <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-300 shadow-md text-center space-y-6">
          <div className="p-3 rounded-2xl bg-red-100 text-[#C62828] w-fit mx-auto">
            <LifeBuoy className="w-12 h-12 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-red-900">
            Do you need help right now?
          </h2>
          <p className="text-lg sm:text-xl text-gray-700">
            We will alert your family immediately.
          </p>

          <div className="flex flex-col gap-4 pt-2">
            <BigButton
              variant="danger"
              onClick={handleConfirmHelp}
              className="min-h-[72px] text-xl sm:text-2xl cursor-pointer touch-manipulation"
            >
              Yes, I need help
            </BigButton>

            <BigButton
              variant="secondary"
              onClick={handleCancel}
              className="min-h-[64px] text-lg sm:text-xl cursor-pointer touch-manipulation"
            >
              No, I am okay (go back)
            </BigButton>
          </div>
        </div>
      )}

      {stage === "sent" && (
        <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 border-2 border-green-300 shadow-md text-center space-y-6">
          <div className="p-4 rounded-3xl bg-green-100 text-[#2E7D32] w-fit mx-auto">
            <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2E7D32]">
            Help is on the way
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            Your family has been alerted. Please sit down and stay calm.
          </p>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-gray-200 text-left space-y-3">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Remember
            </span>
            <p className="text-xl font-bold text-gray-900">
              You are safe at 42 Shanti Nilayam, Indiranagar.
            </p>
            <p className="text-lg text-gray-700 font-medium">
              Ravi and Priya are on their way to assist you.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              speech.speak(
                "Help is on the way. Your family has been alerted. Please sit down and stay calm. You are safe."
              )
            }
            className="p-4 rounded-2xl bg-white hover:bg-gray-50 active:scale-95 border border-gray-200 text-[#2E7D32] flex items-center justify-center gap-2 font-bold text-lg w-full transition cursor-pointer touch-manipulation shadow-xs"
          >
            <Volume2 className="w-6 h-6" />
            Hear reassurance aloud
          </button>
        </div>
      )}
    </div>
  );
}
