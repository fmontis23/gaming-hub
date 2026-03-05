"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
type EventRow = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  max_players: number;
  created_by: string; // auth.users.id
  registrations_open: boolean;
  registrations_open_at: string | null;
};

type ParticipantRow = {
  id: string;
  event_id: string;
  user_id: string; // auth.users.id
  role: string | null;
  status: string | null;
  created_at: string | null;
};

type PublicUser = {
  auth_user_id: string; // auth.users.id
  discord_username: string | null;
  ubisoft_nickname: string | null;
  platform: string | null;
  rank: string | null;
};

type TeamRow = {
  id: string;
  event_id: string;
  team_name: "A" | "B";
  members: string[]; // JSONB array
  created_at: string | null;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [userMap, setUserMap] = useState<Map<string, PublicUser>>(new Map());

  // teams salvate nel DB: eventId -> { A, B }
  const [savedTeams, setSavedTeams] = useState<
    Record<string, { A?: string[]; B?: string[] }>
  >({});

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setMyUserId(userData?.user?.id ?? null);

      await loadAll();
      setLoading(false);
    };

    init();
  }, []);

  const announceDiscord = async (content: string) => {
    const res = await fetch("/api/discord/announce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Discord announce error:", data);
      alert("Errore invio Discord: " + (data?.details ?? data?.error ?? "unknown"));
      return false;
    }
    return true;
  };

  const loadAll = async () => {
    // 1) eventi
    const { data: ev, error: evErr } = await supabase
      .from("events")
      .select("id,title,description,event_date,max_players,created_by,registrations_open,registrations_open_at")
      .order("event_date", { ascending: true });

    if (evErr) {
      console.error("events:", evErr.message);
      return;
    }
    const evRows = (ev as EventRow[]) ?? [];
    setEvents(evRows);

    // 2) partecipanti
    const { data: part, error: partErr } = await supabase
      .from("event_participants")
      .select("*");

    if (partErr) {
      console.error("participants:", partErr.message);
      return;
    }
    const partRows = (part as ParticipantRow[]) ?? [];
    setParticipants(partRows);

    // 3) profili (tabella users)
    const uniqueUserIds = Array.from(new Set(partRows.map((p) => p.user_id)));
    if (uniqueUserIds.length > 0) {
      const { data: usersData, error: usersErr } = await supabase
        .from("users")
        .select("auth_user_id, discord_username, ubisoft_nickname, platform, rank")
        .in("auth_user_id", uniqueUserIds);

      if (usersErr) {
        console.error("users:", usersErr.message);
      } else {
        const map = new Map<string, PublicUser>();
        (usersData ?? []).forEach((u: any) => map.set(u.auth_user_id, u));
        setUserMap(map);
      }
    } else {
      setUserMap(new Map());
    }

    // 4) squadre salvate
    const { data: tData, error: tErr } = await supabase.from("event_teams").select("*");
    if (tErr) {
      console.error("event_teams:", tErr.message);
      setSavedTeams({});
    } else {
      const teams = (tData as TeamRow[]) ?? [];
      const map: Record<string, { A?: string[]; B?: string[] }> = {};
      for (const t of teams) {
        if (!map[t.event_id]) map[t.event_id] = {};
        if (t.team_name === "A") map[t.event_id].A = (t.members ?? []) as any;
        if (t.team_name === "B") map[t.event_id].B = (t.members ?? []) as any;
      }
      setSavedTeams(map);
    }
  };

  const participantsByEvent = useMemo(() => {
    const map = new Map<string, ParticipantRow[]>();
    for (const p of participants) {
      const arr = map.get(p.event_id) ?? [];
      arr.push(p);
      map.set(p.event_id, arr);
    }
    return map;
  }, [participants]);

  const isJoined = (eventId: string) => {
    if (!myUserId) return false;
    const arr = participantsByEvent.get(eventId) ?? [];
    return arr.some((p) => p.user_id === myUserId);
  };

  const joinEvent = async (event: EventRow) => {
    if (!event.registrations_open) {
      alert("Le iscrizioni non sono ancora aperte.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("Devi fare login per partecipare.");
      return;
    }

    const { error } = await supabase.from("event_participants").insert({
      event_id: event.id,
      user_id: user.id,
      role: "player",
      status: "joined",
    });

    if (error) {
      alert("Errore partecipazione: " + error.message);
      return;
    }

    await loadAll();
  };

  const leaveEvent = async (eventId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);

    if (error) {
      alert("Errore annullamento: " + error.message);
      return;
    }

    await loadAll();
  };

  const formatPlayerLabel = (p: ParticipantRow) => {
    const u = userMap.get(p.user_id);
    const discord = (u?.discord_username ?? "").trim();
    const ubi = (u?.ubisoft_nickname ?? "").trim();

    if (discord && ubi) return `${discord} — ${ubi}`;
    if (discord) return `${discord} — (Ubisoft non impostato)`;
    if (ubi) return `(Discord) — ${ubi}`;
    return "utente";
  };

  const openRegistrations = async (event: EventRow) => {
    if (!myUserId) {
      alert("Devi essere loggato.");
      return;
    }
    if (event.created_by !== myUserId) {
      alert("Solo chi ha creato l’evento può aprire le iscrizioni.");
      return;
    }
    if (event.registrations_open) {
      alert("Iscrizioni già aperte.");
      return;
    }

    const { error } = await supabase
      .from("events")
      .update({ registrations_open: true })
      .eq("id", event.id);

    if (error) {
      alert("Errore apertura iscrizioni: " + error.message);
      return;
    }

    const dateStr = new Date(event.event_date).toLocaleString();
    const content =
      `🟢 **Iscrizioni aperte!**\n` +
      `🎮 **${event.title}**\n` +
      `📅 ${dateStr}\n` +
      `👥 Max: **${event.max_players}**\n` +
      `➡️ Iscriviti sul sito: ${window.location.origin}/events`;

    await announceDiscord(content);

    alert("Iscrizioni aperte ✅ (annuncio inviato su Discord)");
    await loadAll();
  };

  const generateAndSaveTeams = async (event: EventRow) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      alert("Devi essere loggato per generare le squadre.");
      return;
    }

    if (!event.registrations_open) {
      alert("Apri prima le iscrizioni.");
      return;
    }

    const list = participantsByEvent.get(event.id) ?? [];
    if (list.length < 10) {
      alert("Servono almeno 10 partecipanti per creare 2 squadre da 5.");
      return;
    }

    const labels = list.map(formatPlayerLabel);

    // shuffle
    const shuffled = [...labels].sort(() => Math.random() - 0.5);
    const teamA = shuffled.slice(0, 5);
    const teamB = shuffled.slice(5, 10);

    const { error } = await supabase.from("event_teams").upsert(
      [
        { event_id: event.id, team_name: "A", members: teamA },
        { event_id: event.id, team_name: "B", members: teamB },
      ],
      { onConflict: "event_id,team_name" }
    );

    if (error) {
      alert("Errore salvataggio squadre: " + error.message);
      return;
    }

    alert("Squadre salvate ✅");
    await loadAll();
  };

  const publishTeamsToDiscord = async (event: EventRow) => {
    const teamA = savedTeams[event.id]?.A;
    const teamB = savedTeams[event.id]?.B;

    if (!teamA?.length || !teamB?.length) {
      alert("Prima genera e salva le squadre.");
      return;
    }

    const dateStr = new Date(event.event_date).toLocaleString();

    const content =
      `🏆 **Squadre evento**\n` +
      `🎮 **${event.title}**\n` +
      `📅 ${dateStr}\n\n` +
      `🟦 **TEAM A**\n- ${teamA.join("\n- ")}\n\n` +
      `🟥 **TEAM B**\n- ${teamB.join("\n- ")}\n`;

    const ok = await announceDiscord(content);
    if (ok) alert("Squadre pubblicate su Discord ✅");
  };

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <p>Caricamento eventi...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🎮 Eventi disponibili</h1>

      {events.length === 0 && <p>Nessun evento creato.</p>}

      {events.map((event) => {
        const list = participantsByEvent.get(event.id) ?? [];
        const count = list.length;
        const joined = isJoined(event.id);
        const full = count >= (event.max_players ?? 10);
        const isCreator = myUserId && event.created_by === myUserId;

        const teamA = savedTeams[event.id]?.A;
        const teamB = savedTeams[event.id]?.B;

        return (
          <div
            key={event.id}
            style={{
              border: "1px solid #444",
              borderRadius: 10,
              padding: 20,
              marginTop: 20,
              maxWidth: 980,
            }}
          >
            <h2 style={{ marginBottom: 6 }}>{event.title}</h2>
            <p style={{ marginTop: 0, opacity: 0.9 }}>{event.description}</p>

            <p style={{ marginTop: 10 }}>📅 {new Date(event.event_date).toLocaleString()}</p>

            <p>
              🟢 Iscrizioni:{" "}
              <b style={{ color: event.registrations_open ? "#2ecc71" : "#f1c40f" }}>
                {event.registrations_open ? "APERTE" : "CHIUSE"}
              </b>
              {event.registrations_open_at ? (
                <>
                  {" "}
                  (programmate: {new Date(event.registrations_open_at).toLocaleString()})
                </>
              ) : null}
            </p>

            <p>
              👥 Iscritti: <b>{count}</b> / {event.max_players}
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!joined ? (
                <button
                  onClick={() => joinEvent(event)}
                  disabled={full || !event.registrations_open}
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #444",
                    cursor: full || !event.registrations_open ? "not-allowed" : "pointer",
                    opacity: full || !event.registrations_open ? 0.6 : 1,
                  }}
                >
                  {!event.registrations_open ? "Iscrizioni chiuse" : full ? "Evento pieno" : "Partecipa"}
                </button>
              ) : (
                <button
                  onClick={() => leaveEvent(event.id)}
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #444",
                    cursor: "pointer",
                  }}
                >
                  Annulla partecipazione
                </button>
              )}

              {isCreator && !event.registrations_open && (
                <button
                  onClick={() => openRegistrations(event)}
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #444",
                    cursor: "pointer",
                  }}
                >
                  Apri iscrizioni + annuncio Discord
                </button>
              )}

              <button
                onClick={() => generateAndSaveTeams(event)}
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #444",
                  cursor: "pointer",
                }}
              >
                Genera squadre (salva)
              </button>

              <button
                onClick={() => publishTeamsToDiscord(event)}
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #444",
                  cursor: "pointer",
                }}
              >
                Pubblica squadre su Discord
              </button>
            </div>

            <details style={{ marginTop: 14 }}>
              <summary>Vedi iscritti</summary>
              <ul>
                {list.map((p) => {
                  const u = userMap.get(p.user_id);
                  return (
                    <li key={p.id}>
                      <b>{u?.discord_username ?? "utente"}</b>
                      {" — "}
                      Ubisoft: {u?.ubisoft_nickname ?? "non impostato"}
                      {" — "}
                      {u?.platform ?? ""}
                      {u?.rank ? ` (${u.rank})` : ""}
                      {p.user_id === myUserId ? <b> (tu)</b> : null}
                    </li>
                  );
                })}
              </ul>
              <p style={{ opacity: 0.75 }}>
                Se qualcuno appare come “utente / non impostato”, deve completare il profilo su{" "}
                <b>/profile</b>.
              </p>
            </details>

            {(teamA || teamB) && (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  border: "1px solid #444",
                  borderRadius: 10,
                }}
              >
                <h3 style={{ marginTop: 0 }}>Squadre (salvate)</h3>

                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div>
                    <b>TEAM A</b>
                    <ol>
                      {(teamA ?? []).map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <b>TEAM B</b>
                    <ol>
                      {(teamB ?? []).map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}