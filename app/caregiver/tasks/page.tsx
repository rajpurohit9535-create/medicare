"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TaskForm, TaskFormData } from "@/components/caregiver/TaskForm";
import { RenderTaskIcon } from "@/components/caregiver/IconPicker";
import { STARTER_TEMPLATES, StarterTemplate } from "@/lib/taskTemplates";
import { formatTaskTime } from "@/lib/time";
import {
  ArrowLeft,
  Plus,
  Clock,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  X,
  ExternalLink,
} from "lucide-react";

interface TaskRecord {
  id: string;
  patient_id: string;
  title: string;
  icon: string;
  category: "medicine" | "meal" | "hygiene" | "activity" | "rest" | "social" | "general";
  time_of_day: string;
  repeat_days: number[];
  start_date: string;
  end_date: string | null;
  steps: string[];
  caregiver_note: string | null;
  encouragement: string | null;
  is_active: boolean;
}

const DAY_LABELS: Record<number, string> = {
  1: "M",
  2: "Tu",
  3: "W",
  4: "Th",
  5: "F",
  6: "Sa",
  7: "Su",
};

export default function CaregiverTasksPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [patient, setPatient] = useState<{ id: string; display_name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form mode: null (list view) | "new" | TaskRecord (editing)
  const [formMode, setFormMode] = useState<"new" | TaskRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load tasks");
      }
      setTasks(data.tasks || []);
      setPatient(data.patient || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading tasks";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleActive = async (task: TaskRecord) => {
    const nextStatus = !task.is_active;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_active: nextStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_active: !nextStatus } : t))
      );
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove the task "${title}"?`)) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete task");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      alert(msg);
      fetchTasks();
    }
  };

  const handleFormSubmit = async (formData: TaskFormData) => {
    if (!patient) return;
    setIsSubmitting(true);

    try {
      if (formMode === "new") {
        // Create new task
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: patient.id,
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
        if (!res.ok) throw new Error(data.error || "Failed to create task");
      } else if (typeof formMode === "object" && formMode !== null) {
        // Update existing task
        const res = await fetch(`/api/tasks/${formMode.id}`, {
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
        if (!res.ok) throw new Error(data.error || "Failed to update task");
      }

      setFormMode(null);
      await fetchTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving task";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAddTemplate = (tpl: StarterTemplate) => {
    setFormMode({
      id: "new-from-tpl",
      patient_id: patient?.id || "",
      title: tpl.title,
      icon: tpl.icon,
      category: tpl.category,
      time_of_day: tpl.time_of_day,
      repeat_days: tpl.repeat_days,
      start_date: new Date().toISOString().split("T")[0],
      end_date: null,
      steps: tpl.steps,
      caregiver_note: tpl.caregiver_note,
      encouragement: tpl.encouragement.replace("Amma", patient?.display_name || "Amma"),
      is_active: true,
    });
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterCategory === "all") return true;
    return t.category === filterCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/caregiver"
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-xs transition"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  Task Management
                </h1>
                {patient && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-[#2E7D32]">
                    for {patient.display_name}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Schedule daily routines, instructions, and notes that appear on the patient app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {formMode === null ? (
              <button
                type="button"
                onClick={() => setFormMode("new")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-sm font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add New Task
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFormMode(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition"
              >
                <X className="w-4 h-4" />
                Back to Task List
              </button>
            )}
          </div>
        </div>

        {/* If in Add/Edit Form Mode */}
        {formMode !== null ? (
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {formMode === "new" || formMode.id === "new-from-tpl"
                  ? "Create Daily Task Routine"
                  : `Edit Task: ${formMode.title}`}
              </h2>
            </div>
            <TaskForm
              initialData={
                formMode === "new"
                  ? undefined
                  : {
                      title: formMode.title,
                      icon: formMode.icon,
                      category: formMode.category,
                      timeOfDay: formMode.time_of_day,
                      repeatDays: formMode.repeat_days,
                      startDate: formMode.start_date,
                      endDate: formMode.end_date,
                      steps: formMode.steps,
                      caregiverNote: formMode.caregiver_note || "",
                      encouragement: formMode.encouragement || "",
                      isActive: formMode.is_active,
                    }
              }
              patientName={patient?.display_name || "Amma"}
              isSubmitting={isSubmitting}
              onSubmit={handleFormSubmit}
              onCancel={() => setFormMode(null)}
            />
          </div>
        ) : (
          /* List Mode */
          <div className="space-y-6">
            {/* Starter Templates Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  One-Click Starter Templates
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STARTER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleQuickAddTemplate(tpl)}
                    className="p-3 rounded-xl border border-gray-200 hover:border-green-300 bg-gray-50/60 hover:bg-green-50 text-left transition flex items-start gap-2.5 group"
                  >
                    <div className="p-2 rounded-lg bg-white group-hover:bg-[#2E7D32] group-hover:text-white text-gray-700 shadow-2xs shrink-0 transition">
                      <RenderTaskIcon iconKey={tpl.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#2E7D32] truncate">
                        {tpl.title}
                      </p>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {formatTaskTime(tpl.time_of_day)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              <span className="text-gray-500 mr-1">Filter:</span>
              {[
                { id: "all", label: "All Tasks" },
                { id: "medicine", label: "Medicine" },
                { id: "meal", label: "Meals" },
                { id: "hygiene", label: "Hygiene" },
                { id: "activity", label: "Activity" },
                { id: "rest", label: "Rest" },
                { id: "social", label: "Social" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full transition ${
                    filterCategory === cat.id
                      ? "bg-[#2E7D32] text-white shadow-2xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Task List / Table */}
            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32] mb-3" />
                <p className="text-sm font-semibold">Loading daily tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800">No tasks found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  {filterCategory !== "all"
                    ? `No tasks match the category "${filterCategory}".`
                    : "No routine tasks created yet. Click above to add from a template or create a custom task."}
                </p>
                <button
                  type="button"
                  onClick={() => setFormMode("new")}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold"
                >
                  Create First Task
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => {
                    const formattedTime = formatTaskTime(task.time_of_day);
                    return (
                      <div
                        key={task.id}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-gray-50/80 ${
                          !task.is_active ? "opacity-60 bg-gray-50/40" : ""
                        }`}
                      >
                        {/* Left: Time & Icon & Title */}
                        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                          {/* Time badge */}
                          <div className="w-20 text-left shrink-0">
                            <span className="text-base font-extrabold text-gray-900 block font-mono">
                              {formattedTime}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              {task.category}
                            </span>
                          </div>

                          {/* Task Icon */}
                          <div className="w-12 h-12 rounded-xl bg-green-50 text-[#2E7D32] border border-green-200 flex items-center justify-center shrink-0">
                            <RenderTaskIcon iconKey={task.icon} className="w-6 h-6" />
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-gray-900 truncate">
                                {task.title}
                              </h4>
                              {!task.is_active && (
                                <span className="text-[10px] font-bold uppercase bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                                  Paused
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                              {/* Repeat days pills */}
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                                  <span
                                    key={d}
                                    className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                      task.repeat_days?.includes(d)
                                        ? "bg-[#2E7D32] text-white"
                                        : "bg-gray-100 text-gray-400"
                                    }`}
                                  >
                                    {DAY_LABELS[d]}
                                  </span>
                                ))}
                              </div>

                              {task.steps && task.steps.length > 0 && (
                                <span>• {task.steps.length} step(s)</span>
                              )}

                              {task.caregiver_note && (
                                <span className="text-blue-700 max-w-[200px] truncate">
                                  • Note: {task.caregiver_note}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Active Toggle & Actions */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          {/* Active toggle */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 hidden sm:inline">
                              {task.is_active ? "Active" : "Paused"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(task)}
                              title={task.is_active ? "Pause task" : "Activate task"}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                task.is_active ? "bg-[#2E7D32]" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  task.is_active ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setFormMode(task)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                            title="Edit task & view live preview"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
