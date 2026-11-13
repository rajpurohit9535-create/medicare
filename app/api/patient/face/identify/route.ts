import { NextRequest, NextResponse } from "next/server";
import { faceEngine } from "@/lib/biometrics/engine";
import { decryptEmbedding } from "@/lib/biometrics/crypto";
import { biometricStore } from "@/lib/biometrics/store";
import { createAdminClient } from "@/lib/supabase/admin";

// Rate limiting: max 8 attempts per 5 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return true;
  }
  if (record.count >= 8) {
    return false;
  }
  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "TOO_MANY_ATTEMPTS",
          message: "Please rest for a few minutes or enter your Family Code and PIN.",
        },
        { status: 429 }
      );
    }

    const json = await request.json();
    const { frame } = json;

    if (!frame || typeof frame !== "string") {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "A camera frame is required." },
        { status: 400 }
      );
    }

    // 1. Gather all candidate enrolled patient templates
    interface Candidate {
      id: string; // patientId
      displayName: string;
      familyCode: string;
      template: number[];
    }

    const candidateList: Candidate[] = [];
    const localActive = biometricStore.getAllActive();

    for (const rec of localActive) {
      try {
        const decrypted = decryptEmbedding(rec.template);
        candidateList.push({
          id: rec.patientId,
          displayName: rec.displayName,
          familyCode: rec.familyCode,
          template: decrypted,
        });
      } catch (decErr) {
        console.warn("Failed to decrypt local template for patient:", rec.patientId, decErr);
      }
    }

    // Also check Supabase for active patient templates
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isPlaceholder = supabaseUrl.includes("placeholder");

    if (!isPlaceholder) {
      try {
        const admin = createAdminClient();
        const { data: dbRecords } = await admin
          .from("patient_biometrics")
          .select(`
            patient_id,
            encrypted_embedding,
            encryption_iv,
            encryption_tag,
            patients (
              id,
              display_name,
              family_code
            )
          `)
          .eq("status", "active");

        if (dbRecords && Array.isArray(dbRecords)) {
          for (const item of dbRecords) {
            // Avoid duplicates if already loaded from memory store
            if (candidateList.some((c) => c.id === item.patient_id)) continue;

            try {
              const decrypted = decryptEmbedding({
                encryptedEmbedding: item.encrypted_embedding,
                iv: item.encryption_iv,
                tag: item.encryption_tag,
              });
              const patientData = (item as any).patients;
              candidateList.push({
                id: item.patient_id,
                displayName: patientData?.display_name || "Patient",
                familyCode: patientData?.family_code || "FAMILY",
                template: decrypted,
              });
            } catch (e) {
              console.warn("Decryption error for DB record:", item.patient_id, e);
            }
          }
        }
      } catch (dbErr) {
        console.warn("Database candidate query error:", dbErr);
      }
    }

    if (candidateList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          matched: false,
          error: "NO_ENROLLED_PATIENTS",
          message: "No faces are enrolled yet. Please sign in with your Family Code and PIN first.",
        },
        { status: 404 }
      );
    }

    // 2. Perform 1:N Identification via Python Biometric Engine (YuNet + SFace)
    const identifyPayload = candidateList.map((c) => ({
      id: c.id,
      template: c.template,
    }));

    const result = await faceEngine.identify(frame, identifyPayload);

    if (!result.success || !result.matched || !result.matched_id) {
      // Log failure in audit log
      if (!isPlaceholder) {
        try {
          const admin = createAdminClient();
          await admin.from("biometric_audit_logs").insert({
            event_type: "verify_failure",
            similarity_score: result.similarity_score || 0,
            liveness_passed: result.liveness_passed || false,
            failure_reason: result.error || "RECOGNITION_MISMATCH",
          });
        } catch {}
      }

      return NextResponse.json(
        {
          success: false,
          matched: false,
          error: result.error || "RECOGNITION_MISMATCH",
          message:
            result.message ||
            "We could not recognize your face. Please hold still and look directly at the camera, or use your PIN.",
          similarity: result.similarity_score,
          threshold: result.threshold,
        },
        { status: 401 }
      );
    }

    // 3. Matched! Identify the corresponding patient
    const matchedPatient = candidateList.find((c) => c.id === result.matched_id);
    if (!matchedPatient) {
      return NextResponse.json(
        { error: "MATCH_RESOLVE_ERROR", message: "Patient profile could not be resolved." },
        { status: 500 }
      );
    }

    // Clear rate limit for this IP
    rateLimitMap.delete(ip);

    // 4. Create long-lived patient session cookie
    const response = NextResponse.json({
      success: true,
      matched: true,
      displayName: matchedPatient.displayName,
      familyCode: matchedPatient.familyCode,
      similarityScore: result.similarity_score,
      message: `Welcome back, ${matchedPatient.displayName}!`,
    });

    response.cookies.set(
      "cc_patient",
      JSON.stringify({
        id: matchedPatient.id,
        displayName: matchedPatient.displayName,
        familyCode: matchedPatient.familyCode,
        authMethod: "face_recognition",
      }),
      {
        path: "/",
        maxAge: 180 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: false,
      }
    );

    // Update audit log and last_used_at in Supabase if live
    if (!isPlaceholder) {
      try {
        const admin = createAdminClient();
        await admin.from("biometric_audit_logs").insert({
          patient_id: matchedPatient.id,
          event_type: "verify_success",
          similarity_score: result.similarity_score,
          liveness_passed: true,
        });

        await admin
          .from("patient_biometrics")
          .update({ last_used_at: new Date().toISOString() })
          .eq("patient_id", matchedPatient.id);
      } catch {}
    }

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Identification error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

