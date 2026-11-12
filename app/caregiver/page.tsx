import Link from "next/link";
import { Heart, PlusCircle, CheckCircle, Clock, MessageSquare, Settings, Users, AlertTriangle } from "lucide-react";

export default function CaregiverDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">CareCompanion</span>
              <span className="ml-2 text-xs bg-green-100 text-[#2E7D32] font-semibold px-2 py-0.5 rounded-full">
                Caregiver Mode
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/caregiver/tasks" className="text-gray-600 hover:text-gray-900">
              Tasks
            </Link>
            <Link href="/caregiver/messages" className="text-gray-600 hover:text-gray-900">
              Messages
            </Link>
            <Link href="/caregiver/settings" className="text-gray-600 hover:text-gray-900">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Today&apos;s Care Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live status of daily routine and patient alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/caregiver/tasks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-sm font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Tasks
            </Link>
          </div>
        </div>

        {/* Placeholder cards for Phase 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-semibold">Tasks Done Today</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">0 of 8</p>
            <p className="text-xs text-gray-500 mt-1">Ready for Phase 2 & 6 wiring</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-semibold">Active Alerts</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-green-700">All Clear</p>
            <p className="text-xs text-gray-500 mt-1">No emergency help requests</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-semibold">Patient Mode</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <Link
              href="/patient"
              target="_blank"
              className="text-base font-bold text-[#2E7D32] hover:underline block mt-1"
            >
              Open Patient View &rarr;
            </Link>
            <p className="text-xs text-gray-500 mt-1">Preview Amma&apos;s screen</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Caregiver Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/caregiver/tasks"
              className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col gap-2 transition"
            >
              <Clock className="w-6 h-6 text-[#2E7D32]" />
              <span className="font-bold text-sm text-gray-900">Task Manager</span>
              <span className="text-xs text-gray-500">Edit routines & steps</span>
            </Link>
            <Link
              href="/caregiver/messages"
              className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col gap-2 transition"
            >
              <MessageSquare className="w-6 h-6 text-[#3B82F6]" />
              <span className="font-bold text-sm text-gray-900">Messages</span>
              <span className="text-xs text-gray-500">Preset replies & chat</span>
            </Link>
            <Link
              href="/caregiver/settings"
              className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col gap-2 transition"
            >
              <Settings className="w-6 h-6 text-gray-600" />
              <span className="font-bold text-sm text-gray-900">Settings</span>
              <span className="text-xs text-gray-500">Family & patient profile</span>
            </Link>
            <Link
              href="/caregiver/onboarding"
              className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col gap-2 transition"
            >
              <Users className="w-6 h-6 text-purple-600" />
              <span className="font-bold text-sm text-gray-900">Add Patient</span>
              <span className="text-xs text-gray-500">Link another profile</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

