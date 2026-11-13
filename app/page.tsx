import Link from "next/link";
import { Heart, Shield, Sparkles, User, Calendar, MessageSquare, PhoneCall } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between p-6 sm:p-10">
      <div className="max-w-4xl mx-auto w-full pt-6">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-8 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] flex items-center justify-center text-white shadow-sm">
              <Heart className="w-7 h-7 fill-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#1F2937]">
                CareCompanion
              </span>
              <p className="text-xs text-[#4B5563] hidden sm:block">
                Thoughtful routines for Alzheimer&apos;s care
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/caregiver/login"
              className="px-4 py-2 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100 transition"
            >
              Caregiver Sign In
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 sm:py-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-[#2E7D32] text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Designed for Simplicity & Dignity</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2937] tracking-tight leading-tight">
            Gentle daily routines for loved ones with Alzheimer&apos;s
          </h1>
          <p className="mt-4 text-xl text-[#4B5563] leading-relaxed">
            One screen at a time for the patient. Complete monitoring and reassurance for the family.
          </p>

          {/* Two Distinct Mode Cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {/* Patient Mode Card */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#2E7D32] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#2E7D32] mb-4">
                  <User className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-[#1F2937]">
                  Patient Mode
                </h2>
                <p className="mt-2 text-base text-[#4B5563]">
                  Big buttons, spoken tasks, one step at a time, and a one-tap emergency help button.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                    Friction-free Face Recognition login
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                    &quot;What&apos;s Next&quot; hero card with voice
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                    One-tap preset family messages
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/patient/login"
                  className="w-full min-h-[64px] rounded-2xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-xl font-bold shadow-md flex items-center justify-center transition cursor-pointer touch-manipulation"
                >
                  Open Patient Mode
                </Link>
              </div>
            </div>

            {/* Caregiver Mode Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#3B82F6] mb-4">
                  <Shield className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-[#1F2937]">
                  Caregiver Mode
                </h2>
                <p className="mt-2 text-base text-[#4B5563]">
                  Schedule tasks, monitor daily progress in real time, and receive alerts if medicine is missed.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    Live timeline & task status
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    Instant red alert on help press
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    Quick replies to patient messages
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/caregiver"
                  className="w-full min-h-[64px] rounded-2xl bg-[#1F2937] hover:bg-black active:scale-[0.98] text-white text-xl font-bold shadow-md flex items-center justify-center transition cursor-pointer touch-manipulation"
                >
                  Open Caregiver Mode
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Medical disclaimer footer */}
      <footer className="max-w-4xl mx-auto w-full pt-8 pb-4 border-t border-gray-200 text-center text-xs text-gray-500 leading-relaxed">
        <p>
          <strong>Medical Notice:</strong> CareCompanion is a supportive routine and communication tool designed to assist families. It is not a medical device, diagnostic tool, or replacement for professional healthcare providers, prescribed treatments, or local emergency services.
        </p>
        <p className="mt-2">
          &copy; 2026 CareCompanion. Built for accessibility and calm care.
        </p>
      </footer>
    </main>
  );
}
