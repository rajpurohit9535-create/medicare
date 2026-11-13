import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "PIN login has been removed. Patient mode exclusively uses Face Recognition.",
      success: false,
    },
    { status: 410 }
  );
}
