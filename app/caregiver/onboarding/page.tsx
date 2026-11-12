"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, User, MapPin, Users, KeyRound, Copy, Check, ArrowRight, ShieldCheck } from "lucide-react";

export default function CaregiverOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [livesWith, setLivesWith] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Result state
  const [createdPatient, setCreatedPatient] = useState<{
    displayName: string;
    familyCode: string;
    pin: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Please provide a name for the patient (e.g. 'Amma' or 'Dad').");
      return;
    }
    if (!homeAddress.trim()) {
      setError("Home address is required to help patient orient during confusion.");
      return;
    }
    if (!livesWith.trim()) {
      setError("Please specify who lives with the patient (e.g. 'Ravi (son), Priya (daughter-in-law)').");
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4 to 6 digits.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/patient/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          homeAddress: homeAddress.trim(),
          livesWith: livesWith.trim(),
          pin,
          timezone: "Asia/Kolkata",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create patient profile");
        setIsLoading(false);
        return;
      }

      setCreatedPatient({
        displayName: data.patient.displayName,
        familyCode: data.patient.familyCode,
        pin,
      });
      setStep(2);
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdPatient) return;
    const text = `CareCompanion Login for ${createdPatient.displayName}\nFamily Code: ${createdPatient.familyCode}\nPIN: ${createdPatient.pin}\nLink: ${window.location.origin}/patient/login?code=${createdPatient.familyCode}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] mb-3">
            <Heart className="w-8 h-8 fill-[#2E7D32]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1F2937]">
            {step === 1 ? "Link Patient Profile" : "Patient Profile Ready!"}
          </h1>
          <p className="mt-2 text-base text-[#4B5563]">
            {step === 1
              ? "Set up the patient mode profile so your loved one can navigate their day safely."
              : "Use these credentials to open the patient mode on their tablet or phone."}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E5E7EB]">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-800">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  What should the app call them?
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Amma, Dad, Kamala"
                    className="block w-full pl-11 pr-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This friendly name will appear on their greeting and encouragement cards.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Home Address (for orientation)
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="e.g. 42 Shanti Nilayam, 4th Cross, Indiranagar"
                    className="block w-full pl-11 pr-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Shown on the &quot;Who am I&quot; screen when the patient feels disoriented.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Who lives with them?
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={livesWith}
                    onChange={(e) => setLivesWith(e.target.value)}
                    placeholder="e.g. Ravi (son), Priya (daughter-in-law)"
                    className="block w-full pl-11 pr-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Easy 4-digit PIN for patient login
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="1234"
                    className="block w-full pl-11 pr-3.5 py-3 border border-gray-300 rounded-xl text-xl tracking-widest font-mono focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Choose an easy number like 1234 or a familiar year.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[58px] mt-6 flex justify-center items-center gap-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-lg font-bold shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? "Creating Profile..." : "Create Patient Profile"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-green-50 border border-green-200 text-center">
                <ShieldCheck className="w-12 h-12 text-[#2E7D32] mx-auto mb-2" />
                <h3 className="text-xl font-bold text-[#1F2937]">
                  Profile created for {createdPatient?.displayName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Keep these details safe to link their device anytime.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    Family Code
                  </span>
                  <p className="text-2xl font-mono font-extrabold text-[#2E7D32] mt-1">
                    {createdPatient?.familyCode}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    PIN
                  </span>
                  <p className="text-2xl font-mono font-extrabold text-[#1F2937] mt-1">
                    {createdPatient?.pin}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-semibold flex items-center justify-center gap-2 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      Copied Details to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-gray-500" />
                      Copy Pairing Info & Link
                    </>
                  )}
                </button>

                <a
                  href={`/patient/login?code=${createdPatient?.familyCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-center block transition text-sm"
                >
                  Open Patient Login on this Device (New Tab)
                </a>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push("/caregiver")}
                  className="w-full min-h-[58px] rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-lg font-bold shadow-sm flex items-center justify-center gap-2 transition"
                >
                  Go to Caregiver Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
