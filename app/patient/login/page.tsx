"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Volume2,
  Delete,
  ArrowRight,
  Heart,
  Sparkles,
  Camera,
  Smile,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { speech } from "@/lib/speech";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { BiometricConsentModal } from "@/components/auth/BiometricConsentModal";

function PatientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // View modes: "face_primary" | "face_scanning" | "pin_login" | "first_time_enroll_prompt" | "first_time_enroll_camera"
  const [viewMode, setViewMode] = useState<
    "face_primary" | "face_scanning" | "pin_login" | "first_time_enroll_prompt" | "first_time_enroll_camera"
  >("face_primary");

  const [hasEnrolledFaces, setHasEnrolledFaces] = useState(false);
  const [familyCode, setFamilyCode] = useState("");
  const [pin, setPin] = useState("");
  const [activeField, setActiveField] = useState<"code" | "pin">("code");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedPatientData, setVerifiedPatientData] = useState<{ displayName: string; familyCode: string } | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);

  // Check on load if any enrolled patient faces exist in the system
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/patient/face/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data.hasEnrolledPatients) {
          setHasEnrolledFaces(true);
          setViewMode("face_primary");
        } else {
          setHasEnrolledFaces(false);
          setViewMode("pin_login");
        }
      } catch {
        // Fallback to PIN login on network check error
        setViewMode("pin_login");
      }
    }
    checkStatus();
  }, []);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setFamilyCode(codeParam.toUpperCase());
      setActiveField("pin");
    }
  }, [searchParams]);

  const handleReadAloud = (text: string) => {
    speech.speak(text);
  };

  // ==========================================
  // FACE RECOGNITION LOGIN (SUBSEQUENT VISITS)
  // ==========================================
  const handleStartFaceScan = () => {
    setError(null);
    setStatusMessage(null);
    setViewMode("face_scanning");
    speech.speak("Please look at the camera inside the green circle and tap Recognize Me.");
  };

  const handleFaceProbeCapture = async (probeFrameB64: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/patient/face/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: probeFrameB64 }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.matched) {
        const errMsg = data.message || "We could not recognize your face. Please try again or use your PIN.";
        setError(errMsg);
        speech.speak(errMsg);
        return;
      }

      const welcomeMsg = `Welcome back, ${data.displayName || "Amma"}!`;
      setStatusMessage(welcomeMsg);
      speech.speak(welcomeMsg);

      setTimeout(() => {
        window.location.href = "/patient";
      }, 700);
    } catch {
      setIsLoading(false);
      const errMsg = "Face verification request failed. Please use your PIN.";
      setError(errMsg);
      speech.speak(errMsg);
    }
  };

  // ==========================================
  // PIN LOGIN (FALLBACK & FIRST-TIME)
  // ==========================================
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

  const handlePinSubmit = async (e?: React.FormEvent) => {
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
      // 1. Verify credentials server-side via patient login API
      const res = await fetch("/api/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyCode: cleanCode,
          pin,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        const errorMsg = data.error || "That didn't work. Please ask your family to help.";
        setError(errorMsg);
        speech.speak(errorMsg);
        return;
      }

      setVerifiedPatientData({
        displayName: data.displayName || "Amma",
        familyCode: cleanCode,
      });

      // 2. Check if this specific patient already has face biometrics enrolled
      const statusRes = await fetch("/api/patient/face/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyCode: cleanCode }),
      });
      const statusData = await statusRes.json();

      if (statusData.enrolled) {
        // Already enrolled: go straight to dashboard
        speech.speak(`Welcome back, ${data.displayName || "Amma"}`);
        window.location.href = "/patient";
      } else {
        // Not enrolled: prompt first-time face setup
        setViewMode("first_time_enroll_prompt");
        speech.speak("PIN verified! Would you like to set up easy face login so you don't have to type numbers next time?");
      }
    } catch {
      setIsLoading(false);
      const fallback = "That didn't work. Please ask your family to help.";
      setError(fallback);
      speech.speak(fallback);
    }
  };

  // ==========================================
  // FIRST-TIME FACE ENROLLMENT
  // ==========================================
  const handleEnrollFrames = async (framesB64: string[]) => {
    setError(null);
    setIsLoading(true);

    try {
      const cleanCode = verifiedPatientData?.familyCode || familyCode.trim().toUpperCase();
      const res = await fetch("/api/patient/face/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyCode: cleanCode,
          pin,
          frames: framesB64,
          consentGiven: true,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setError(data.message || data.error || "Face setup did not work. Please try again.");
        speech.speak("Face setup did not work. Please try again or skip to dashboard.");
        return;
      }

      const successMsg = `You're all set, ${data.displayName || "Amma"}! Next time, just smile at the camera.`;
      setStatusMessage(successMsg);
      speech.speak(successMsg);

      setTimeout(() => {
        window.location.href = "/patient";
      }, 1000);
    } catch {
      setIsLoading(false);
      setError("Face enrollment failed. Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "/patient";
      }, 1000);
    }
  };

  const handleSkipEnrollment = () => {
    speech.speak(`Opening your routine, ${verifiedPatientData?.displayName || "Amma"}.`);
    window.location.href = "/patient";
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-[#E5E7EB]">
      {/* Biometric Informed Consent Modal */}
      <BiometricConsentModal
        isOpen={isConsentModalOpen}
        onConsent={() => {
          setConsentGranted(true);
          setIsConsentModalOpen(false);
          setViewMode("first_time_enroll_camera");
          speech.speak("Camera ready. Look at the camera and tap Capture Face Frames.");
        }}
        onCancel={() => setIsConsentModalOpen(false)}
      />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] mb-3">
          <Heart className="w-10 h-10 fill-[#2E7D32]" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">Welcome</h1>
          <button
            type="button"
            onClick={() =>
              handleReadAloud(
                viewMode === "face_primary"
                  ? "Welcome. Tap Smile to Sign In, or use your family code and PIN."
                  : "Welcome. Please follow the instructions on screen."
              )
            }
            className="p-2 rounded-full hover:bg-gray-100 text-[#2E7D32] touch-manipulation cursor-pointer"
            aria-label="Read title aloud"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>
        <p className="text-lg sm:text-xl text-[#4B5563] mt-1">
          {viewMode === "face_primary" && "Sign in with your face or your Family PIN."}
          {viewMode === "face_scanning" && "Look into the camera to open your day."}
          {viewMode === "pin_login" && "Enter your Family Code and PIN."}
          {viewMode === "first_time_enroll_prompt" && "Make logging in easier next time!"}
          {viewMode === "first_time_enroll_camera" && "Smile into the oval to save your face profile."}
        </p>

        {/* Demo Helper Button */}
        {viewMode === "pin_login" && (
          <button
            type="button"
            onClick={handleFillDemo}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-green-50 text-[#2E7D32] border border-green-300 hover:bg-green-100 active:scale-95 transition cursor-pointer touch-manipulation"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fill Demo Code (AMMA-4821 / 1234)</span>
          </button>
        )}
      </div>

      {/* Error Message with Audio */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="text-base sm:text-lg font-bold">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => handleReadAloud(error)}
            className="p-2 rounded-full hover:bg-amber-100 text-amber-800 touch-manipulation cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-green-50 border-2 border-green-300 text-green-900 flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-[#2E7D32] shrink-0" />
          <p className="text-base sm:text-lg font-bold">{statusMessage}</p>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. PRIMARY VIEW: FACE RECOGNITION (SUBSEQUENT VISITS) */}
      {/* ==================================================== */}
      {viewMode === "face_primary" && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={handleStartFaceScan}
            className="w-full min-h-[76px] rounded-3xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-2xl sm:text-3xl font-extrabold shadow-lg flex items-center justify-center gap-3.5 transition cursor-pointer touch-manipulation border-2 border-[#2E7D32]"
          >
            <Smile className="w-9 h-9" />
            <span>Smile to Sign In</span>
          </button>

          <p className="text-center text-sm sm:text-base text-gray-500 font-medium">
            No numbers to memorize. Just look at the camera.
          </p>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setViewMode("pin_login");
                speech.speak("Switched to Family Code and PIN login.");
              }}
              className="w-full min-h-[56px] rounded-2xl border-2 border-gray-300 hover:bg-gray-50 active:scale-95 text-gray-700 text-lg font-bold flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
            >
              <KeyRound className="w-5 h-5 text-gray-500" />
              <span>Or use Family Code &amp; PIN</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. LIVE FACE SCANNING & AUTOMATIC IDENTIFICATION     */}
      {/* ==================================================== */}
      {viewMode === "face_scanning" && (
        <div className="space-y-4">
          <FaceCapture
            mode="verify"
            isProcessing={isLoading}
            onCaptureFrame={handleFaceProbeCapture}
            onCancel={() => {
              setViewMode("face_primary");
              speech.speak("Cancelled face camera.");
            }}
          />

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setViewMode("pin_login");
                speech.speak("Camera cancelled. Please enter your Family Code and PIN.");
              }}
              className="text-sm sm:text-base font-bold text-gray-600 hover:text-black underline cursor-pointer p-2"
            >
              Camera not working? Use Family Code &amp; PIN &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. PIN LOGIN (FALLBACK & FIRST-TIME)                 */}
      {/* ==================================================== */}
      {viewMode === "pin_login" && (
        <div>
          {/* Input Toggle Tabs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveField("code");
                handleReadAloud("Family code field selected. Current value: " + (familyCode || "empty"));
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition touch-manipulation cursor-pointer ${
                activeField === "code"
                  ? "border-[#2E7D32] bg-green-50/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="text-xs sm:text-sm font-bold text-gray-500">1. Family Code</div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-[#1F2937] truncate mt-0.5">
                {familyCode || "TAP HERE"}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveField("pin");
                handleReadAloud("Four digit PIN field selected. Current value: " + (pin.length ? `${pin.length} digits entered` : "empty"));
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition touch-manipulation cursor-pointer ${
                activeField === "pin"
                  ? "border-[#2E7D32] bg-green-50/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="text-xs sm:text-sm font-bold text-gray-500">2. 4-Digit PIN</div>
              <div className="text-xl sm:text-2xl font-black tracking-widest text-[#1F2937] mt-0.5">
                {pin ? "•".repeat(pin.length) : "TAP HERE"}
              </div>
            </button>
          </div>

          {/* Large Tactile Keypad (min 64px touch target) */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="min-h-[64px] rounded-2xl bg-[#FAF7F2] border-2 border-[#E5E7EB] hover:bg-gray-100 active:bg-gray-200 text-3xl font-black text-[#1F2937] shadow-xs active:scale-95 transition flex items-center justify-center touch-manipulation cursor-pointer select-none"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="min-h-[64px] rounded-2xl bg-amber-50 border-2 border-amber-200 hover:bg-amber-100 active:bg-amber-200 text-base font-extrabold text-amber-800 shadow-xs active:scale-95 transition flex items-center justify-center touch-manipulation cursor-pointer select-none"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              className="min-h-[64px] rounded-2xl bg-[#FAF7F2] border-2 border-[#E5E7EB] hover:bg-gray-100 active:bg-gray-200 text-3xl font-black text-[#1F2937] shadow-xs active:scale-95 transition flex items-center justify-center touch-manipulation cursor-pointer select-none"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="min-h-[64px] rounded-2xl bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 active:bg-gray-300 text-gray-700 shadow-xs active:scale-95 transition flex items-center justify-center touch-manipulation cursor-pointer select-none"
              aria-label="Backspace"
            >
              <Delete className="w-8 h-8" />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={isLoading || !familyCode || pin.length < 4}
            onClick={() => handlePinSubmit()}
            className="w-full min-h-[68px] rounded-2xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-2xl font-extrabold shadow-md flex items-center justify-center gap-3 transition cursor-pointer touch-manipulation disabled:opacity-50 select-none border-2 border-[#2E7D32]"
          >
            {isLoading ? "Checking..." : "Open My Day"}
            <ArrowRight className="w-7 h-7" />
          </button>

          {/* Back to Face Login toggle if enrolled */}
          {hasEnrolledFaces && (
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode("face_primary");
                  speech.speak("Switched back to Face Login.");
                }}
                className="inline-flex items-center gap-2 text-base font-bold text-[#2E7D32] hover:underline cursor-pointer p-2"
              >
                <Smile className="w-5 h-5" />
                <span>Switch to Face Recognition Login</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. FIRST-TIME ENROLLMENT PROMPT                      */}
      {/* ==================================================== */}
      {viewMode === "first_time_enroll_prompt" && (
        <div className="space-y-6 text-center py-2">
          <div className="w-20 h-20 rounded-full bg-green-100 text-[#2E7D32] mx-auto flex items-center justify-center shadow-inner">
            <Smile className="w-12 h-12" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
              Hello, {verifiedPatientData?.displayName}!
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-2 leading-relaxed">
              Would you like to set up easy <strong>Face Recognition</strong>? Next time you can just smile at the camera to open your day.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setIsConsentModalOpen(true)}
              className="w-full min-h-[68px] rounded-2xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-xl sm:text-2xl font-bold shadow-md flex items-center justify-center gap-3 transition cursor-pointer touch-manipulation"
            >
              <Camera className="w-7 h-7" />
              <span>Yes, Set Up Face Login</span>
            </button>

            <button
              type="button"
              onClick={handleSkipEnrollment}
              className="w-full min-h-[52px] rounded-2xl border border-gray-300 hover:bg-gray-50 active:scale-95 text-gray-600 text-base font-semibold transition cursor-pointer touch-manipulation"
            >
              Skip and go to dashboard
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. FIRST-TIME ENROLLMENT CAMERA                      */}
      {/* ==================================================== */}
      {viewMode === "first_time_enroll_camera" && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-sm text-blue-900 font-bold">
            Hold still in a bright room. We will take 3 quick pictures to learn your face.
          </div>

          <FaceCapture
            mode="enroll"
            isProcessing={isLoading}
            onCaptureFrame={(f) => handleEnrollFrames([f, f])}
            onCaptureFrames={handleEnrollFrames}
            onCancel={() => setViewMode("first_time_enroll_prompt")}
          />
        </div>
      )}
    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center font-bold text-gray-500">Loading Patient Sign In...</div>}>
        <PatientLoginForm />
      </Suspense>
    </div>
  );
}
