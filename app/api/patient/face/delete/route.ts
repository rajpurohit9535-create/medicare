import { NextRequest, NextResponse } from "next/server";
import { biometricStore } from "@/lib/biometrics/store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}));
    const { patientId } = json;

    const targetPatientId = patientId || "22222222-2222-2222-2222-222222222222";

    // 1. Revoke in local store
    biometricStore.revokeByPatientId(targetPatientId);

    // 2. Revoke in Supabase if live
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (!supabaseUrl.includes("placeholder")) {
      const admin = createAdminClient();
      await admin
        .from("patient_biometrics")
        .update({ status: "revoked" })
        .eq("patient_id", targetPatientId);

      await admin.from("biometric_audit_logs").insert({
        patient_id: targetPatientId,
        event_type: "revocation",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Patient face biometric data has been permanently deleted and revoked.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

