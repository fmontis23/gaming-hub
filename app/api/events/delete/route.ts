import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAuthorizedUserId(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user.id;
}

async function isAdmin(userId: string | null) {
  if (!userId) return false;

  const adminIds =
    process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || [];

  return adminIds.includes(userId);
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthorizedUserId(req);

    if (!(await isAdmin(userId))) {
      return NextResponse.json(
        { error: "Non autorizzato." },
        { status: 403 }
      );
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId mancante" },
        { status: 400 }
      );
    }

    await supabase
      .from("event_team_members")
      .delete()
      .in(
        "team_id",
        (
          await supabase
            .from("event_teams")
            .select("id")
            .eq("event_id", eventId)
        ).data?.map((t) => t.id) || []
      );

    await supabase
      .from("event_teams")
      .delete()
      .eq("event_id", eventId);

    await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", eventId);

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evento eliminato con successo.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Errore interno." },
      { status: 500 }
    );
  }
}