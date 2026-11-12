"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Volume2, Delete, ArrowRight, Heart, Sparkles } from "lucide-react";
import { speech } from "@/lib/speech";

function PatientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [familyCode, setFamilyCode] = useState("");
  const [pin, setPin] = useState("");
  const [activeField, setActiveField] = useState<"code" | "pin">("code");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setFamilyCode(codeParam.toUpperCase());
      setActiveField("pin");
    }
  }, [searchParams]);

  const handleKeypadPress = (val: string) => {
    setError(null);
    if (activeField === "code") {
      setFamilyCode((prev) => (prev + val).toUpperCase());
    } else {
      if (pin.length < 6) {
        setPin((prev) => prev + val);
      }
    }
  };

  const handleBackspace = () => {
    setError(null);
    if (activeField === "code") {
      setFamilyCode((prev) => prev.slice(0, -1));
    } else {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setError(null);
    if (activeField === "code") {
      setFamilyCode("");
    } else {
      setPin("");
    }
  };

  const handleFillDemo = () => {
    setError(null);
    setFamilyCode("AMMA-4821");
    setPin("1234");
    setActiveField("pin");
    speech.speak("Filled demo code AMMA 4821 and PIN 1234. Tap Open to begin.");
  };

  const handleReadAloud = (text: string) => {
    speech.speak(text);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanCode = familyCode.trim().toUpperCase();

    if (!cleanCode || pin.length < 4) {
      const msg = "Please enter your family code and 4-digit PIN.";
      setError(msg);
      speech.speak(msg);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyCode: cleanCode,
          pin,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg =
          data.error || "That didn't work. Please ask your family to help.";
        setError(errorMsg);
        speech.speak(errorMsg);
        setIsLoading(false);
        return;
      }

      speech.speak(`Welcome back, ${data.displayName || "Amma"}`);
      // Redirect to patient home screen
      window.location.href = "/patient";
    } catch {
      const fallback = "That didn't work. Please ask your family to help.";
      setError(fallback);
      speech.speak(fallback);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-[#E5E7EB]">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] mb-3">
          <Heart className="w-10 h-10 fill-[#2E7D32]" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">Welcome</h1>
          <button
            type="button"
            onClick={() => handleReadAloud("Welcome. Please enter your family code and PIN.")}
            className="p-2 rounded-full hover:bg-gray-100 text-[#2E7D32] touch-manipulation cursor-pointer"
            aria-label="Read title aloud"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>
        <p className="text-lg sm:text-xl text-[#4B5563] mt-1">
          Tap below to open your daily routine.
        </p>

        {/* Quick Demo Helper Button */}
        <button
          type="button"
          onClick={handleFillDemo}
          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-green-50 text-[#2E7D32] border border-green-300 hover:bg-green-100 active:scale-95 transition cursor-pointer touch-manipulation"
        >
          <Sparkles className="w-4 h-4 text-[#2E7D32]" />
          <span>Quick Demo: Fill AMMA-4821 & 1234</span>
        </button>
      </div>

      {/* Error alert with TTS */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between gap-3">
          <p className="text-lg sm:text-xl font-bold text-amber-900 leading-snug">{error}</p>
          <button
            type="button"
            onClick={() => handleReadAloud(error)}
            className="p-2.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 shrink-0 cursor-pointer touch-manipulation"
            aria-label="Hear error message"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-4 mb-5">
        <div>
          <label className="block text-lg sm:text-xl font-bold text-[#1F2937] mb-1">
            Family Code
          </label>
          <input
            type="text"
            value={familyCode}
            onFocus={() => setActiveField("code")}
            onChange={(e) => {
              setError(null);
              setFamilyCode(e.target.value.toUpperCase());
            }}
            placeholder="e.g. AMMA-4821"
            className={`w-full px-5 py-3.5 text-xl sm:text-2xl font-mono uppercase tracking-wider rounded-2xl border-2 transition outline-none cursor-pointer ${
              activeField === "code"
                ? "border-[#2E7D32] bg-green-50/40 ring-4 ring-[#2E7D32]/20"
                : "border-gray-300 bg-white"
            }`}
          />
        </div>

        <div>
          <label className="block text-lg sm:text-xl font-bold text-[#1F2937] mb-1">
            Your PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onFocus={() => setActiveField("pin")}
            onChange={(e) => {
              setError(null);
              setPin(e.target.value.replace(/\D/g, ""));
            }}
            placeholder="••••"
            className={`w-full px-5 py-3.5 text-2xl sm:text-3xl font-mono tracking-widest rounded-2xl border-2 transition outline-none cursor-pointer ${
              activeField === "pin"
                ? "border-[#2E7D32] bg-green-50/40 ring-4 ring-[#2E7D32]/20"
                : "border-gray-300 bg-white"
            }`}
          />
        </div>
      </div>

      {/* Large On-screen Keypad */}
      <div className="bg-[#FAF7F2] p-3 sm:p-4 rounded-2xl border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-sm font-semibold text-gray-600">
            Keypad entering:{" "}
            <span className="text-[#2E7D32] font-bold">
              {activeField === "code" ? "Family Code" : "PIN"}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setActiveField(activeField === "code" ? "pin" : "code")}
            className="text-xs sm:text-sm font-bold text-[#3B82F6] hover:underline cursor-pointer touch-manipulation"
          >
            Switch to {activeField === "code" ? "PIN" : "Code"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="min-h-[58px] sm:min-h-[64px] bg-white rounded-xl text-2xl font-bold text-[#1F2937] border border-gray-300 shadow-xs active:scale-95 active:bg-gray-100 flex items-center justify-center transition cursor-pointer touch-manipulation select-none"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="min-h-[58px] sm:min-h-[64px] bg-gray-200 hover:bg-gray-300 active:scale-95 rounded-xl text-base font-bold text-gray-700 shadow-xs flex items-center justify-center cursor-pointer touch-manipulation select-none"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress("0")}
            className="min-h-[58px] sm:min-h-[64px] bg-white rounded-xl text-2xl font-bold text-[#1F2937] border border-gray-300 shadow-xs active:scale-95 active:bg-gray-100 flex items-center justify-center cursor-pointer touch-manipulation select-none"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Delete last digit"
            className="min-h-[58px] sm:min-h-[64px] bg-gray-200 hover:bg-gray-300 active:scale-95 rounded-xl text-gray-700 shadow-xs flex items-center justify-center cursor-pointer touch-manipulation select-none"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Primary Action Button: 64px+ height, fully responsive */}
      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleSubmit()}
        className="w-full min-h-[68px] rounded-2xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-2xl font-bold shadow-md flex items-center justify-center gap-3 transition cursor-pointer touch-manipulation disabled:opacity-50 select-none"
      >
        {isLoading ? (
          "Opening..."
        ) : (
          <>
            Open
            <ArrowRight className="w-7 h-7" />
          </>
        )}
      </button>

      {/* Assistance footer */}
      <div className="mt-5 text-center">
        <p className="text-base text-gray-500">
          Need help? Ask your family to scan your setup code.
        </p>
      </div>
    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-8">
      <Suspense fallback={<div className="text-2xl text-gray-600">Loading...</div>}>
        <PatientLoginForm />
      </Suspense>
    </div>
  );
}
