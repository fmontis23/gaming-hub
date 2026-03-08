import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message, event: null },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data ?? null });
  } catch (error) {
    console.error("Errore API /api/events/next:", error);

    return NextResponse.json(
      { error: "Errore interno server", event: null },
      { status: 500 }
    );
  }
}