import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*, patients(display_name)")
      .eq("id", id)
      .maybeSingle();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();

    // Map camelCase to snake_case if necessary
    const updates: Record<string, unknown> = {};
    if (json.title !== undefined) updates.title = json.title;
    if (json.icon !== undefined) updates.icon = json.icon;
    if (json.category !== undefined) updates.category = json.category;
    if (json.timeOfDay !== undefined) updates.time_of_day = json.timeOfDay;
    if (json.time_of_day !== undefined) updates.time_of_day = json.time_of_day;
    if (json.repeatDays !== undefined) updates.repeat_days = json.repeatDays;
    if (json.repeat_days !== undefined) updates.repeat_days = json.repeat_days;
    if (json.startDate !== undefined) updates.start_date = json.startDate;
    if (json.start_date !== undefined) updates.start_date = json.start_date;
    if (json.endDate !== undefined) updates.end_date = json.endDate;
    if (json.end_date !== undefined) updates.end_date = json.end_date;
    if (json.steps !== undefined) updates.steps = json.steps;
    if (json.caregiverNote !== undefined) updates.caregiver_note = json.caregiverNote;
    if (json.caregiver_note !== undefined) updates.caregiver_note = json.caregiver_note;
    if (json.encouragement !== undefined) updates.encouragement = json.encouragement;
    if (json.isActive !== undefined) updates.is_active = json.isActive;
    if (json.is_active !== undefined) updates.is_active = json.is_active;

    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
