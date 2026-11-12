"use client";

import { useState } from "react";
import { IconPicker, RenderTaskIcon } from "./IconPicker";
import { STARTER_TEMPLATES, StarterTemplate } from "@/lib/taskTemplates";
import { formatTaskTime } from "@/lib/time";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Clock,
  Eye,
  Check,
  Volume2,
  Heart,
  Calendar,
} from "lucide-react";

export interface TaskFormData {
  title: string;
  icon: string;
  category: "medicine" | "meal" | "hygiene" | "activity" | "rest" | "social" | "general";
  timeOfDay: string;
  repeatDays: number[]; // 1=Mon..7=Sun
  startDate?: string;
  endDate?: string | null;
  steps: string[];
  caregiverNote: string;
  encouragement: string;
  isActive: boolean;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  patientName?: string;
  isSubmitting?: boolean;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
}

const DAYS_OF_WEEK = [
  { id: 1, label: "Mon", full: "Monday" },
  { id: 2, label: "Tue", full: "Tuesday" },
  { id: 3, label: "Wed", full: "Wednesday" },
  { id: 4, label: "Thu", full: "Thursday" },
  { id: 5, label: "Fri", full: "Friday" },
  { id: 6, label: "Sat", full: "Saturday" },
  { id: 7, label: "Sun", full: "Sunday" },
];

export function TaskForm({
  initialData,
  patientName = "Amma",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || "",
    icon: initialData?.icon || "pill",
    category: initialData?.category || "medicine",
    timeOfDay: initialData?.timeOfDay || "08:00",
    repeatDays: initialData?.repeatDays || [1, 2, 3, 4, 5, 6, 7],
    startDate: initialData?.startDate || new Date().toISOString().split("T")[0],
    endDate: initialData?.endDate || null,
    steps: initialData?.steps || [""],
    caregiverNote: initialData?.caregiverNote || "",
    encouragement: initialData?.encouragement || `You're doing great, ${patientName}.`,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const [stepInput, setStepInput] = useState("");
  const [previewTab, setPreviewTab] = useState<"card" | "steps">("card");

  const handleApplyTemplate = (tpl: StarterTemplate) => {
    setFormData((prev) => ({
      ...prev,
      title: tpl.title,
      icon: tpl.icon,
      category: tpl.category,
      timeOfDay: tpl.time_of_day,
      repeatDays: tpl.repeat_days,
      steps: [...tpl.steps],
      caregiverNote: tpl.caregiver_note,
      encouragement: tpl.encouragement.replace("Amma", patientName),
    }));
  };

  const handleToggleDay = (dayId: number) => {
    setFormData((prev) => {
      const exists = prev.repeatDays.includes(dayId);
      const nextDays = exists
        ? prev.repeatDays.filter((d) => d !== dayId)
        : [...prev.repeatDays, dayId].sort();
      return { ...prev, repeatDays: nextDays };
    });
  };

  const handleSetAllDays = () => {
    setFormData((prev) => ({
      ...prev,
      repeatDays: [1, 2, 3, 4, 5, 6, 7],
    }));
  };

  const handleSetWeekdays = () => {
    setFormData((prev) => ({
      ...prev,
      repeatDays: [1, 2, 3, 4, 5],
    }));
  };

  const handleAddStep = () => {
    if (!stepInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps.filter((s) => s.trim() !== ""), stepInput.trim()],
    }));
    setStepInput("");
  };

  const handleRemoveStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const newSteps = [...prev.steps];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSteps.length) return prev;
      const temp = newSteps[index];
      newSteps[index] = newSteps[targetIndex];
      newSteps[targetIndex] = temp;
      return { ...prev, steps: newSteps };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    await onSubmit({
      ...formData,
      steps: formData.steps.filter((s) => s.trim().length > 0),
    });
  };

  const formattedPreviewTime = formatTaskTime(formData.timeOfDay);
  const validSteps = formData.steps.filter((s) => s.trim().length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Form Fields (7 cols on desktop) */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        {/* Starter Templates Dropdown / Quick Bar */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Starter Templates (Click to fill)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-green-50 active:scale-95 text-xs font-semibold text-gray-700 hover:text-[#2E7D32] border border-gray-200 hover:border-green-300 transition flex items-center gap-1 cursor-pointer touch-manipulation"
              >
                <RenderTaskIcon iconKey={tpl.icon} className="w-3.5 h-3.5" />
                <span>{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. Take morning tablet"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
            />
          </div>

          {/* Time & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Time of Day <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="time"
                  required
                  value={formData.timeOfDay}
                  onChange={(e) =>
                    setFormData({ ...formData, timeOfDay: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base font-semibold focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as TaskFormData["category"],
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base bg-white focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
              >
                <option value="medicine">Medicine (30m missed alert)</option>
                <option value="meal">Meal / Nutrition</option>
                <option value="hygiene">Hygiene / Cleanliness</option>
                <option value="activity">Activity / Exercise</option>
                <option value="rest">Rest / Nap</option>
                <option value="social">Social / Family Call</option>
                <option value="general">General Routine</option>
              </select>
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Choose Task Icon
            </label>
            <IconPicker
              value={formData.icon}
              onChange={(iconKey) => setFormData({ ...formData, icon: iconKey })}
            />
          </div>

          {/* Repeat Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-900">
                Repeat Schedule
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSetAllDays}
                  className="text-[#2E7D32] font-semibold hover:underline"
                >
                  Every day
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleSetWeekdays}
                  className="text-gray-600 font-semibold hover:underline"
                >
                  Weekdays
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = formData.repeatDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleToggleDay(d.id)}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition active:scale-95 cursor-pointer touch-manipulation select-none ${
                      isSelected
                        ? "bg-[#2E7D32] border-[#2E7D32] text-white shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Step-by-Step Instructions
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Keep instructions clear and simple. The patient can view them one by one.
            </p>

            <div className="space-y-2 mb-3">
              {formData.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-gray-400 text-center">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[idx] = e.target.value;
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    placeholder={`e.g. Step ${idx + 1}`}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#2E7D32]"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveStep(idx, "up")}
                      className="p-1.5 text-gray-400 hover:text-gray-700 active:scale-90 cursor-pointer touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === formData.steps.length - 1}
                      onClick={() => handleMoveStep(idx, "down")}
                      className="p-1.5 text-gray-400 hover:text-gray-700 active:scale-90 cursor-pointer touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 active:scale-90 cursor-pointer touch-manipulation"
                      title="Remove step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                placeholder="Type new step and press Add..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#2E7D32]"
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 text-sm font-semibold flex items-center gap-1.5 cursor-pointer touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
          </div>

          {/* Caregiver Note */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Caregiver Note
            </label>
            <input
              type="text"
              value={formData.caregiverNote}
              onChange={(e) =>
                setFormData({ ...formData, caregiverNote: e.target.value })
              }
              placeholder="e.g. Tablet is in the blue Monday pill box on the kitchen counter"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#2E7D32]"
            />
            <p className="mt-1 text-xs text-gray-500">
              Appears in a gentle blue box on the patient&apos;s card.
            </p>
          </div>

          {/* Encouragement Remark */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Encouragement Line
            </label>
            <input
              type="text"
              value={formData.encouragement}
              onChange={(e) =>
                setFormData({ ...formData, encouragement: e.target.value })
              }
              placeholder={`e.g. You're doing great, ${patientName}`}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#2E7D32]"
            />
            <p className="mt-1 text-xs text-gray-500">
              Spoken and shown in calm green below the card.
            </p>
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-sm font-bold text-gray-900">Task Active</span>
              <p className="text-xs text-gray-500">
                Active tasks automatically generate instances on scheduled days.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.isActive ? "bg-[#2E7D32]" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition cursor-pointer touch-manipulation text-center"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="px-6 py-3 rounded-xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-sm font-bold shadow-sm transition cursor-pointer touch-manipulation disabled:opacity-50 text-center"
            >
              {isSubmitting ? "Saving..." : "Save Task Routine"}
            </button>
          </div>
        </form>
      </div>

      {/* Right: Live Patient Preview (5 cols on desktop) */}
      <div className="lg:col-span-5 sticky top-24">
        <div className="bg-[#FAF7F2] rounded-3xl p-5 border-2 border-[#2E7D32]/30 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#2E7D32]" />
              <span className="text-sm font-bold text-gray-800">
                Live Patient View Preview
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-[#2E7D32] font-semibold">
              Updates in Real-Time
            </span>
          </div>

          {/* Patient Card Simulation */}
          <div className="bg-white rounded-3xl p-5 border-2 border-[#2E7D32]/40 shadow-sm space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black bg-green-100 text-[#2E7D32] uppercase">
                Now • {formattedPreviewTime}
              </span>
              <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-[#2E7D32] flex items-center justify-center shadow-xs">
                <Volume2 className="w-5 h-5" />
              </div>
            </div>

            {/* Task Title & Icon */}
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#2E7D32] flex items-center justify-center shrink-0 border border-green-200">
                <RenderTaskIcon iconKey={formData.icon} className="w-8 h-8" />
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-extrabold text-[#1F2937] leading-tight">
                  {formData.title || "Untitled Task"}
                </h3>
                <span className="text-xs font-bold text-[#3B82F6]">
                  {validSteps.length > 0 ? `${validSteps.length} step instructions` : "No extra steps"}
                </span>
              </div>
            </div>

            {/* Step 1 preview */}
            {validSteps.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-0.5">
                  Step 1
                </span>
                <p className="text-base font-bold text-[#1F2937] leading-snug">
                  {validSteps[0]}
                </p>
              </div>
            )}

            {/* Caregiver note preview */}
            {formData.caregiverNote && (
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 font-medium">
                <strong>Note from family:</strong> {formData.caregiverNote}
              </div>
            )}

            {/* Simulated Patient Buttons */}
            <div className="space-y-2 pt-1">
              <div className="min-h-[52px] rounded-xl bg-[#2E7D32] text-white text-lg font-bold flex items-center justify-center gap-2 shadow-sm pointer-events-none">
                <Check className="w-6 h-6 stroke-[3]" />
                Done
              </div>
              <div className="min-h-[46px] rounded-xl bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center gap-2 border border-gray-300 pointer-events-none">
                <Clock className="w-4 h-4" />
                Remind me later
              </div>
            </div>
          </div>

          {/* Encouragement simulation */}
          <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-sm font-bold text-[#2E7D32]">
            <Heart className="w-4 h-4 fill-[#2E7D32]" />
            <span>{formData.encouragement || `You're doing great, ${patientName}.`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

