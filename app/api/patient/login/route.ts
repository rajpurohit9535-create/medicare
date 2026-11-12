import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { patientLoginSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Rate limiting in-memory store: code -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(code: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(code);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(code, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }

  if (record.count >= 5) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = patientLoginSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "That didn't work. Please ask your family to help." },
        { status: 400 }
      );
    }

    const { familyCode, pin } = parseResult.data;

    // Rate limiting check
    if (!checkRateLimit(familyCode)) {
      return NextResponse.json(
        {
          error:
            "Too many attempts. Please take a break and ask your family to help.",
        },
        { status: 429 }
      );
    }

    const admin = createAdminClient();

    // 1. Fetch patient record by family code
    const { data: patient, error: patientError } = await admin
      .from("patients")
      .select("id, display_name, pin_hash")
      .ilike("family_code", familyCode)
      .maybeSingle();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "That didn't work. Please ask your family to help." },
        { status: 401 }
      );
    }

    // 2. Verify PIN
    const isPinValid = await bcrypt.compare(pin, patient.pin_hash);
    if (!isPinValid) {
      return NextResponse.json(
        { error: "That didn't work. Please ask your family to help." },
        { status: 401 }
      );
    }

    // PIN matched: clear rate limit
    rateLimitMap.delete(familyCode);

    // 3. Get the auth user email
    const { data: authUser, error: authUserError } =
      await admin.auth.admin.getUserById(patient.id);

    if (authUserError || !authUser.user?.email) {
      return NextResponse.json(
        { error: "That didn't work. Please ask your family to help." },
        { status: 500 }
      );
    }

    const patientEmail = authUser.user.email;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || "carecompanion-secret";
    const internalPassword = crypto
      .createHmac("sha256", serviceKey)
      .update(patientEmail)
      .digest("hex");

    // Ensure user password in auth system is synced to internalPassword
    await admin.auth.admin.updateUserById(patient.id, {
      password: internalPassword,
    });

    // 4. Create session and set long-lived cookies on response
    let response = NextResponse.json({
      success: true,
      displayName: patient.display_name,
    });

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Long-lived session: 180 days (months)
            response.cookies.set(name, value, {
              ...options,
              maxAge: 180 * 24 * 60 * 60,
              path: "/",
            });
          });
        },
      },
    });

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: patientEmail,
      password: internalPassword,
    });

    if (signInError) {
      console.error("Patient signin error:", signInError);
      return NextResponse.json(
        { error: "That didn't work. Please ask your family to help." },
        { status: 500 }
      );
    }

    return response;
  } catch (err) {
    console.error("Unexpected error in patient login:", err);
    return NextResponse.json(
      { error: "That didn't work. Please ask your family to help." },
      { status: 500 }
    );
  }
}

