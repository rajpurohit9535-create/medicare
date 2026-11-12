"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RenderTaskIcon } from "@/components/caregiver/IconPicker";
import { SpeakButton } from "@/components/patient/SpeakButton";
import { formatTaskTime } from "@/lib/time";
import { TaskInstanceItem } from "@/lib/tasks";
import { getDemoTodayInstances } from "@/lib/defaultTasks";
import { Check, Clock, ChevronRight, CheckCircle2, ListTodo } from "lucide-react";
import { speech } from "@/lib/speech";

export default function PatientTodayTimelinePage() {
  const [instances, setInstances] = useState<TaskInstanceItem[]>([]);
  const [displayName, setDisplayName] = useState("Amma");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved state in localStorage if available
    try {
      const match = document.cookie.match(/cc_patient=([^;]+)/);
      if (match) {
        const data = JSON.parse(decodeURIComponent(match[1]));
        if (data.displayName) setDisplayName(data.displayName);
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
  }, []);

  const handleMarkDone = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = instances.map((item) =>
      item.id === id
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

    const target = instances.find((i) => i.id === id);
    if (target?.tasks) {
      speech.speak(`Marked ${target.tasks.title} as done. Well done, ${displayName}.`);
    }
  };

  const doneCount = instances.filter((i) => i.status === "done").length;
  const totalCount = instances.length;

  const spokenAgenda = `Today's routine for ${displayName}. You have completed ${doneCount} of ${totalCount} items. Next is ${
    instances.find((i) => i.status !== "done")?.tasks?.title || "all tasks completed"
  }.`;

  return (
    <div className="py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">
            Today&apos;s Routine
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mt-1">
            {doneCount} of {totalCount} completed
          </p>
        </div>
        <SpeakButton textToSpeak={spokenAgenda} size="lg" />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-3.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-[#2E7D32] h-full transition-all duration-500 rounded-full"
          style={{
            width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {instances.map((instance, index) => {
          const task = instance.tasks;
          if (!task) return null;

          const isDone = instance.status === "done";
          const formattedTime = formatTaskTime(task.time_of_day);

          return (
            <Link
              key={instance.id}
              href={`/patient/task/${instance.id}`}
              className={`block bg-white rounded-3xl p-5 border-2 transition shadow-xs active:scale-[0.99] touch-manipulation cursor-pointer ${
                isDone
                  ? "border-green-200 bg-green-50/20"
                  : "border-gray-200 hover:border-[#2E7D32]"
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-4">
                {/* Left: Icon & Details */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isDone
                        ? "bg-green-100 text-[#2E7D32] border-green-300"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <RenderTaskIcon iconKey={task.icon} className="w-8 h-8" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold font-mono text-gray-500">
                        {formattedTime}
                      </span>
                      {isDone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-[#2E7D32]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Done
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl font-bold mt-0.5 leading-snug ${
                        isDone
                          ? "text-gray-500 line-through decoration-2"
                          : "text-[#1F2937]"
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.caregiver_note && !isDone && (
                      <p className="text-xs sm:text-sm text-blue-700 font-medium mt-1 truncate">
                        {task.caregiver_note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Quick Action or Detail Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isDone ? (
                    <button
                      type="button"
                      onClick={(e) => handleMarkDone(instance.id, e)}
                      className="px-4 py-2.5 rounded-xl bg-green-100 hover:bg-[#2E7D32] active:scale-95 text-[#2E7D32] hover:text-white text-base font-bold transition flex items-center gap-1.5 cursor-pointer touch-manipulation"
                      title="Mark Done"
                    >
                      <Check className="w-5 h-5 stroke-[2.5]" />
                      <span className="hidden sm:inline">Done</span>
                    </button>
                  ) : (
                    <CheckCircle2 className="w-7 h-7 text-[#2E7D32] shrink-0" />
                  )}
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
