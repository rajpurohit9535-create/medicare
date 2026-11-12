import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { patientCreateSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    // Verify caregiver authentication
    const {
      data: { user: caregiverUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !caregiverUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in as a caregiver." },
        { status: 401 }
      );
    }

    const json = await request.json();
    const parseResult = patientCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { displayName, homeAddress, livesWith, pin, timezone } = parseResult.data;

    // Generate unique family code: e.g. AMMA-4821
    const prefix = displayName
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 4)
      .toUpperCase() || "CARE";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const familyCode = `${prefix}-${randomSuffix}`;

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 10);

    // Create unique patient email and secure auth password
    const patientUuid = crypto.randomUUID();
    const patientEmail = `patient-${patientUuid}@carecompanion.local`;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "carecompanion-secret";
    const internalPassword = crypto
      .createHmac("sha256", serviceKey)
      .update(patientEmail)
      .digest("hex");

    // Create auth user via admin API
    const { data: authCreated, error: createAuthError } =
      await admin.auth.admin.createUser({
        email: patientEmail,
        password: internalPassword,
        email_confirm: true,
        user_metadata: {
          role: "patient",
          full_name: displayName,
        },
        app_metadata: {
          role: "patient",
        },
      });

    if (createAuthError || !authCreated.user) {
      console.error("Failed to create patient auth user:", createAuthError);
      return NextResponse.json(
        { error: createAuthError?.message || "Failed to create patient account" },
        { status: 500 }
      );
    }

    const patientId = authCreated.user.id;

    // Create profile
    const { error: profileError } = await admin.from("profiles").upsert({
      id: patientId,
      role: "patient",
      full_name: displayName,
    });

    if (profileError) {
      console.error("Failed to create patient profile:", profileError);
      // Clean up auth user
      await admin.auth.admin.deleteUser(patientId);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Create patient record
    const { error: patientDbError } = await admin.from("patients").insert({
      id: patientId,
      display_name: displayName,
      family_code: familyCode,
      pin_hash: pinHash,
      home_address: homeAddress,
      lives_with: livesWith,
      timezone: timezone || "Asia/Kolkata",
    });

    if (patientDbError) {
      console.error("Failed to create patient record:", patientDbError);
      await admin.auth.admin.deleteUser(patientId);
      return NextResponse.json(
        { error: "Failed to save patient details" },
        { status: 500 }
      );
    }

    // Link caregiver and patient
    const { error: linkError } = await admin.from("caregiver_patients").insert({
      caregiver_id: caregiverUser.id,
      patient_id: patientId,
    });

    if (linkError) {
      console.error("Failed to link caregiver to patient:", linkError);
    }

    return NextResponse.json({
      success: true,
      patient: {
        id: patientId,
        displayName,
        familyCode,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

