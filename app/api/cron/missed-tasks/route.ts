import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Phase 6 will implement full missed task detection
  return NextResponse.json({
    message: "Missed tasks cron endpoint ready",
    timestamp: new Date().toISOString(),
  });
}
