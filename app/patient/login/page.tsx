"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Volume2, Delete, ArrowRight, Heart } from "lucide-react";
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

  const handleReadAloud = (text: string) => {
    speech.speak(text);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!familyCode.trim() || pin.length < 4) {
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
          familyCode: familyCode.trim(),
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
      router.push("/patient");
      router.refresh();
    } catch {
      const fallback = "That didn't work. Please ask your family to help.";
      setError(fallback);
      speech.speak(fallback);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E5E7EB]">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] mb-3">
          <Heart className="w-10 h-10 fill-[#2E7D32]" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-4xl font-extrabold text-[#1F2937]">Welcome</h1>
          <button
            type="button"
            onClick={() => handleReadAloud("Welcome. Please tap your family code and PIN.")}
            className="p-2 rounded-full hover:bg-gray-100 text-[#2E7D32]"
            aria-label="Read title aloud"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>
        <p className="text-xl text-[#4B5563] mt-2">
          Tap below to open your daily routine.
        </p>
      </div>

      {/* Error alert with TTS */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between gap-3">
          <p className="text-xl font-bold text-amber-900 leading-snug">{error}</p>
          <button
            type="button"
            onClick={() => handleReadAloud(error)}
            className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 shrink-0"
            aria-label="Hear error message"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xl font-bold text-[#1F2937] mb-1">
            Family Code
          </label>
          <button
            type="button"
            onClick={() => setActiveField("code")}
            className={`w-full text-left px-5 py-4 text-2xl font-mono tracking-wider rounded-2xl border-2 transition ${
              activeField === "code"
                ? "border-[#2E7D32] bg-green-50/40 ring-4 ring-[#2E7D32]/20"
                : "border-gray-300 bg-white"
            }`}
          >
            {familyCode || <span className="text-gray-400 font-sans text-xl">e.g. AMMA-4821</span>}
          </button>
        </div>

        <div>
          <label className="block text-xl font-bold text-[#1F2937] mb-1">
            Your PIN
          </label>
          <button
            type="button"
            onClick={() => setActiveField("pin")}
            className={`w-full text-left px-5 py-4 text-3xl font-mono tracking-widest rounded-2xl border-2 transition ${
              activeField === "pin"
                ? "border-[#2E7D32] bg-green-50/40 ring-4 ring-[#2E7D32]/20"
                : "border-gray-300 bg-white"
            }`}
          >
            {pin ? "• ".repeat(pin.length) : <span className="text-gray-400 font-sans text-xl">4-digit PIN</span>}
          </button>
        </div>
      </div>

      {/* Large On-screen Keypad */}
      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-base font-semibold text-gray-600">
            Currently entering:{" "}
            <span className="text-[#2E7D32] font-bold">
              {activeField === "code" ? "Family Code" : "PIN"}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setActiveField(activeField === "code" ? "pin" : "code")}
            className="text-sm font-bold text-[#3B82F6] hover:underline"
          >
            Switch to {activeField === "code" ? "PIN" : "Code"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="min-h-[58px] bg-white rounded-xl text-2xl font-bold text-[#1F2937] border border-gray-300 shadow-sm active:bg-gray-100 flex items-center justify-center transition"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="min-h-[58px] bg-gray-200 hover:bg-gray-300 rounded-xl text-base font-bold text-gray-700 shadow-sm flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress("0")}
            className="min-h-[58px] bg-white rounded-xl text-2xl font-bold text-[#1F2937] border border-gray-300 shadow-sm active:bg-gray-100 flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Delete last digit"
            className="min-h-[58px] bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-700 shadow-sm flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* If entering code, provide quick letter keys if needed, or quick uppercase input */}
        {activeField === "code" && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 text-center">
              Or type code with your keyboard:
            </p>
            <input
              type="text"
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
              placeholder="Type AMMA-4821"
              className="w-full px-4 py-2 text-center text-lg uppercase font-mono border border-gray-300 rounded-xl bg-white"
            />
          </div>
        )}
      </div>

      {/* Primary Action Button: 64px+ height */}
      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleSubmit()}
        className="w-full min-h-[68px] rounded-2xl bg-[#2E7D32] hover:bg-[#256629] text-white text-2xl font-bold shadow-md flex items-center justify-center gap-3 transition disabled:opacity-50"
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
      <div className="mt-6 text-center">
        <p className="text-lg text-gray-500">
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

