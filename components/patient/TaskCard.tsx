"use client";

import Link from "next/link";
import { RenderTaskIcon } from "@/components/caregiver/IconPicker";
import { SpeakButton } from "./SpeakButton";
import { BigButton } from "@/components/ui/BigButton";
import { formatTaskTime } from "@/lib/time";
import { TaskInstanceItem, TaskItem } from "@/lib/tasks";
import { Check, Clock, ChevronRight, Heart } from "lucide-react";

interface TaskCardProps {
  instance: TaskInstanceItem;
  task: TaskItem;
  displayName?: string;
  nextUp?: TaskInstanceItem;
  onDone: (instanceId: string) => void;
  onSnooze: (instanceId: string) => void;
  isActionLoading?: boolean;
}

export function TaskCard({
  instance,
  task,
  displayName = "Amma",
  nextUp,
  onDone,
  onSnooze,
  isActionLoading = false,
}: TaskCardProps) {
  const formattedTime = formatTaskTime(task.time_of_day);
  const firstStep =
    Array.isArray(task.steps) && task.steps.length > 0 ? task.steps[0] : null;
  const encouragement =
    task.encouragement || `You're doing great, ${displayName}.`;

  const spokenOverview = `Now: ${task.title} at ${formattedTime}. ${
    firstStep ? `Step one: ${firstStep}.` : ""
  } ${task.caregiver_note ? `Note: ${task.caregiver_note}.` : ""}`;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5">
      {/* Hero Task Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#2E7D32]/30 shadow-md">
        {/* Top Tag: Now & Time */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-lg font-black bg-green-100 text-[#2E7D32] uppercase tracking-wide">
            Now • {formattedTime}
          </span>
          <SpeakButton textToSpeak={spokenOverview} size="md" />
        </div>

        {/* Task Title & Icon */}
        <Link
          href={`/patient/task/${instance.id}`}
          className="group block mb-4 hover:opacity-95 transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-50 text-[#2E7D32] flex items-center justify-center shrink-0 border border-green-200">
              <RenderTaskIcon iconKey={task.icon} className="w-9 h-9 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] leading-tight group-hover:text-[#2E7D32] transition">
                {task.title}
              </h2>
              {task.steps && task.steps.length > 1 && (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[#3B82F6] mt-1">
                  View all {task.steps.length} steps <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* First Step if available */}
        {firstStep && (
          <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Step 1
            </span>
            <p className="text-xl sm:text-2xl font-bold text-[#1F2937] leading-snug">
              {firstStep}
            </p>
          </div>
        )}

        {/* Caregiver Note */}
        {task.caregiver_note && (
          <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-base text-blue-900 font-medium">
            <strong>Note from family:</strong> {task.caregiver_note}
          </div>
        )}

        {/* Action Buttons: Exactly Two */}
        <div className="mt-6 flex flex-col gap-3">
          <BigButton
            variant="primary"
            disabled={isActionLoading}
            onClick={() => onDone(instance.id)}
          >
            <Check className="w-8 h-8 stroke-[3]" />
            Done
          </BigButton>

          {/* Offer Remind Me Later only if snooze_count < 3 */}
          {(instance.snooze_count || 0) < 3 ? (
            <BigButton
              variant="secondary"
              disabled={isActionLoading}
              onClick={() => onSnooze(instance.id)}
            >
              <Clock className="w-7 h-7 text-gray-600" />
              Remind me later
            </BigButton>
          ) : (
            <p className="text-sm text-center text-amber-800 font-semibold bg-amber-50 py-2 rounded-xl border border-amber-200">
              Your family has been gently alerted to assist you.
            </p>
          )}
        </div>
      </div>

      {/* Up Next Preview (Only 1 item) */}
      {nextUp && nextUp.tasks && (
        <div className="bg-white/80 rounded-2xl p-4 border border-gray-200 flex items-center justify-between gap-3 text-[#4B5563]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm uppercase font-bold text-gray-500 tracking-wider shrink-0">
              Up Next
            </span>
            <span className="text-lg font-bold text-[#1F2937] truncate">
              {nextUp.tasks.title}
            </span>
            <span className="text-base text-gray-500 shrink-0">
              ({formatTaskTime(nextUp.tasks.time_of_day)})
            </span>
          </div>
          <SpeakButton
            textToSpeak={`Up next is ${nextUp.tasks.title} at ${formatTaskTime(nextUp.tasks.time_of_day)}.`}
            size="sm"
          />
        </div>
      )}

      {/* Encouragement line */}
      <div className="text-center py-2 flex items-center justify-center gap-2 text-xl font-bold text-[#2E7D32]">
        <Heart className="w-6 h-6 fill-[#2E7D32]" />
        <span>{encouragement}</span>
      </div>
    </div>
  );
}

