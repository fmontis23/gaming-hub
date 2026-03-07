import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAuthorizedUserId(req) {
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

async function isAdmin(userId) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Errore controllo admin:", error.message);
    return false;
  }

  return !!data;
}

export async function POST(req) {
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

    const { data: teams, error: teamsError } = await supabase
      .from("event_teams")
      .select("id")
      .eq("event_id", eventId);

    if (teamsError) {
      return NextResponse.json(
        { error: teamsError.message },
        { status: 500 }
      );
    }

    if (!teams || teams.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nessuna squadra da resettare.",
      });
    }

    const teamIds = teams.map((team) => team.id);

    const { error: membersDeleteError } = await supabase
      .from("event_team_members")
      .delete()
      .in("team_id", teamIds);

    if (membersDeleteError) {
      return NextResponse.json(
        { error: membersDeleteError.message },
        { status: 500 }
      );
    }

    const { error: teamsDeleteError } = await supabase
      .from("event_teams")
      .delete()
      .eq("event_id", eventId);

    if (teamsDeleteError) {
      return NextResponse.json(
        { error: teamsDeleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Squadre resettate con successo.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Errore interno." },
      { status: 500 }
    );
  }
}