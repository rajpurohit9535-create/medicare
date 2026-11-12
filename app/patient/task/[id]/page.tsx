"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { RenderTaskIcon } from "@/components/caregiver/IconPicker";
import { SpeakButton } from "@/components/patient/SpeakButton";
import { BigButton } from "@/components/ui/BigButton";
import { formatTaskTime } from "@/lib/time";
import { TaskInstanceItem, TaskItem } from "@/lib/tasks";
import { getDemoTodayInstances } from "@/lib/defaultTasks";
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Volume2, Sparkles, Heart } from "lucide-react";
import { speech } from "@/lib/speech";

export default function PatientTaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const instanceId = params.id as string;

  const [instance, setInstance] = useState<TaskInstanceItem | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("cc_today_instances");
      const list: TaskInstanceItem[] = cached
        ? JSON.parse(cached)
        : getDemoTodayInstances();

      const found =
        list.find((i) => i.id === instanceId) ||
        list.find((i) => i.task_id === instanceId) ||
        list[0];

      if (found) {
        setInstance(found);
        setIsDone(found.status === "done");
      }
    } catch {
      const demo = getDemoTodayInstances();
      setInstance(demo[0]);
    }
  }, [instanceId]);

  if (!instance || !instance.tasks) {
    return (
      <div className="py-12 text-center">
        <p className="text-2xl font-bold text-gray-700">Loading routine details...</p>
      </div>
    );
  }

  const task: TaskItem = instance.tasks;
  const steps: string[] = task.steps && task.steps.length > 0 ? task.steps : [task.title];
  const isMultiStep = steps.length > 1;
  const currentStep = steps[currentStepIndex];
  const isFinalStep = currentStepIndex === steps.length - 1;

  const handleNextStep = () => {
    if (!isFinalStep) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      speech.speak(`Step ${nextIdx + 1}: ${steps[nextIdx]}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      speech.speak(`Step ${prevIdx + 1}: ${steps[prevIdx]}`);
    }
  };

  const handleComplete = () => {
    setIsDone(true);
    speech.speak("Well done! You have completed this task.");

    // Update localStorage
    try {
      const cached = localStorage.getItem("cc_today_instances");
      if (cached) {
        const list: TaskInstanceItem[] = JSON.parse(cached);
        const updated = list.map((i) =>
          i.id === instance.id
            ? { ...i, status: "done" as const, completed_at: new Date().toISOString() }
            : i
        );
        localStorage.setItem("cc_today_instances", JSON.stringify(updated));
      }
    } catch {}

    setTimeout(() => {
      router.push("/patient/today");
    }, 1500);
  };

  return (
    <div className="py-2 max-w-xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/patient/today"
          className="p-3 rounded-2xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 active:scale-95 transition flex items-center justify-center min-w-[56px] min-h-[56px] cursor-pointer touch-manipulation shadow-xs"
          aria-label="Back to routine list"
        >
          <ArrowLeft className="w-8 h-8" />
        </Link>
        <span className="text-xl font-mono font-bold text-gray-500">
          {formatTaskTime(task.time_of_day)}
        </span>
      </div>

      {/* Task Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-[#2E7D32]/30 shadow-xs mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-50 text-[#2E7D32] border border-green-200 flex items-center justify-center shrink-0">
            <RenderTaskIcon iconKey={task.icon} className="w-9 h-9" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] leading-tight">
              {task.title}
            </h1>
            {task.caregiver_note && (
              <div className="mt-2 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-sm text-blue-900 font-medium">
                <strong>Note:</strong> {task.caregiver_note}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step by Step Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm uppercase tracking-wider font-extrabold text-[#2E7D32]">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <SpeakButton
            textToSpeak={`Step ${currentStepIndex + 1}: ${currentStep}`}
            size="md"
          />
        </div>

        {/* Current Step Instruction in Large Friendly Text */}
        <div className="p-6 rounded-2xl bg-[#FAF7F2] border-2 border-green-100 min-h-[140px] flex items-center justify-center text-center">
          <p className="text-2xl sm:text-3xl font-bold text-[#1F2937] leading-relaxed">
            {currentStep}
          </p>
        </div>

        {/* Step Progress Dots */}
        {isMultiStep && (
          <div className="flex justify-center items-center gap-2 pt-2">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-3 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? "w-8 bg-[#2E7D32]"
                    : idx < currentStepIndex
                    ? "w-3 bg-green-300"
                    : "w-3 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Navigation / Done Buttons */}
        <div className="pt-4 space-y-3">
          {isFinalStep || isDone ? (
            <BigButton
              variant="primary"
              disabled={isDone}
              onClick={handleComplete}
              className="min-h-[68px] text-2xl"
            >
              <Check className="w-8 h-8 stroke-[3]" />
              {isDone ? "Completed! Well done." : "Done with this task"}
            </BigButton>
          ) : (
            <BigButton
              variant="primary"
              onClick={handleNextStep}
              className="min-h-[64px] text-xl sm:text-2xl"
            >
              Next Step
              <ChevronRight className="w-7 h-7" />
            </BigButton>
          )}

          {isMultiStep && currentStepIndex > 0 && !isDone && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-full min-h-[52px] rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-lg flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Step
            </button>
          )}
        </div>
      </div>

      {/* Encouragement Footer */}
      {task.encouragement && (
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-lg font-bold text-[#2E7D32]">
          <Heart className="w-5 h-5 fill-[#2E7D32]" />
          <span>{task.encouragement}</span>
        </div>
      )}
    </div>
  );
}
