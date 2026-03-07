"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  max_players: number;
  registrations_open: boolean;
  registrations_open_at: string | null;
};

type RegistrationCountMap = {
  [eventId: string]: number;
};

type RegisteredMap = {
  [eventId: string]: boolean;
};

type TeamItem = {
  id: string;
  event_id: string;
  name: string;
};

type TeamMemberItem = {
  id: string;
  team_id: string;
  user_id: string;
};

type ProfileItem = {
  id: string;
  email: string | null;
  display_name: string | null;
  ubisoft_name: string | null;
};

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [counts, setCounts] = useState<RegistrationCountMap>({});
  const [registered, setRegistered] = useState<RegisteredMap>({});
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    if (user?.id) {
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) {
        console.error("Errore controllo admin:", adminError.message);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!adminData);
      }
    } else {
      setIsAdmin(false);
    }

    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(
        "id, title, description, event_date, max_players, registrations_open, registrations_open_at"
      )
      .order("event_date", { ascending: true });

    if (eventsError) {
      console.error("Errore caricamento eventi:", eventsError.message);
      setEvents([]);
      setLoading(false);
      return;
    }

    const eventsList = eventsData || [];
    setEvents(eventsList);

    const eventIds = eventsList.map((event) => event.id);

    if (eventIds.length === 0) {
      setCounts({});
      setRegistered({});
      setTeams([]);
      setTeamMembers([]);
      setProfiles([]);
      setLoading(false);
      return;
    }

    const { data: registrationsData, error: registrationsError } = await supabase
      .from("event_registrations")
      .select("event_id, user_id")
      .in("event_id", eventIds);

    if (registrationsError) {
      console.error("Errore caricamento iscrizioni:", registrationsError.message);
      setCounts({});
      setRegistered({});
      setLoading(false);
      return;
    }

    const nextCounts: RegistrationCountMap = {};
    const nextRegistered: RegisteredMap = {};

    for (const event of eventsList) {
      nextCounts[event.id] = 0;
      nextRegistered[event.id] = false;
    }

    for (const row of registrationsData || []) {
      nextCounts[row.event_id] = (nextCounts[row.event_id] || 0) + 1;

      if (user?.id && row.user_id === user.id) {
        nextRegistered[row.event_id] = true;
      }
    }

    setCounts(nextCounts);
    setRegistered(nextRegistered);

    const { data: teamsData, error: teamsError } = await supabase
      .from("event_teams")
      .select("id, event_id, name")
      .in("event_id", eventIds);

    if (teamsError) {
      console.error("Errore caricamento team:", teamsError.message);
      setTeams([]);
      setTeamMembers([]);
      setProfiles([]);
      setLoading(false);
      return;
    }

    const teamsList = teamsData || [];
    setTeams(teamsList);

    if (teamsList.length === 0) {
      setTeamMembers([]);
      setProfiles([]);
      setLoading(false);
      return;
    }

    const teamIds = teamsList.map((team) => team.id);

    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from("event_team_members")
      .select("id, team_id, user_id")
      .in("team_id", teamIds);

    if (teamMembersError) {
      console.error("Errore caricamento membri team:", teamMembersError.message);
      setTeamMembers([]);
      setProfiles([]);
      setLoading(false);
      return;
    }

    const membersList = teamMembersData || [];
    setTeamMembers(membersList);

    const uniqueUserIds = [...new Set(membersList.map((m) => m.user_id))];

    if (uniqueUserIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, display_name, ubisoft_name")
        .in("id", uniqueUserIds);

      if (profilesError) {
        console.error("Errore caricamento profili:", profilesError.message);
        setProfiles([]);
      } else {
        setProfiles(profilesData || []);
      }
    } else {
      setProfiles([]);
    }

    setLoading(false);
  };

  const getProfile = (userIdValue: string) => {
    return profiles.find((profile) => profile.id === userIdValue);
  };

  const joinEvent = async (eventId: string) => {
    if (!userId) {
      alert("Devi prima fare login con Discord.");
      return;
    }

    setJoiningId(eventId);

    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      user_id: userId,
    });

    setJoiningId(null);

    if (error) {
      alert("Errore iscrizione: " + error.message);
      return;
    }

    alert("Iscrizione completata ✅");
    loadAll();
  };

  const leaveEvent = async (eventId: string) => {
    if (!userId) {
      alert("Devi prima fare login con Discord.");
      return;
    }

    setLeavingId(eventId);

    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    setLeavingId(null);

    if (error) {
      alert("Errore disiscrizione: " + error.message);
      return;
    }

    alert("Disiscrizione completata");
    loadAll();
  };

  const generateTeams = async (eventId: string) => {
    setGeneratingId(eventId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/events/generate-teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore durante la generazione squadre");
        return;
      }

      alert(data.message || "Squadre generate con successo ✅");
      await loadAll();
    } catch (error) {
      alert("Errore durante la generazione squadre");
      console.error(error);
    } finally {
      setGeneratingId(null);
    }
  };

  const resetTeams = async (eventId: string) => {
    const confirmed = window.confirm(
      "Sei sicuro di voler resettare le squadre di questo evento?"
    );

    if (!confirmed) return;

    setResettingId(eventId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/events/reset-teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore durante il reset squadre");
        return;
      }

      alert(data.message || "Squadre resettate con successo ✅");
      await loadAll();
    } catch (error) {
      alert("Errore durante il reset squadre");
      console.error(error);
    } finally {
      setResettingId(null);
    }
  };

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

      <section style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 36, marginBottom: 10 }}>📅 Eventi Community</h1>

        <p style={{ color: "#b8b8d0", marginBottom: 20 }}>
          Partecipa agli eventi del server, entra nelle squadre e gioca con la
          community.
        </p>
      </section>

      {loading ? (
        <div
          style={{
            background: "#171726",
            borderRadius: 18,
            padding: 40,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p>Caricamento eventi...</p>
        </div>
      ) : events.length === 0 ? (
        <div
          style={{
            background: "#171726",
            borderRadius: 18,
            padding: 40,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2>Nessun evento disponibile</h2>

          <p style={{ color: "#b8b8d0", marginTop: 10 }}>
            Al momento non ci sono eventi pubblicati. Torna presto oppure entra
            nel Discord per restare aggiornato.
          </p>

          <div style={{ marginTop: 20 }}>
            <a
              href="https://discord.gg/4NrqDfgP"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#5865f2",
                padding: "12px 24px",
                borderRadius: 10,
                color: "white",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Entra nel Discord
            </a>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 24,
          }}
        >
          {events.map((event) => {
            const currentCount = counts[event.id] || 0;
            const isRegistered = registered[event.id] || false;
            const isFull = currentCount >= event.max_players;
            const eventTeams = teams.filter((team) => team.event_id === event.id);
            const hasTeams = eventTeams.length > 0;
            const canGenerate =
              isAdmin && currentCount >= 2 && !hasTeams;
            const canReset = isAdmin && hasTeams;

            return (
              <div
                key={event.id}
                style={{
                  background: "#171726",
                  borderRadius: 16,
                  padding: 20,
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    gap: 10,
                  }}
                >
                  <span style={{ color: "#9aa4ff", fontWeight: "bold" }}>
                    Evento
                  </span>

                  <span
                    style={{
                      color: event.registrations_open ? "#4ade80" : "#facc15",
                      fontWeight: "bold",
                    }}
                  >
                    {event.registrations_open ? "Iscrizioni aperte" : "In attesa"}
                  </span>
                </div>

                <h3 style={{ marginTop: 0 }}>{event.title}</h3>

                {event.description && (
                  <p style={{ color: "#b8b8d0", lineHeight: 1.5 }}>
                    {event.description}
                  </p>
                )}

                <p style={{ color: "#b8b8d0", marginTop: 12 }}>
                  📅 {new Date(event.event_date).toLocaleString()}
                </p>

                <p style={{ color: "#b8b8d0" }}>
                  👥 Iscritti: {currentCount}/{event.max_players}
                </p>

                {event.registrations_open_at && (
                  <p style={{ color: "#b8b8d0" }}>
                    🟡 Apertura iscrizioni:{" "}
                    {new Date(event.registrations_open_at).toLocaleString()}
                  </p>
                )}

                {!event.registrations_open ? (
                  <div
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "10px",
                      borderRadius: 10,
                      background: "#333",
                      color: "#ddd",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Iscrizioni non ancora aperte
                  </div>
                ) : isRegistered ? (
                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    <div
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 10,
                        background: "#14532d",
                        color: "#bbf7d0",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      Sei iscritto ✅
                    </div>

                    <button
                      onClick={() => leaveEvent(event.id)}
                      disabled={leavingId === event.id}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 10,
                        border: "1px solid #444",
                        background: "#2b2b35",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      {leavingId === event.id ? "Disiscrizione..." : "Disiscriviti"}
                    </button>
                  </div>
                ) : isFull ? (
                  <div
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "10px",
                      borderRadius: 10,
                      background: "#3f3f46",
                      color: "#e4e4e7",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Evento pieno
                  </div>
                ) : (
                  <button
                    onClick={() => joinEvent(event.id)}
                    disabled={joiningId === event.id}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "10px",
                      borderRadius: 10,
                      border: "none",
                      background: "#5865f2",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    {joiningId === event.id ? "Iscrizione..." : "Partecipa"}
                  </button>
                )}

                <div style={{ marginTop: 16 }}>
                  <strong>Squadre</strong>

                  {isAdmin && (
                    <div
                      style={{
                        marginTop: 10,
                        marginBottom: 10,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => generateTeams(event.id)}
                        disabled={!canGenerate || generatingId === event.id}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "none",
                          background: "#7c3aed",
                          color: "white",
                          cursor: canGenerate ? "pointer" : "not-allowed",
                          fontWeight: 700,
                          opacity:
                            !canGenerate || generatingId === event.id ? 0.6 : 1,
                        }}
                      >
                        {generatingId === event.id
                          ? "Generazione..."
                          : "Genera squadre"}
                      </button>

                      <button
                        onClick={() => resetTeams(event.id)}
                        disabled={!canReset || resettingId === event.id}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "none",
                          background: "#dc2626",
                          color: "white",
                          cursor: canReset ? "pointer" : "not-allowed",
                          fontWeight: 700,
                          opacity:
                            !canReset || resettingId === event.id ? 0.6 : 1,
                        }}
                      >
                        {resettingId === event.id
                          ? "Reset..."
                          : "Reset squadre"}
                      </button>
                    </div>
                  )}

                  {eventTeams.length === 0 ? (
                    <p style={{ opacity: 0.7, marginTop: 8 }}>
                      Nessuna squadra generata.
                    </p>
                  ) : (
                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                      {eventTeams.map((team) => {
                        const members = teamMembers.filter(
                          (member) => member.team_id === team.id
                        );

                        return (
                          <div
                            key={team.id}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 10,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid #333",
                            }}
                          >
                            <div style={{ fontWeight: 700, marginBottom: 8 }}>
                              {team.name}
                            </div>

                            {members.length === 0 ? (
                              <div style={{ opacity: 0.7 }}>Nessun membro</div>
                            ) : (
                              <div style={{ display: "grid", gap: 6 }}>
                                {members.map((member, index) => {
                                  const profile = getProfile(member.user_id);

                                  return (
                                    <div key={member.id} style={{ opacity: 0.85 }}>
                                      {index + 1}.{" "}
                                      {profile?.ubisoft_name ||
                                        profile?.display_name ||
                                        profile?.email ||
                                        member.user_id}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}