"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Smile,
  Trash2,
  CheckCircle,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function CaregiverSettingsPage() {
  const [patientBioStatus, setPatientBioStatus] = useState<"enrolled" | "not_enrolled">("enrolled");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkPatientStatus() {
      try {
        const res = await fetch("/api/patient/face/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ familyCode: "AMMA-4821" }),
        });
        const data = await res.json();
        setPatientBioStatus(data.enrolled ? "enrolled" : "not_enrolled");
      } catch {}
    }
    checkPatientStatus();
  }, []);

  const handleDeletePatientBiometrics = async () => {
    if (!confirm("Are you sure you want to permanently delete Amma's face recognition template? She will need her 4-digit PIN to sign in.")) {
      return;
    }

    try {
      const res = await fetch("/api/patient/face/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: "22222222-2222-2222-2222-222222222222" }),
      });
      const data = await res.json();
      if (data.success) {
        setPatientBioStatus("not_enrolled");
        setStatusMessage("Patient face biometrics have been revoked and deleted.");
      }
    } catch {
      setError("Failed to delete patient biometric data.");
    }
  };

  const handleSignOut = () => {
    document.cookie = "cc_caregiver=; path=/; max-age=0";
    window.location.href = "/caregiver/login";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/caregiver"
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Caregiver Settings
            </h1>
            <p className="text-sm text-gray-500">
              Traditional email &amp; password account management and linked patient biometric settings.
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2.5 text-sm font-bold text-green-900">
            <CheckCircle className="w-5 h-5 text-[#2E7D32]" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Patient Biometric Status Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                  <Smile className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Patient Face Recognition Login
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      patientBioStatus === "enrolled"
                        ? "bg-green-100 text-[#2E7D32]"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {patientBioStatus === "enrolled" ? "Enrolled & Active" : "Not Enrolled (PIN Only)"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Patient: <strong>Amma (Kamala Sharma)</strong> • OpenCV YuNet + SFace (AES-256-GCM Encrypted)
                  </p>
                </div>
              </div>

              {patientBioStatus === "enrolled" && (
                <button
                  type="button"
                  onClick={handleDeletePatientBiometrics}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revoke Patient Face
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              When enrolled, Amma can smile into her device camera to sign in friction-free without memorizing family codes or PINs.
            </p>
          </div>

          {/* Linked Patient Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900">Linked Patient Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Current patient: <strong className="text-gray-800">Amma (Kamala Sharma)</strong> • Code: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">AMMA-4821</code>
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/caregiver/onboarding"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs text-gray-700 hover:bg-gray-50"
              >
                <Users className="w-4 h-4" />
                Pair Another Patient
              </Link>
            </div>
          </div>

          {/* Caregiver Sign Out */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Sign Out</h3>
              <p className="text-xs text-gray-500">End your caregiver session on this browser.</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
