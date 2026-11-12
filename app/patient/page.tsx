"use client";

import { useState, useEffect } from "react";
import { TaskCard } from "@/components/patient/TaskCard";
import { TaskInstanceItem, getCurrentTask } from "@/lib/tasks";
import { getDemoTodayInstances } from "@/lib/defaultTasks";
import { CheckCircle2, Volume2, Sparkles, Calendar } from "lucide-react";
import { speech } from "@/lib/speech";
import Link from "next/link";

export default function PatientHomePage() {
  const [instances, setInstances] = useState<TaskInstanceItem[]>([]);
  const [patientName, setPatientName] = useState("Amma");
  const [isLoading, setIsLoading] = useState(true);

  const loadInstances = () => {
    try {
      const match = document.cookie.match(/cc_patient=([^;]+)/);
      if (match) {
        const data = JSON.parse(decodeURIComponent(match[1]));
        if (data.displayName) setPatientName(data.displayName);
      }

      const cached = localStorage.getItem("cc_today_instances");
      if (cached) {
        setInstances(JSON.parse(cached));
      } else {
        const demo = getDemoTodayInstances();
        setInstances(demo);
        localStorage.setItem("cc_today_instances", JSON.stringify(demo));
      }
    } catch {
      setInstances(getDemoTodayInstances());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, []);

  const handleDone = (instanceId: string) => {
    const updated = instances.map((item) =>
      item.id === instanceId
        ? {
            ...item,
            status: "done" as const,
            completed_at: new Date().toISOString(),
          }
        : item
    );
    setInstances(updated);
    try {
      localStorage.setItem("cc_today_instances", JSON.stringify(updated));
    } catch {}

    const target = instances.find((i) => i.id === instanceId);
    speech.speak(`Well done, ${patientName}. Task completed.`);
  };

  const handleSnooze = (instanceId: string) => {
    speech.speak("We will remind you in ten minutes.");
    const updated = instances.map((item) =>
      item.id === instanceId
        ? {
            ...item,
            snooze_count: (item.snooze_count || 0) + 1,
            status: "snoozed" as const,
            snoozed_until: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          }
        : item
    );
    setInstances(updated);
    try {
      localStorage.setItem("cc_today_instances", JSON.stringify(updated));
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-2xl font-bold text-gray-700">Opening your day...</p>
      </div>
    );
  }

  // Evaluate current task based on the routine
  const currentTaskResult = getCurrentTask(instances);

  if (currentTaskResult.type === "all_done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4">
        <div className="w-24 h-24 rounded-3xl bg-green-100 text-[#2E7D32] flex items-center justify-center mb-6">
          <CheckCircle2 className="w-14 h-14 stroke-[2.5]" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">
          All done for today!
        </h2>
        <p className="text-2xl font-bold text-[#2E7D32] mt-3">
          Well done, {patientName}.
        </p>
        <p className="text-lg text-gray-600 mt-2 max-w-sm">
          You have completed all scheduled tasks for today. Relax and enjoy your day.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={() =>
              speech.speak(`All done for today. Well done, ${patientName}. You completed everything.`)
            }
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 active:scale-95 border border-gray-200 text-[#2E7D32] flex items-center justify-center gap-2 font-bold text-lg shadow-sm transition cursor-pointer touch-manipulation"
          >
            <Volume2 className="w-6 h-6" />
            Hear message
          </button>
          <Link
            href="/patient/today"
            className="px-6 py-3.5 rounded-2xl bg-[#2E7D32] hover:bg-[#256629] active:scale-95 text-white flex items-center justify-center gap-2 font-bold text-lg shadow-sm transition cursor-pointer touch-manipulation"
          >
            <Calendar className="w-6 h-6" />
            Review Today&apos;s List
          </Link>
        </div>
      </div>
    );
  }

  // If a task is due or active
  if (currentTaskResult.type === "due") {
    const { instance, task, nextUp } = currentTaskResult;
    return (
      <div className="py-2">
        <TaskCard
          instance={instance}
          task={task}
          displayName={patientName}
          nextUp={nextUp}
          onDone={handleDone}
          onSnooze={handleSnooze}
        />
      </div>
    );
  }

  // If next task is upcoming
  if (currentTaskResult.type === "upcoming") {
    const { nextTask, task } = currentTaskResult;
    return (
      <div className="py-2">
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-blue-50 text-[#3B82F6] border border-blue-200">
            <Sparkles className="w-4 h-4" />
            Nothing due right now. Up next at {task.time_of_day}:
          </span>
        </div>
        <TaskCard
          instance={nextTask}
          task={task}
          displayName={patientName}
          onDone={handleDone}
          onSnooze={handleSnooze}
        />
      </div>
    );
  }

  // Fallback if empty
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <Calendar className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-[#1F2937]">No tasks scheduled yet</h2>
      <p className="text-gray-500 mt-2">Your family will add your daily routine here.</p>
    </div>
  );
}
