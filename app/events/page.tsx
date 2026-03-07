"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type EventRow = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  max_players: number;
  created_by: string;
  registrations_open: boolean;
  registrations_open_at: string | null;
};

type ParticipantRow = {
  id: string;
  event_id: string;
  user_id: string;
  role: string | null;
  status: string | null;
  created_at: string | null;
};

type PublicUser = {
  auth_user_id: string;
  discord_username: string | null;
  ubisoft_nickname: string | null;
  platform: string | null;
  rank: string | null;
};

type TeamRow = {
  id: string;
  event_id: string;
  team_name: "A" | "B";
  members: string[];
  created_at: string | null;
};

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState<Map<string, PublicUser>>(new Map());
  const [savedTeams, setSavedTeams] = useState<Record<string, { A?: string[]; B?: string[] }>>({});

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        router.replace("/profile");
        return;
      }

      setMyUserId(data.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("ubisoft_nickname, platform")
        .eq("auth_user_id", data.user.id)
        .single();

      if (profileError || !profile?.ubisoft_nickname || !profile?.platform) {
        alert("Completa prima il profilo per accedere agli eventi.");
        router.replace("/profile");
        return;
      }

      await loadAll();
      setLoading(false);
    };

    init();
  }, [router]);

  const announceDiscord = async ({
    title,
    description,
    url,
    mention = "@everyone",
  }: {
    title: string;
    description: string;
    url?: string;
    mention?: "@everyone" | "@here" | "";
  }) => {
    const res = await fetch("/api/discord/announce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        url: url ?? `${window.location.origin}/events`,
        mention,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert("Errore invio Discord: " + (data?.details ?? data?.error ?? "unknown"));
      return false;
    }

    return true;
  };

  const loadAll = async () => {
    const { data: ev } = await supabase
      .from("events")
      .select("id,title,description,event_date,max_players,created_by,registrations_open,registrations_open_at")
      .order("event_date", { ascending: true });

    setEvents((ev as EventRow[]) ?? []);

    const { data: part } = await supabase.from("event_participants").select("*");
    const partRows = (part as ParticipantRow[]) ?? [];
    setParticipants(partRows);

    const uniqueUserIds = Array.from(new Set(partRows.map((p) => p.user_id)));
    if (uniqueUserIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("auth_user_id, discord_username, ubisoft_nickname, platform, rank")
        .in("auth_user_id", uniqueUserIds);

      const map = new Map<string, PublicUser>();
      (usersData ?? []).forEach((u: any) => {
        map.set(u.auth_user_id, u);
      });
      setUserMap(map);
    } else {
      setUserMap(new Map());
    }

    const { data: tData } = await supabase.from("event_teams").select("*");
    const teams = (tData as TeamRow[]) ?? [];
    const map: Record<string, { A?: string[]; B?: string[] }> = {};

    for (const t of teams) {
      if (!map[t.event_id]) map[t.event_id] = {};
      if (t.team_name === "A") map[t.event_id].A = t.members ?? [];
      if (t.team_name === "B") map[t.event_id].B = t.members ?? [];
    }

    setSavedTeams(map);
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

  const formatPlayerLabel = (p: ParticipantRow) => {
    const u = userMap.get(p.user_id);
    const discord = (u?.discord_username ?? "").trim();
    const ubi = (u?.ubisoft_nickname ?? "").trim();

    if (discord && ubi) return `${discord} — ${ubi}`;
    if (discord) return `${discord} — (Ubisoft non impostato)`;
    if (ubi) return `(Discord) — ${ubi}`;
    return "utente";
  };

  const joinEvent = async (event: EventRow) => {
    if (!event.registrations_open) {
      alert("Le iscrizioni non sono ancora aperte.");
      return;
    }

    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) {
      router.push("/profile");
      return;
    }

    const alreadyIn = (participantsByEvent.get(event.id) ?? []).some((p) => p.user_id === user.id);
    if (alreadyIn) {
      alert("Sei già iscritto a questo evento.");
      return;
    }

    const count = (participantsByEvent.get(event.id) ?? []).length;
    if (count >= event.max_players) {
      alert("Evento pieno.");
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
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
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

  const openRegistrations = async (event: EventRow) => {
    if (!myUserId || event.created_by !== myUserId) {
      alert("Solo chi ha creato l’evento può aprire le iscrizioni.");
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

    await announceDiscord({
      title: `🟢 Iscrizioni aperte: ${event.title}`,
      description:
        `Le iscrizioni sono ora aperte.\n\n` +
        `📅 Data: ${new Date(event.event_date).toLocaleString()}\n` +
        `👥 Max giocatori: ${event.max_players}\n\n` +
        `${event.description ? `💬 ${event.description}\n\n` : ""}` +
        `➡️ Entra sul sito e iscriviti all’evento.`,
      url: `${window.location.origin}/events`,
      mention: "@everyone",
    });

    await loadAll();
  };

  const generateAndSaveTeams = async (event: EventRow) => {
    const list = participantsByEvent.get(event.id) ?? [];

    if (list.length < 10) {
      alert("Servono almeno 10 partecipanti per creare 2 squadre da 5.");
      return;
    }

    const labels = list.map(formatPlayerLabel);
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

    await loadAll();
  };

  const publishTeamsToDiscord = async (event: EventRow) => {
    const teamA = savedTeams[event.id]?.A;
    const teamB = savedTeams[event.id]?.B;

    if (!teamA?.length || !teamB?.length) {
      alert("Prima genera e salva le squadre.");
      return;
    }

    await announceDiscord({
      title: `🏆 Squadre pronte: ${event.title}`,
      description:
        `📅 ${new Date(event.event_date).toLocaleString()}\n\n` +
        `🟦 TEAM A\n- ${teamA.join("\n- ")}\n\n` +
        `🟥 TEAM B\n- ${teamB.join("\n- ")}`,
      url: `${window.location.origin}/events`,
      mention: "",
    });
  };

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #444",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          ← Indietro
        </button>

        <p>Caricamento eventi...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <button
        onClick={() => router.back()}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #444",
          background: "rgba(255,255,255,0.05)",
          color: "white",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ← Indietro
      </button>

      <h1 style={{ marginTop: 0 }}>🎮 Eventi disponibili</h1>

      {events.length === 0 && <p>Nessun evento creato.</p>}

      {events.map((event) => {
        const list = participantsByEvent.get(event.id) ?? [];
        const count = list.length;
        const joined = isJoined(event.id);
        const full = count >= event.max_players;
        const isCreator = myUserId && event.created_by === myUserId;

        const teamA = savedTeams[event.id]?.A;
        const teamB = savedTeams[event.id]?.B;

        return (
          <div
            key={event.id}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: 20,
              marginTop: 20,
              maxWidth: 980,
              background: "rgba(255,255,255,0.03)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>{event.title}</h2>
            <p style={{ opacity: 0.9 }}>{event.description}</p>
            <p>📅 {new Date(event.event_date).toLocaleString()}</p>
            <p>
              🟢 Iscrizioni: <b>{event.registrations_open ? "APERTE" : "CHIUSE"}</b>
            </p>
            <p>
              👥 Iscritti: <b>{count}</b> / {event.max_players}
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              {!joined ? (
                <button onClick={() => joinEvent(event)} disabled={!event.registrations_open || full}>
                  {!event.registrations_open
                    ? "Iscrizioni chiuse"
                    : full
                    ? "Evento pieno"
                    : "Partecipa"}
                </button>
              ) : (
                <button onClick={() => leaveEvent(event.id)}>Annulla partecipazione</button>
              )}

              {isCreator && !event.registrations_open && (
                <button onClick={() => openRegistrations(event)}>
                  Apri iscrizioni + annuncio Discord
                </button>
              )}

              {isCreator && (
                <>
                  <button onClick={() => generateAndSaveTeams(event)}>Genera squadre</button>
                  <button onClick={() => publishTeamsToDiscord(event)}>Pubblica squadre su Discord</button>
                </>
              )}
            </div>

            {isCreator ? (
              <details style={{ marginTop: 16 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                  Vedi iscritti ({count})
                </summary>

                <ul style={{ marginTop: 12 }}>
                  {list.length === 0 ? (
                    <li>Nessun partecipante per ora.</li>
                  ) : (
                    list.map((p) => {
                      const u = userMap.get(p.user_id);
                      return (
                        <li key={p.id} style={{ marginBottom: 6 }}>
                          <b>{u?.discord_username ?? "utente"}</b>
                          {" — "}
                          Ubisoft: {u?.ubisoft_nickname ?? "non impostato"}
                          {" — "}
                          {u?.platform ?? ""}
                          {u?.rank ? ` (${u.rank})` : ""}
                          {p.user_id === myUserId ? <b> (tu)</b> : null}
                        </li>
                      );
                    })
                  )}
                </ul>
              </details>
            ) : (
              <p style={{ opacity: 0.68, marginTop: 16 }}>
                I nomi dei partecipanti sono visibili solo al moderatore dell’evento.
              </p>
            )}

            {(teamA || teamB) && (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Squadre</h3>

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