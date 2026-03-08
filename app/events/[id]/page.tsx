"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  max_players: number;
  registrations_open: boolean;
  registrations_open_at: string | null;
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

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!eventId) return;
    loadEventPage();
  }, [eventId]);

  useEffect(() => {
    if (!event?.event_date) return;

    const updateCountdown = () => {
      setCountdown(getCountdownLabel(event.event_date));
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event]);

  const loadEventPage = async () => {
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

    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select(
        "id, title, description, event_date, max_players, registrations_open, registrations_open_at"
      )
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      console.error("Errore caricamento evento:", eventError.message);
      setEvent(null);
      setLoading(false);
      return;
    }

    if (!eventData) {
      setEvent(null);
      setLoading(false);
      return;
    }

    setEvent(eventData);

    const { data: registrationsData, error: registrationsError } = await supabase
      .from("event_registrations")
      .select("event_id, user_id")
      .eq("event_id", eventId);

    if (registrationsError) {
      console.error("Errore caricamento iscrizioni:", registrationsError.message);
      setCurrentCount(0);
      setIsRegistered(false);
      setLoading(false);
      return;
    }

    const registrationsList = registrationsData || [];
    setCurrentCount(registrationsList.length);
    setIsRegistered(
      !!user?.id && registrationsList.some((row) => row.user_id === user.id)
    );

    const { data: teamsData, error: teamsError } = await supabase
      .from("event_teams")
      .select("id, event_id, name")
      .eq("event_id", eventId);

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

  const joinEvent = async () => {
    if (!userId) {
      alert("Devi prima fare login con Discord.");
      return;
    }

    if (!event) return;

    setJoining(true);

    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      user_id: userId,
    });

    setJoining(false);

    if (error) {
      alert("Errore iscrizione: " + error.message);
      return;
    }

    alert("Iscrizione completata ✅");
    await loadEventPage();
  };

  const leaveEvent = async () => {
    if (!userId) {
      alert("Devi prima fare login con Discord.");
      return;
    }

    if (!event) return;

    try {
      setLeaving(true);

      const { data, error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", userId)
        .select();

      if (error) {
        console.error("Errore disiscrizione:", error);
        alert("Errore disiscrizione: " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert("Nessuna iscrizione trovata da rimuovere.");
        return;
      }

      alert("Disiscrizione completata ✅");
      await loadEventPage();
    } catch (error) {
      console.error("Errore durante la disiscrizione:", error);
      alert("Errore durante la disiscrizione.");
    } finally {
      setLeaving(false);
    }
  };

  const generateTeams = async () => {
    if (!event) return;

    setGenerating(true);

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
        body: JSON.stringify({ eventId: event.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore durante la generazione squadre");
        return;
      }

      alert(data.message || "Squadre generate con successo ✅");
      await loadEventPage();
    } catch (error) {
      console.error(error);
      alert("Errore durante la generazione squadre");
    } finally {
      setGenerating(false);
    }
  };

  const resetTeams = async () => {
    if (!event) return;

    const confirmed = window.confirm(
      "Sei sicuro di voler resettare le squadre di questo evento?"
    );

    if (!confirmed) return;

    setResetting(true);

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
        body: JSON.stringify({ eventId: event.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Errore durante il reset squadre");
        return;
      }

      alert(data.message || "Squadre resettate con successo ✅");
      await loadEventPage();
    } catch (error) {
      console.error(error);
      alert("Errore durante il reset squadre");
    } finally {
      setResetting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCountdownLabel = (eventDate: string) => {
    const now = new Date().getTime();
    const start = new Date(eventDate).getTime();
    const eventDurationMs = 4 * 60 * 60 * 1000;
    const end = start + eventDurationMs;

    if (now < start) {
      const diff = start - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        return `Inizia tra ${days}g ${hours}h ${minutes}m ${seconds}s`;
      }

      return `Inizia tra ${hours}h ${minutes}m ${seconds}s`;
    }

    if (now >= start && now <= end) {
      return "Evento iniziato";
    }

    return "Evento terminato";
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 40,
          background:
            "radial-gradient(circle at top, rgba(88,101,242,0.20), transparent 30%), linear-gradient(180deg, #0a0a12 0%, #11111b 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            background: "#171726",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          Caricamento evento...
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 40,
          background:
            "radial-gradient(circle at top, rgba(88,101,242,0.20), transparent 30%), linear-gradient(180deg, #0a0a12 0%, #11111b 100%)",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              cursor: "pointer",
              marginBottom: 20,
              fontWeight: 700,
            }}
          >
            ← Indietro
          </button>

          <div
            style={{
              background: "#171726",
              borderRadius: 20,
              padding: 40,
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2>Evento non trovato</h2>
            <p style={{ color: "#b8b8d0" }}>
              L’evento richiesto non esiste oppure non è più disponibile.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isFull = currentCount >= event.max_players;
  const hasTeams = teams.length > 0;
  const canGenerate = isAdmin && !hasTeams;
  const canReset = isAdmin && hasTeams;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 40,
        background:
          "radial-gradient(circle at top, rgba(88,101,242,0.20), transparent 30%), linear-gradient(180deg, #0a0a12 0%, #11111b 100%)",
        color: "white",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            cursor: "pointer",
            marginBottom: 20,
            fontWeight: 700,
          }}
        >
          ← Indietro
        </button>

        <section
          style={{
            marginBottom: 24,
            padding: 28,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(135deg, rgba(88,101,242,0.16), rgba(124,58,237,0.10))",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(88,101,242,0.18)",
              color: "#c7d2fe",
              fontWeight: 700,
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            EVENTO COMMUNITY
          </div>

          <h1 style={{ fontSize: 42, margin: 0, marginBottom: 10 }}>
            {event.title}
          </h1>

          <p
            style={{
              color: "#c7c9e0",
              margin: 0,
              maxWidth: 780,
              lineHeight: 1.7,
              fontSize: 17,
            }}
          >
            {event.description || "Dettagli evento disponibili nella community."}
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(23,23,38,0.98), rgba(14,14,24,0.98))",
              borderRadius: 22,
              padding: 22,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 12,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                padding: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 18,
              }}
            >
              <p style={{ color: "#d4d4f7", margin: 0 }}>
                📅 <strong>Data:</strong> {formatDate(event.event_date)}
              </p>

              <p style={{ color: "#d4d4f7", margin: 0 }}>
                👥 <strong>Iscritti:</strong> {currentCount}/{event.max_players}
              </p>

              <p style={{ color: "#d4d4f7", margin: 0 }}>
                ⏳ <strong>Stato:</strong> {countdown}
              </p>

              {event.registrations_open_at && (
                <p style={{ color: "#d4d4f7", margin: 0 }}>
                  🟡 <strong>Apertura:</strong>{" "}
                  {formatDate(event.registrations_open_at)}
                </p>
              )}
            </div>

            {!event.registrations_open ? (
              <div
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  background: "#333",
                  color: "#ddd",
                  textAlign: "center",
                  fontWeight: 700,
                  marginBottom: 18,
                }}
              >
                Iscrizioni non ancora aperte
              </div>
            ) : isRegistered ? (
              <div style={{ marginBottom: 18, display: "grid", gap: 10 }}>
                <div
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    background: "#14532d",
                    color: "#bbf7d0",
                    textAlign: "center",
                    fontWeight: 800,
                  }}
                >
                  Sei iscritto ✅
                </div>

                <button
                  onClick={leaveEvent}
                  disabled={leaving}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    border: "1px solid #444",
                    background: "#2b2b35",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {leaving ? "Disiscrizione..." : "Disiscriviti"}
                </button>
              </div>
            ) : isFull ? (
              <div
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  background: "#3f3f46",
                  color: "#e4e4e7",
                  textAlign: "center",
                  fontWeight: 800,
                  marginBottom: 18,
                }}
              >
                Evento pieno
              </div>
            ) : (
              <button
                onClick={joinEvent}
                disabled={joining}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(90deg, #5865f2, #7c3aed)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                  boxShadow: "0 10px 30px rgba(88,101,242,0.35)",
                  marginBottom: 18,
                }}
              >
                {joining ? "Iscrizione..." : "Partecipa"}
              </button>
            )}

            <div
              style={{
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <strong style={{ fontSize: 20 }}>Squadre</strong>

              {isAdmin && (
                <div
                  style={{
                    marginTop: 12,
                    marginBottom: 16,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={generateTeams}
                    disabled={!canGenerate || generating}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: "#7c3aed",
                      color: "white",
                      cursor: canGenerate ? "pointer" : "not-allowed",
                      fontWeight: 800,
                      opacity: !canGenerate || generating ? 0.6 : 1,
                    }}
                  >
                    {generating ? "Generazione..." : "Genera squadre"}
                  </button>

                  <button
                    onClick={resetTeams}
                    disabled={!canReset || resetting}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: "#dc2626",
                      color: "white",
                      cursor: canReset ? "pointer" : "not-allowed",
                      fontWeight: 800,
                      opacity: !canReset || resetting ? 0.6 : 1,
                    }}
                  >
                    {resetting ? "Reset..." : "Reset squadre"}
                  </button>
                </div>
              )}

              {teams.length === 0 ? (
                <p style={{ opacity: 0.75, marginTop: 12 }}>
                  Nessuna squadra generata.
                </p>
              ) : (
                <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                  {teams.map((team) => {
                    const members = teamMembers.filter(
                      (member) => member.team_id === team.id
                    );

                    return (
                      <div
                        key={team.id}
                        style={{
                          padding: "14px",
                          borderRadius: 14,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            marginBottom: 10,
                            fontSize: 16,
                            color: "#c4b5fd",
                          }}
                        >
                          {team.name}
                        </div>

                        {members.length === 0 ? (
                          <div style={{ opacity: 0.7 }}>Nessun membro</div>
                        ) : (
                          <div style={{ display: "grid", gap: 8 }}>
                            {members.map((member, index) => {
                              const profile = getProfile(member.user_id);

                              return (
                                <div
                                  key={member.id}
                                  style={{
                                    opacity: 0.92,
                                    padding: "8px 10px",
                                    borderRadius: 10,
                                    background: "rgba(255,255,255,0.03)",
                                  }}
                                >
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

          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(23,23,38,0.98), rgba(14,14,24,0.98))",
              borderRadius: 22,
              padding: 22,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: event.registrations_open
                  ? "rgba(34,197,94,0.14)"
                  : "rgba(239,68,68,0.14)",
                color: event.registrations_open ? "#86efac" : "#fca5a5",
                fontWeight: 700,
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              {event.registrations_open ? "ISCRIZIONI APERTE" : "ISCRIZIONI CHIUSE"}
            </div>

            <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
              Info rapide
            </h3>

            <div style={{ display: "grid", gap: 12, color: "#d4d4f7" }}>
              <div>🎮 Evento community organizzato tramite Gaming Hub</div>
              <div>👥 Massimo giocatori: {event.max_players}</div>
              <div>📍 Gestione squadre direttamente dal sito</div>
              <div>💬 Annunci e aggiornamenti anche via Discord</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}