"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { TaskForm, TaskFormData } from "@/components/caregiver/TaskForm";
import { ArrowLeft, Clock } from "lucide-react";

export default function EditTaskDirectPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTask() {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load task");
        setTask(data.task);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }
    if (taskId) loadTask();
  }, [taskId]);

  const handleSubmit = async (formData: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          icon: formData.icon,
          category: formData.category,
          timeOfDay: formData.timeOfDay,
          repeatDays: formData.repeatDays,
          startDate: formData.startDate,
          endDate: formData.endDate,
          steps: formData.steps,
          caregiverNote: formData.caregiverNote,
          encouragement: formData.encouragement,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save task");

      router.push("/caregiver/tasks");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      alert(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/caregiver/tasks"
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-xs transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Edit Task Routine
            </h1>
            <p className="text-sm text-gray-500">
              Modify schedule, instructions, notes, and view the live patient preview.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32] mb-3" />
            <p className="text-sm font-semibold">Loading task details...</p>
          </div>
        ) : error || !task ? (
          <div className="bg-white rounded-2xl p-8 border border-red-200 text-center">
            <p className="text-red-700 font-bold mb-3">{error || "Task not found"}</p>
            <Link
              href="/caregiver/tasks"
              className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-sm font-bold"
            >
              Back to Tasks
            </Link>
          </div>
        ) : (
          <TaskForm
            initialData={{
              title: task.title,
              icon: task.icon,
              category: task.category,
              timeOfDay: task.time_of_day,
              repeatDays: task.repeat_days,
              startDate: task.start_date,
              endDate: task.end_date,
              steps: task.steps,
              caregiverNote: task.caregiver_note || "",
              encouragement: task.encouragement || "",
              isActive: task.is_active,
            }}
            patientName={task.patients?.display_name || "Amma"}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/caregiver/tasks")}
          />
        )}
      </div>
    </div>
  );
}
