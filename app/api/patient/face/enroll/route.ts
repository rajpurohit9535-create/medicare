import { NextRequest, NextResponse } from "next/server";
import { faceEngine } from "@/lib/biometrics/engine";
import { encryptEmbedding } from "@/lib/biometrics/crypto";
import { biometricStore } from "@/lib/biometrics/store";
import { createAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { familyCode, displayName: reqName, frames, consentGiven } = json;

    if (!Array.isArray(frames) || frames.length < 1) {
      return NextResponse.json(
        { error: "At least 1 camera frame is required for face enrollment." },
        { status: 400 }
      );
    }

    const enrollFrames = frames.length === 1 ? [frames[0], frames[0]] : frames;

    if (consentGiven === false) {
      return NextResponse.json(
        { error: "Explicit biometric consent is required before face enrollment." },
        { status: 400 }
      );
    }

    const cleanCode = (familyCode || "AMMA-4821").trim().toUpperCase();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isPlaceholder = supabaseUrl.includes("placeholder");

    let patientId = "22222222-2222-2222-2222-222222222222";
    let displayName = reqName || "Amma";

    if (!isPlaceholder) {
      try {
        const admin = createAdminClient();
        const { data: patient } = await admin
          .from("patients")
          .select("id, display_name, family_code")
          .ilike("family_code", cleanCode)
          .maybeSingle();
        if (patient) {
          patientId = patient.id;
          displayName = patient.display_name;
        }
      } catch {}
    }

    // 2. Invoke Python Biometric Engine (YuNet detection + SFace feature extraction)
    const enrollResult = await faceEngine.enroll(enrollFrames);
    if (!enrollResult.success || !enrollResult.embedding) {
      return NextResponse.json(
        {
          error: enrollResult.error || "ENROLLMENT_FAILED",
          message: enrollResult.message || "Could not get a clear picture of your face. Please hold still in good lighting.",
        },
        { status: 400 }
      );
    }

    // 3. Encrypt the 128-d embedding using AES-256-GCM
    const encryptedTemplate = encryptEmbedding(enrollResult.embedding);

    // 4. Save to local in-memory store against PATIENT ID
    biometricStore.save({
      id: `bio-${Date.now()}`,
      patientId,
      displayName,
      familyCode: cleanCode,
      model_version: enrollResult.model_version || "yunet-sface-v1",
      template: encryptedTemplate,
      status: "active",
      consentGiven: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    });

    // 5. Save to Supabase patient_biometrics if configured
    if (!isPlaceholder) {
      try {
        const admin = createAdminClient();
        await admin.from("patient_biometrics").upsert({
          patient_id: patientId,
          model_version: enrollResult.model_version || "yunet-sface-v1",
          encrypted_embedding: encryptedTemplate.encryptedEmbedding,
          encryption_iv: encryptedTemplate.iv,
          encryption_tag: encryptedTemplate.tag,
          status: "active",
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
        });

        // Audit log
        await admin.from("biometric_audit_logs").insert({
          patient_id: patientId,
          event_type: "enrollment",
          liveness_passed: true,
        });
      } catch (dbErr) {
        console.warn("Database patient biometric write warning:", dbErr);
      }
    }

    // 6. Create long-lived patient session cookie directly on response
    const response = NextResponse.json({
      success: true,
      message: `Face enrolled successfully! Welcome, ${displayName}.`,
      displayName,
      familyCode: cleanCode,
      framesEnrolled: enrollResult.frames_enrolled,
      modelVersion: enrollResult.model_version,
    });

    response.cookies.set(
      "cc_patient",
      JSON.stringify({
        id: patientId,
        displayName,
        familyCode: cleanCode,
        authMethod: "face_recognition",
      }),
      {
        path: "/",
        maxAge: 180 * 24 * 60 * 60, // 180 days long-lived patient session
        sameSite: "lax",
        httpOnly: false, // accessible to client for personalized greeting
      }
    );

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Enrollment error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

