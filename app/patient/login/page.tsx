"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Camera,
  Smile,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Volume2,
  RefreshCw,
} from "lucide-react";
import { speech } from "@/lib/speech";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { BiometricConsentModal } from "@/components/auth/BiometricConsentModal";

function PatientFaceLoginForm() {
  const router = useRouter();

  // Modes: "standby" | "scanning" | "enrolling"
  const [mode, setMode] = useState<"standby" | "scanning" | "enrolling">("standby");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);

  useEffect(() => {
    speech.speak("Welcome to CareCompanion. Tap Smile to Sign In with your face.");
  }, []);

  const handleReadAloud = (text: string) => {
    speech.speak(text);
  };

  // 1. LIVE FACE RECOGNITION (1:N IDENTIFICATION)
  const handleStartFaceScan = () => {
    setError(null);
    setStatusMessage(null);
    setMode("scanning");
    speech.speak("Please look at the camera inside the green circle and tap Recognize Me.");
  };

  const handleVerifyProbeFrame = async (probeFrameB64: string) => {
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
        // If no face was enrolled yet, suggest setting up face
        if (data.error === "NO_ENROLLED_PATIENTS") {
          const msg = "No face is registered yet. Tap 'Set Up Face' below to take your picture.";
          setError(msg);
          speech.speak(msg);
          return;
        }

        const errMsg = data.message || "We could not recognize your face. Please hold still in good lighting and try again.";
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
      const errMsg = "Face recognition request failed. Please check your connection.";
      setError(errMsg);
      speech.speak(errMsg);
    }
  };

  // 2. FACE ENROLLMENT (ZERO PIN REQUIRED)
  const handleEnrollFaceFrames = async (framesB64: string[]) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/patient/face/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: "Amma",
          familyCode: "AMMA-4821",
          frames: framesB64,
          consentGiven: true,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        const errMsg = data.message || data.error || "Could not register face. Please try again.";
        setError(errMsg);
        speech.speak(errMsg);
        return;
      }

      const successMsg = `Face enrolled successfully! Welcome, ${data.displayName || "Amma"}!`;
      setStatusMessage(successMsg);
      speech.speak(successMsg);

      setTimeout(() => {
        window.location.href = "/patient";
      }, 900);
    } catch {
      setIsLoading(false);
      setError("Face setup error. Please try again.");
    }
  };

  // 3. ONE-TAP INSTANT DEMO LOGIN FOR TESTING OR BLOCKED WEBCAM
  const handleInstantDemoLogin = () => {
    document.cookie = `cc_patient=${encodeURIComponent(
      JSON.stringify({
        id: "22222222-2222-2222-2222-222222222222",
        displayName: "Amma",
        familyCode: "AMMA-4821",
        authMethod: "face_recognition",
      })
    )}; path=/; max-age=15552000; SameSite=Lax`;

    speech.speak("Welcome back, Amma! Opening your daily routine.");
    window.location.href = "/patient";
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E5E7EB]">
      {/* Biometric Informed Consent Modal */}
      <BiometricConsentModal
        isOpen={isConsentOpen}
        onConsent={() => {
          setIsConsentOpen(false);
          setMode("enrolling");
          speech.speak("Camera ready. Look inside the green circle and tap Capture Face Frames.");
        }}
        onCancel={() => setIsConsentOpen(false)}
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
            onClick={() => handleReadAloud("Welcome. Tap Smile to Sign In with your face.")}
            className="p-2 rounded-full hover:bg-gray-100 text-[#2E7D32] touch-manipulation cursor-pointer"
            aria-label="Read aloud"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>
        <p className="text-lg sm:text-xl text-[#4B5563] mt-1 font-medium">
          {mode === "standby" && "Smile at the camera to open your day."}
          {mode === "scanning" && "Look inside the green circle."}
          {mode === "enrolling" && "Hold still while we register your face."}
        </p>
      </div>

      {/* Error Message with Speech */}
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
          <p className="text-lg sm:text-xl font-extrabold">{statusMessage}</p>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. STANDBY: LARGE "SMILE TO SIGN IN" BUTTON          */}
      {/* ==================================================== */}
      {mode === "standby" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleStartFaceScan}
            className="w-full min-h-[82px] rounded-3xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-2xl sm:text-3xl font-extrabold shadow-lg flex items-center justify-center gap-3.5 transition cursor-pointer touch-manipulation border-2 border-[#2E7D32]"
          >
            <Smile className="w-10 h-10" />
            <span>Smile to Sign In</span>
          </button>

          <p className="text-center text-sm sm:text-base text-gray-500 font-medium pt-1">
            Pure face recognition. No passwords or numbers required.
          </p>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            {/* First-time face enrollment */}
            <button
              type="button"
              onClick={() => setIsConsentOpen(true)}
              className="w-full min-h-[52px] rounded-2xl border-2 border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 text-base font-bold flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
            >
              <Camera className="w-5 h-5 text-gray-500" />
              <span>Set Up New Face Profile</span>
            </button>

            {/* Quick Demo Access for Testing */}
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              className="w-full min-h-[46px] rounded-2xl bg-green-50 border border-green-200 hover:bg-green-100 active:scale-95 text-[#2E7D32] text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
            >
              <Sparkles className="w-4 h-4" />
              <span>Demo: Instant Face Sign In (Amma)</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. SCANNING: LIVE WEBCAM + AUTOMATIC IDENTIFICATION  */}
      {/* ==================================================== */}
      {mode === "scanning" && (
        <div className="space-y-4">
          <FaceCapture
            mode="verify"
            isProcessing={isLoading}
            onCaptureFrame={handleVerifyProbeFrame}
            onCancel={() => {
              setMode("standby");
              speech.speak("Camera cancelled.");
            }}
          />

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode("standby")}
              className="text-sm font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer p-2"
            >
              &larr; Back to Smile Sign In
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. ENROLLING: FIRST-TIME REGISTRATION (ZERO PIN)     */}
      {/* ==================================================== */}
      {mode === "enrolling" && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center text-sm text-blue-900 font-bold">
            Hold steady while we take 3 photos to learn your face.
          </div>

          <FaceCapture
            mode="enroll"
            isProcessing={isLoading}
            onCaptureFrame={(f) => handleEnrollFaceFrames([f, f])}
            onCaptureFrames={handleEnrollFaceFrames}
            onCancel={() => setMode("standby")}
          />
        </div>
      )}
    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center font-bold text-gray-500">Loading Patient Face Login...</div>}>
        <PatientFaceLoginForm />
      </Suspense>
    </div>
  );
}
