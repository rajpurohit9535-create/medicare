"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Volume2,
  Heart,
  Smile,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Camera,
  Info,
} from "lucide-react";
import { speech } from "@/lib/speech";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { BiometricConsentModal } from "@/components/auth/BiometricConsentModal";

function PatientLoginForm() {
  const router = useRouter();

  // Mode: "checking" | "first_time_capture" | "auth_face"
  const [mode, setMode] = useState<"checking" | "first_time_capture" | "auth_face">("checking");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  // Check on load if face is already enrolled:
  // First time -> ask to capture face ("first_time_capture")
  // From next time -> authenticate face ("auth_face")
  useEffect(() => {
    async function checkFaceEnrollment() {
      try {
        const res = await fetch("/api/patient/face/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();

        if (data.hasEnrolledPatients) {
          setMode("auth_face");
          speech.speak("Welcome back. Look into the camera and tap Verify to sign in.");
        } else {
          setMode("first_time_capture");
          speech.speak(
            "Welcome! First time setup. Please look into the camera to capture and register your face."
          );
        }
      } catch {
        // Fallback to first-time capture
        setMode("first_time_capture");
      }
    }

    checkFaceEnrollment();
  }, []);

  const handleReadAloud = (text: string) => {
    speech.speak(text);
  };

  // ========================================================
  // 1. FIRST TIME: CAPTURE & ENROLL FACE
  // ========================================================
  const handleEnrollFrames = async (framesB64: string[]) => {
    setError(null);
    setStatusMessage(null);
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
        const errMsg =
          data.message ||
          data.error ||
          "Could not capture your face clearly. Please look directly into the camera in good lighting and try again.";
        setError(errMsg);
        speech.speak(errMsg);
        return;
      }

      const successMsg = `Face registered successfully! Welcome, ${data.displayName || "Amma"}!`;
      setStatusMessage(successMsg);
      speech.speak(successMsg);

      setTimeout(() => {
        window.location.href = "/patient";
      }, 900);
    } catch {
      setIsLoading(false);
      const errMsg = "Face registration failed. Please try again.";
      setError(errMsg);
      speech.speak(errMsg);
    }
  };

  // ========================================================
  // 2. FROM NEXT TIME: AUTHENTICATE FACE
  // ========================================================
  const handleFaceProbeCapture = async (probeFrameB64: string) => {
    setError(null);
    setStatusMessage(null);
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
        const errMsg =
          data.message ||
          "Face not recognized. Please face the camera in good lighting and try again.";
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
      const errMsg = "Face verification request failed. Please try again.";
      setError(errMsg);
      speech.speak(errMsg);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-[#E5E7EB]">
      {/* Biometric Informed Consent Modal */}
      <BiometricConsentModal
        isOpen={isConsentModalOpen}
        onConsent={() => setIsConsentModalOpen(false)}
        onCancel={() => setIsConsentModalOpen(false)}
      />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] mb-3">
          <Heart className="w-10 h-10 fill-[#2E7D32]" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">
            {mode === "first_time_capture"
              ? "Set Up Face Login"
              : mode === "auth_face"
              ? "Patient Sign In"
              : "Welcome"}
          </h1>
          <button
            type="button"
            onClick={() =>
              handleReadAloud(
                mode === "first_time_capture"
                  ? "First time setup. Look into the camera and tap Capture Face Frames to register your face."
                  : "Welcome back. Look into the camera and tap Verify and Sign In to open your routine."
              )
            }
            className="p-2 rounded-full hover:bg-gray-100 text-[#2E7D32] touch-manipulation cursor-pointer"
            aria-label="Read instructions aloud"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>

        <p className="text-base sm:text-lg text-[#4B5563] mt-1.5 font-medium">
          {mode === "first_time_capture" &&
            "First time setup: Look into the camera to capture and register your face."}
          {mode === "auth_face" &&
            "Look into the camera to authenticate with your face."}
          {mode === "checking" && "Checking face recognition status..."}
        </p>
      </div>

      {/* Error Message with Audio */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="text-base font-bold">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => handleReadAloud(error)}
            className="p-2 rounded-full hover:bg-amber-100 text-amber-800 touch-manipulation cursor-pointer shrink-0"
            aria-label="Read error aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-green-50 border-2 border-green-300 text-green-900 flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-[#2E7D32] shrink-0" />
          <p className="text-base sm:text-lg font-bold">{statusMessage}</p>
        </div>
      )}

      {/* Loading Spinner during initial check */}
      {mode === "checking" && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2E7D32]" />
          <p className="text-base font-medium">Initializing camera &amp; biometric scanner...</p>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. FIRST TIME: ASK TO CAPTURE FACE                   */}
      {/* ==================================================== */}
      {mode === "first_time_capture" && (
        <div className="space-y-4">
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl text-center text-sm text-[#2E7D32] font-bold">
            Hold steady in good light. We will capture your face to create your profile.
          </div>

          <FaceCapture
            mode="enroll"
            isProcessing={isLoading}
            onCaptureFrame={(f) => handleEnrollFrames([f, f])}
            onCaptureFrames={handleEnrollFrames}
          />

          <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
            <button
              type="button"
              onClick={() => setIsConsentModalOpen(true)}
              className="inline-flex items-center gap-1 hover:text-gray-800 underline cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Biometric privacy notice</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. FROM NEXT TIME: AUTHENTICATE FACE                 */}
      {/* ==================================================== */}
      {mode === "auth_face" && (
        <div className="space-y-4">
          <FaceCapture
            mode="verify"
            isProcessing={isLoading}
            onCaptureFrame={handleFaceProbeCapture}
          />

          {/* Re-capture face option if someone needs to update/register a new face */}
          <div className="pt-3 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                setMode("first_time_capture");
                setError(null);
                speech.speak("Switched to capture new face setup.");
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#2E7D32] underline cursor-pointer p-1"
            >
              <Camera className="w-4 h-4" />
              <span>Capture / Register New Face</span>
            </button>
          </div>
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
