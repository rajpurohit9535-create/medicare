"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RenderTaskIcon } from "@/components/caregiver/IconPicker";
import { formatTaskTime } from "@/lib/time";
import {
  Heart,
  PlusCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Settings,
  Users,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function CaregiverDashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [patient, setPatient] = useState<{ id: string; display_name: string } | null>(null);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        if (data.tasks) {
          setTasks(data.tasks);
          setPatient(data.patient);
        }

        // Read local instances if any completed
        const cached = localStorage.getItem("cc_today_instances");
        if (cached) {
          const list = JSON.parse(cached);
          const completed = list.filter((i: any) => i.status === "done").length;
          setDoneCount(completed);
        }
      } catch {}
    }
    loadData();
  }, []);

  const totalCount = tasks.length || 11;
  const patientDisplayName = patient?.display_name || "Amma";

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

          <nav className="flex items-center gap-3 sm:gap-4 text-sm font-semibold">
            <Link
              href="/caregiver/tasks"
              className="text-gray-600 hover:text-gray-900 cursor-pointer touch-manipulation"
            >
              Tasks
            </Link>
            <Link
              href="/caregiver/messages"
              className="text-gray-600 hover:text-gray-900 cursor-pointer touch-manipulation"
            >
              Messages
            </Link>
            <Link
              href="/caregiver/settings"
              className="text-gray-600 hover:text-gray-900 cursor-pointer touch-manipulation"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Today&apos;s Care Overview
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-[#2E7D32]">
                {patientDisplayName}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Live status of daily routine and patient alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/caregiver/tasks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256629] active:scale-95 text-white text-sm font-bold shadow-sm transition cursor-pointer touch-manipulation"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Tasks
            </Link>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-sm font-semibold">Tasks Completed Today</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">
              {doneCount} of {totalCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalCount - doneCount} remaining in routine
            </p>
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
              className="text-base font-bold text-[#2E7D32] hover:underline flex items-center gap-1.5 mt-1"
            >
              Open Patient View
              <ExternalLink className="w-4 h-4" />
            </Link>
            <p className="text-xs text-gray-500 mt-1">Preview {patientDisplayName}&apos;s screen</p>
          </div>
        </div>

        {/* Today's Schedule Preview List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Today&apos;s Active Routine ({tasks.length || 11} scheduled items)
            </h2>
            <Link
              href="/caregiver/tasks"
              className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
            >
              Edit all &rarr;
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {tasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                    <RenderTaskIcon iconKey={task.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {task.title}
                    </p>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTaskTime(task.time_of_day)} • {task.category}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/caregiver/tasks/${task.id}`}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Caregiver Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/caregiver/tasks"
              className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col gap-2 transition active:scale-95 cursor-pointer touch-manipulation"
            >
              <Clock className="w-6 h-6 text-[#2E7D32]" />
              <span className="font-bold text-sm text-gray-900">Task Manager</span>
              <span className="text-xs text-gray-500">Edit routines & steps</span>
            </Link>
            <Link
              href="/caregiver/messages"
              className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col gap-2 transition active:scale-95 cursor-pointer touch-manipulation"
            >
              <MessageSquare className="w-6 h-6 text-[#3B82F6]" />
              <span className="font-bold text-sm text-gray-900">Messages</span>
              <span className="text-xs text-gray-500">Preset replies & chat</span>
            </Link>
            <Link
              href="/caregiver/settings"
              className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col gap-2 transition active:scale-95 cursor-pointer touch-manipulation"
            >
              <Settings className="w-6 h-6 text-gray-600" />
              <span className="font-bold text-sm text-gray-900">Settings</span>
              <span className="text-xs text-gray-500">Family & patient profile</span>
            </Link>
            <Link
              href="/caregiver/onboarding"
              className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col gap-2 transition active:scale-95 cursor-pointer touch-manipulation"
            >
              <Users className="w-6 h-6 text-purple-600" />
              <span className="font-bold text-sm text-gray-900">Pair Patient</span>
              <span className="text-xs text-gray-500">Link patient profile</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
