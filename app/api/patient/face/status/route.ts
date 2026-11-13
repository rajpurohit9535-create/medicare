import { NextRequest, NextResponse } from "next/server";
import { biometricStore } from "@/lib/biometrics/store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}));
    const { familyCode } = json;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isPlaceholder = supabaseUrl.includes("placeholder");

    // If a specific family code was passed
    if (familyCode && typeof familyCode === "string") {
      const cleanCode = familyCode.trim().toUpperCase();

      // Check local store first
      const localRecord = biometricStore.getByFamilyCode(cleanCode);
      if (localRecord) {
        return NextResponse.json({
          exists: true,
          enrolled: true,
          patientId: localRecord.patientId,
          displayName: localRecord.displayName,
          familyCode: localRecord.familyCode,
        });
      }

      // Check Supabase if configured
      if (!isPlaceholder) {
        try {
          const admin = createAdminClient();
          const { data: patient } = await admin
            .from("patients")
            .select("id, display_name, family_code")
            .ilike("family_code", cleanCode)
            .maybeSingle();

          if (patient) {
            const { data: bio } = await admin
              .from("patient_biometrics")
              .select("id, model_version, status")
              .eq("patient_id", patient.id)
              .eq("status", "active")
              .maybeSingle();

            return NextResponse.json({
              exists: true,
              enrolled: !!bio,
              patientId: patient.id,
              displayName: patient.display_name,
              familyCode: patient.family_code,
            });
          }
        } catch (dbErr) {
          console.warn("Database status query error:", dbErr);
        }
      }

      // Seeded demo patient
      if (cleanCode === "AMMA-4821") {
        return NextResponse.json({
          exists: true,
          enrolled: false,
          patientId: "22222222-2222-2222-2222-222222222222",
          displayName: "Amma",
          familyCode: "AMMA-4821",
        });
      }

      return NextResponse.json({ exists: false, enrolled: false });
    }

    // If no family code was passed: check if ANY patient is enrolled in the system
    const allActive = biometricStore.getAllActive();
    if (allActive.length > 0) {
      return NextResponse.json({
        hasEnrolledPatients: true,
        count: allActive.length,
      });
    }

    if (!isPlaceholder) {
      try {
        const admin = createAdminClient();
        const { count } = await admin
          .from("patient_biometrics")
          .select("id", { count: "exact", head: true })
          .eq("status", "active");

        return NextResponse.json({
          hasEnrolledPatients: (count || 0) > 0,
          count: count || 0,
        });
      } catch {}
    }

    return NextResponse.json({
      hasEnrolledPatients: false,
      count: 0,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

