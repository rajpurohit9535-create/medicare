import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get linked patient
    const { data: links, error: linkError } = await supabase
      .from("caregiver_patients")
      .select("patient_id, patients(id, display_name)")
      .eq("caregiver_id", user.id);

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    if (!links || links.length === 0) {
      return NextResponse.json({ tasks: [], patient: null });
    }

    const patientId = links[0].patient_id;
    const patient = links[0].patients;

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("patient_id", patientId)
      .order("time_of_day", { ascending: true });

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [], patient });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parseResult = taskSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const t = parseResult.data;

    // Verify caregiver has access to this patient
    const { data: link } = await supabase
      .from("caregiver_patients")
      .select("patient_id")
      .eq("caregiver_id", user.id)
      .eq("patient_id", t.patientId)
      .maybeSingle();

    if (!link) {
      return NextResponse.json(
        { error: "You do not have permission to manage tasks for this patient." },
        { status: 403 }
      );
    }

    const { data: newTask, error: insertError } = await supabase
      .from("tasks")
      .insert({
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
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
