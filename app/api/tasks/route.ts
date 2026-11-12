import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validators";
import { INITIAL_DEMO_TASKS } from "@/lib/defaultTasks";

// In-memory demo store for local testing
let inMemoryTasks = [...INITIAL_DEMO_TASKS];

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const isPlaceholder = supabaseUrl.includes("placeholder");

    if (isPlaceholder) {
      return NextResponse.json({
        tasks: inMemoryTasks,
        patient: { id: "22222222-2222-2222-2222-222222222222", display_name: "Amma" },
      });
    }

    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        tasks: inMemoryTasks,
        patient: { id: "22222222-2222-2222-2222-222222222222", display_name: "Amma" },
      });
    }

    // Get linked patient
    const { data: links, error: linkError } = await supabase
      .from("caregiver_patients")
      .select("patient_id, patients(id, display_name)")
      .eq("caregiver_id", user.id);

    if (linkError || !links || links.length === 0) {
      return NextResponse.json({
        tasks: inMemoryTasks,
        patient: { id: "22222222-2222-2222-2222-222222222222", display_name: "Amma" },
      });
    }

    const patientId = links[0].patient_id;
    const patient = links[0].patients;

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("patient_id", patientId)
      .order("time_of_day", { ascending: true });

    if (tasksError || !tasks || tasks.length === 0) {
      return NextResponse.json({ tasks: inMemoryTasks, patient });
    }

    return NextResponse.json({ tasks: tasks || [], patient });
  } catch (err: unknown) {
    return NextResponse.json({
      tasks: inMemoryTasks,
      patient: { id: "22222222-2222-2222-2222-222222222222", display_name: "Amma" },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = taskSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const t = parseResult.data;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const isPlaceholder = supabaseUrl.includes("placeholder");

    const newTask = {
      id: `task-${Date.now()}`,
      patient_id: t.patientId,
      title: t.title,
      icon: t.icon,
      category: t.category,
      time_of_day: t.timeOfDay,
      repeat_days: t.repeatDays,
      start_date: t.startDate || new Date().toISOString().split("T")[0],
      end_date: t.endDate || null,
      steps: t.steps,
      caregiver_note: t.caregiverNote || null,
      encouragement: t.encouragement || null,
      is_active: t.isActive,
    };

    if (isPlaceholder) {
      inMemoryTasks.push(newTask);
      return NextResponse.json({ success: true, task: newTask });
    }

    const supabase = await createClient();
    const { data: inserted, error: insertError } = await supabase
      .from("tasks")
      .insert(newTask)
      .select()
      .single();

    if (insertError) {
      inMemoryTasks.push(newTask);
      return NextResponse.json({ success: true, task: newTask });
    }

    return NextResponse.json({ success: true, task: inserted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
