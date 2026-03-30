import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://fit-home-workout-planner-backend.onrender.com/api/health",
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json({ ok: true, backend: data });
  } catch {
    return NextResponse.json({ ok: false, error: "Backend unreachable" }, { status: 502 });
  }
}
