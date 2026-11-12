import { SupabaseClient } from "@supabase/supabase-js";
import { getPostgresDayOfWeek } from "./time";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export interface TaskItem {
  id: string;
  patient_id: string;
  title: string;
  icon: string;
  category: string;
  time_of_day: string;
  repeat_days: number[];
  start_date: string;
  end_date: string | null;
  steps: string[];
  caregiver_note: string | null;
  encouragement: string | null;
  is_active: boolean;
}

export interface TaskInstanceItem {
  id: string;
  task_id: string;
  patient_id: string;
  scheduled_for: string;
  status: "pending" | "done" | "snoozed" | "missed";
  snoozed_until: string | null;
  snooze_count: number;
  completed_at: string | null;
  tasks?: TaskItem;
}

/**
 * Ensures today's task_instances exist for all active tasks of this patient
 */
export async function ensureTodayInstances(
  supabase: SupabaseClient,
  patientId: string,
  timezone: string = "Asia/Kolkata"
): Promise<void> {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const todayStr = format(zonedNow, "yyyy-MM-dd");
  const currentDayOfWeek = getPostgresDayOfWeek(zonedNow);

  // 1. Fetch active tasks for this patient
  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("patient_id", patientId)
    .eq("is_active", true);

  if (taskError || !tasks || tasks.length === 0) {
    return;
  }

  // 2. Filter tasks that repeat today and are within start/end dates
  const eligibleTasks = tasks.filter((t: TaskItem) => {
    // Check repeat day
    if (!t.repeat_days || !t.repeat_days.includes(currentDayOfWeek)) {
      return false;
    }
    // Check start date
    if (t.start_date && t.start_date > todayStr) {
      return false;
    }
    // Check end date
    if (t.end_date && t.end_date < todayStr) {
      return false;
    }
    return true;
  });

  if (eligibleTasks.length === 0) return;

  // 3. Prepare instance rows
  for (const t of eligibleTasks) {
    // Combine todayStr with t.time_of_day in patient's timezone
    const scheduledDateTimeStr = `${todayStr}T${t.time_of_day}`;
    // Convert to ISO with timezone
    const scheduledUtc = fromZonedTime(scheduledDateTimeStr, timezone).toISOString();

    // Insert ignore duplicates on (task_id, scheduled_for)
    await supabase.from("task_instances").upsert(
      {
        task_id: t.id,
        patient_id: patientId,
        scheduled_for: scheduledUtc,
        status: "pending",
      },
      {
        onConflict: "task_id,scheduled_for",
        ignoreDuplicates: true,
      }
    );
  }
}

export type CurrentTaskResult =
  | { type: "due"; instance: TaskInstanceItem; task: TaskItem; nextUp?: TaskInstanceItem }
  | { type: "upcoming"; nextTask: TaskInstanceItem; task: TaskItem }
  | { type: "all_done"; totalCount: number }
  | { type: "empty" };

/**
 * Evaluates what the patient sees on the What's Next home screen:
 * 1. The first instance where status = 'pending' and scheduled_for <= now, or status = 'snoozed' and snoozed_until <= now.
 * 2. If none is due yet, the next upcoming pending task.
 * 3. If all tasks are done, all_done.
 */
export function getCurrentTask(instances: TaskInstanceItem[]): CurrentTaskResult {
  if (!instances || instances.length === 0) {
    return { type: "empty" };
  }

  // Sort ascending by scheduled_for
  const sorted = [...instances].sort(
    (a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
  );

  const now = new Date();

  // Find due task: pending & scheduled_for <= now, or snoozed & snoozed_until <= now
  const dueIndex = sorted.findIndex((item) => {
    if (item.status === "pending") {
      return new Date(item.scheduled_for).getTime() <= now.getTime();
    }
    if (item.status === "snoozed" && item.snoozed_until) {
      return new Date(item.snoozed_until).getTime() <= now.getTime();
    }
    return false;
  });

  if (dueIndex !== -1) {
    const dueInstance = sorted[dueIndex];
    const task = dueInstance.tasks!;
    // Find next upcoming after this one
    const nextUp = sorted.slice(dueIndex + 1).find((i) => i.status !== "done");
    return {
      type: "due",
      instance: dueInstance,
      task,
      nextUp,
    };
  }

  // Check if all are done
  const hasPendingOrSnoozed = sorted.some(
    (i) => i.status === "pending" || i.status === "snoozed"
  );
  if (!hasPendingOrSnoozed && sorted.length > 0) {
    return { type: "all_done", totalCount: sorted.length };
  }

  // Find next upcoming pending task in the future
  const upcomingInstance = sorted.find(
    (i) => (i.status === "pending" || i.status === "snoozed") && new Date(i.scheduled_for) > now
  );

  if (upcomingInstance) {
    return {
      type: "upcoming",
      nextTask: upcomingInstance,
      task: upcomingInstance.tasks!,
    };
  }

  return { type: "all_done", totalCount: sorted.length };
}

