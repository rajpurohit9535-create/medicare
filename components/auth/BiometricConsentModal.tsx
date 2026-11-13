"use client";

import { Shield, Lock, EyeOff, Check, Volume2 } from "lucide-react";
import { speech } from "@/lib/speech";

interface BiometricConsentModalProps {
  isOpen: boolean;
  onConsent: () => void;
  onCancel: () => void;
}

export function BiometricConsentModal({
  isOpen,
  onConsent,
  onCancel,
}: BiometricConsentModalProps) {
  if (!isOpen) return null;

  const handleReadAloud = () => {
    speech.speak(
      "Privacy Notice: CareCompanion turns your camera picture into numbers so you can sign in with your face. No photos are stored, and your template is encrypted safely. You or your family can turn this off at any time."
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#2E7D32] flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <button
            type="button"
            onClick={handleReadAloud}
            className="p-2.5 rounded-full hover:bg-gray-100 text-[#2E7D32] touch-manipulation cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            aria-label="Listen to privacy policy"
          >
            <Volume2 className="w-5 h-5" />
            <span>Read Aloud</span>
          </button>
        </div>

        <h3 className="text-2xl font-extrabold text-[#1F2937]">
          Patient Face Privacy &amp; Consent
        </h3>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          CareCompanion uses OpenCV YuNet &amp; SFace computer vision so you can sign in with your smile without typing numbers.
        </p>

        <div className="mt-5 space-y-3.5 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <EyeOff className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">No Photos Are Kept</p>
              <p className="text-xs text-gray-500 mt-0.5">
                The camera only takes numbers (face shape), not pictures. Your camera photo is immediately thrown away.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <Lock className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">Encrypted with AES-256-GCM</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Your face template is locked with bank-grade encryption keys kept securely on the server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <Check className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">Caregiver Managed</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Your caregiver can easily reset or update your face record anytime in Settings.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onConsent}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white font-bold text-base transition shadow-sm cursor-pointer touch-manipulation"
          >
            I Agree &amp; Continue
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-gray-300 hover:bg-gray-50 active:scale-95 text-gray-700 font-semibold text-sm transition cursor-pointer touch-manipulation"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
