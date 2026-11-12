"use client";

import { useState } from "react";
import { TaskCard } from "@/components/patient/TaskCard";
import { TaskInstanceItem, TaskItem } from "@/lib/tasks";
import { CheckCircle2, Volume2 } from "lucide-react";
import { speech } from "@/lib/speech";

// Sample task instance for initial setup preview
const sampleTask: TaskItem = {
  id: "sample-1",
  patient_id: "22222222-2222-2222-2222-222222222222",
  title: "Take your morning tablet",
  icon: "pill",
  category: "medicine",
  time_of_day: "08:00",
  repeat_days: [1, 2, 3, 4, 5, 6, 7],
  start_date: "2026-01-01",
  end_date: null,
  steps: ["Take the white tablet from the morning box", "Drink a full glass of water"],
  caregiver_note: "Tablet is in the blue Monday pill box on the kitchen counter.",
  encouragement: "You're doing great, Amma.",
  is_active: true,
};

const sampleInstance: TaskInstanceItem = {
  id: "inst-1",
  task_id: "sample-1",
  patient_id: "22222222-2222-2222-2222-222222222222",
  scheduled_for: "2026-11-12T08:00:00.000Z",
  status: "pending",
  snoozed_until: null,
  snooze_count: 0,
  completed_at: null,
  tasks: sampleTask,
};

export default function PatientHomePage() {
  const [taskInstance, setTaskInstance] = useState<TaskInstanceItem | null>(
    sampleInstance
  );
  const [isDoneState, setIsDoneState] = useState(false);

  const handleDone = (id: string) => {
    speech.speak("Well done, Amma. Task completed.");
    setIsDoneState(true);
    setTaskInstance(null);
  };

  const handleSnooze = (id: string) => {
    speech.speak("We will remind you in ten minutes.");
    if (taskInstance) {
      setTaskInstance({
        ...taskInstance,
        snooze_count: (taskInstance.snooze_count || 0) + 1,
        status: "snoozed",
      });
    }
  };

  if (isDoneState || !taskInstance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-24 h-24 rounded-3xl bg-green-100 text-[#2E7D32] flex items-center justify-center mb-6">
          <CheckCircle2 className="w-14 h-14 stroke-[2.5]" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">
          All done for today!
        </h2>
        <p className="text-2xl font-bold text-[#2E7D32] mt-3">
          Well done, Amma.
        </p>
        <button
          type="button"
          onClick={() => speech.speak("All done for today. Well done, Amma.")}
          className="mt-6 p-4 rounded-2xl bg-white border border-gray-200 text-[#2E7D32] flex items-center gap-2 font-bold text-lg shadow-sm"
        >
          <Volume2 className="w-6 h-6" />
          Hear message
        </button>
      </div>
    );
  }

  return (
    <div className="py-2">
      <TaskCard
        instance={taskInstance}
        task={sampleTask}
        displayName="Amma"
        onDone={handleDone}
        onSnooze={handleSnooze}
      />
    </div>
  );
}
