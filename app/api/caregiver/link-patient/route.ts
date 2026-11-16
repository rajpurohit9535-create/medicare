import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { patientLoginSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // 1. Get the signed-in user with the server client
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Verify caller has caregiver role via admin client
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "caregiver") {
      return NextResponse.json(
        { error: "Forbidden: Caregiver role required" },
        { status: 403 }
      );
    }

    // 3. Parse JSON body with patientLoginSchema
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parseResult = patientLoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { familyCode, pin } = parseResult.data;
    const cleanCode = familyCode.trim().toUpperCase();

    // 4. Find patient by family_code and verify PIN
    const { data: patient, error: patientError } = await admin
      .from("patients")
      .select("id, pin_hash")
      .ilike("family_code", cleanCode)
      .maybeSingle();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Family code or PIN is incorrect." },
        { status: 404 }
      );
    }

    const isPinValid = await bcrypt.compare(pin, patient.pin_hash);
    if (!isPinValid) {
      return NextResponse.json(
        { error: "Family code or PIN is incorrect." },
        { status: 404 }
      );
    }

    // 5. Upsert link into caregiver_patients with admin client
    const { error: upsertError } = await admin
      .from("caregiver_patients")
      .upsert(
        {
          caregiver_id: user.id,
          patient_id: patient.id,
        },
        {
          onConflict: "caregiver_id,patient_id",
          ignoreDuplicates: true,
        }
      );

    if (upsertError) {
      console.error("Failed to link caregiver to patient:", upsertError);
      return NextResponse.json(
        { error: "Failed to link patient. Please try again." },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json({ success: true, patientId: patient.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
