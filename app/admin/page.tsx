"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAIL = "fmontis23@gmail.com";
const TEAM_SIZE = 5;

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  max_players: number;
  registrations_open: boolean;
  registrations_open_at: string | null;
};

type RegistrationItem = {
  event_id: string;
  user_id: string;
  created_at: string;
};

type ProfileItem = {
  id: string;
  email: string | null;
  display_name: string | null;
  ubisoft_name: string | null;
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

export default function AdminDashboard() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [generatingForEvent, setGeneratingForEvent] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

      const userEmail = data.user.email ?? "";
      const admin = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      setIsAdmin(admin);
      setCheckingAuth(false);

      if (admin) {
        loadData();
      }
    };

    checkAdmin();
  }, []);

  const loadData = async () => {
    setLoadingEvents(true);

    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(
        "id, title, description, event_date, max_players, registrations_open, registrations_open_at"
      )
      .order("event_date", { ascending: true });

    if (eventsError) {
      console.error("Errore caricamento eventi admin:", eventsError.message);
      setEvents([]);
      setRegistrations([]);
      setProfiles([]);
      setTeams([]);
      setTeamMembers([]);
      setLoadingEvents(false);
      return;
    }

    const eventsList = eventsData || [];
    setEvents(eventsList);

    if (eventsList.length === 0) {
      setRegistrations([]);
      setProfiles([]);
      setTeams([]);
      setTeamMembers([]);
      setLoadingEvents(false);
      return;
    }

    const eventIds = eventsList.map((event) => event.id);

    const { data: registrationsData, error: registrationsError } = await supabase
      .from("event_registrations")
      .select("event_id, user_id, created_at")
      .in("event_id", eventIds)
      .order("created_at", { ascending: true });

    if (registrationsError) {
      console.error(
        "Errore caricamento iscrizioni admin:",
        registrationsError.message
      );
      setRegistrations([]);
      setProfiles([]);
      setTeams([]);
      setTeamMembers([]);
      setLoadingEvents(false);
      return;
    }

    const registrationsList = registrationsData || [];
    setRegistrations(registrationsList);

    const uniqueUserIds = [...new Set(registrationsList.map((r) => r.user_id))];

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

    const { data: teamsData, error: teamsError } = await supabase
      .from("event_teams")
      .select("id, event_id, name")
      .in("event_id", eventIds);

    if (teamsError) {
      console.error("Errore caricamento team:", teamsError.message);
      setTeams([]);
      setTeamMembers([]);
      setLoadingEvents(false);
      return;
    }

    const teamsList = teamsData || [];
    setTeams(teamsList);

    if (teamsList.length > 0) {
      const teamIds = teamsList.map((team) => team.id);

      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from("event_team_members")
        .select("id, team_id, user_id")
        .in("team_id", teamIds);

      if (teamMembersError) {
        console.error("Errore caricamento membri team:", teamMembersError.message);
        setTeamMembers([]);
      } else {
        setTeamMembers(teamMembersData || []);
      }
    } else {
      setTeamMembers([]);
    }

    setLoadingEvents(false);
  };

  const getProfile = (userId: string) => {
    return profiles.find((profile) => profile.id === userId);
  };

  const openRegistrations = async (eventId: string, eventTitle: string) => {
    const { error } = await supabase
      .from("events")
      .update({ registrations_open: true })
      .eq("id", eventId);

    if (error) {
      alert("Errore apertura iscrizioni: " + error.message);
      return;
    }

    await fetch("/api/discord/announce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          `🟢 **Iscrizioni aperte!**\n` +
          `🎮 **${eventTitle}**\n` +
          `➡️ Vai agli eventi: https://gaming-hub-lime.vercel.app/events`,
      }),
    });

    alert("Iscrizioni aperte ✅");
    loadData();
  };

  const shuffleArray = (array: string[]) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const generateTeams = async (eventId: string, eventTitle: string) => {
    const eventRegistrations = registrations.filter((r) => r.event_id === eventId);

    if (eventRegistrations.length < TEAM_SIZE) {
      alert(`Servono almeno ${TEAM_SIZE} iscritti per generare una squadra.`);
      return;
    }

    setGeneratingForEvent(eventId);

    const userIds = eventRegistrations.map((r) => r.user_id);
    const shuffledUserIds = shuffleArray(userIds);

    const existingTeams = teams.filter((team) => team.event_id === eventId);
    const existingTeamIds = existingTeams.map((team) => team.id);

    if (existingTeamIds.length > 0) {
      await supabase.from("event_team_members").delete().in("team_id", existingTeamIds);
      await supabase.from("event_teams").delete().in("id", existingTeamIds);
    }

    const teamChunks: string[][] = [];
    for (let i = 0; i < shuffledUserIds.length; i += TEAM_SIZE) {
      teamChunks.push(shuffledUserIds.slice(i, i + TEAM_SIZE));
    }

    const teamNames = teamChunks.map((_, index) => `Team ${String.fromCharCode(65 + index)}`);

    const { data: insertedTeams, error: teamsInsertError } = await supabase
      .from("event_teams")
      .insert(
        teamNames.map((name) => ({
          event_id: eventId,
          name,
        }))
      )
      .select("id, event_id, name");

    if (teamsInsertError || !insertedTeams) {
      setGeneratingForEvent(null);
      alert("Errore creazione squadre: " + (teamsInsertError?.message || "unknown"));
      return;
    }

    const membersToInsert = insertedTeams.flatMap((team, index) =>
      teamChunks[index].map((userId) => ({
        team_id: team.id,
        user_id: userId,
      }))
    );

    const { error: membersInsertError } = await supabase
      .from("event_team_members")
      .insert(membersToInsert);

    setGeneratingForEvent(null);

    if (membersInsertError) {
      alert("Errore salvataggio membri squadre: " + membersInsertError.message);
      return;
    }

    await fetch("/api/discord/announce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          `⚔️ **Squadre generate!**\n` +
          `🎮 **${eventTitle}**\n` +
          `👥 Team creati: **${insertedTeams.length}**\n` +
          `➡️ Vai agli eventi: https://gaming-hub-lime.vercel.app/events`,
      }),
    });

    alert("Squadre generate ✅");
    loadData();
  };

  const sendTestDiscordMessage = async () => {
    const res = await fetch("/api/discord/announce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "🚨 Evento di Test",
        description:
          "Le iscrizioni per il torneo **Rainbow Six Siege 5v5** sono aperte!\n\n📅 Oggi alle 21:00\n👥 10 posti disponibili\n\nIscriviti subito!",
        url: "https://gaming-hub-lime.vercel.app/events",
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert("Errore Discord: " + (data?.details || data?.error || "unknown"));
      return;
    }

    alert("Messaggio Discord inviato ✅");
  };

  if (checkingAuth) {
    return (
      <main style={{ padding: 24 }}>
        <p>Controllo accesso moderatore...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={backButtonStyle}>
          ← Indietro
        </button>

        <div style={panelStyle}>
          <h1 style={{ marginTop: 0 }}>Accesso riservato</h1>
          <p style={{ opacity: 0.85 }}>
            Questa area moderatore è disponibile solo per l&apos;account autorizzato.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <button onClick={() => router.back()} style={backButtonStyle}>
        ← Indietro
      </button>

      <h1 style={{ marginTop: 0 }}>🛠 Dashboard Moderatore</h1>
      <p style={{ opacity: 0.85 }}>
        Area privata moderatore. Da qui gestisci eventi, iscrizioni, squadre e annunci Discord.
      </p>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <a href="/create-event" style={card()}>
          <b>➕ Crea Evento</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Crea un nuovo evento e invia l&apos;annuncio su Discord
          </div>
        </a>

        <a href="/events" style={card()}>
          <b>🎮 Eventi pubblici</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Controlla come gli utenti vedono gli eventi
          </div>
        </a>

        <a href="/deals" style={card()}>
          <b>🎁 Deals pubblici</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Controlla i giochi gratis e le offerte sul sito
          </div>
        </a>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={sendTestDiscordMessage} style={actionButtonStyle}>
          Invia test Discord
        </button>
      </div>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 16 }}>📅 Eventi creati</h2>

        {loadingEvents ? (
          <div style={panelStyle}>
            <p>Caricamento eventi...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={panelStyle}>
            <p>Nessun evento creato al momento.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {events.map((event) => {
              const eventRegistrations = registrations.filter(
                (registration) => registration.event_id === event.id
              );

              const eventTeams = teams.filter((team) => team.event_id === event.id);

              return (
                <div key={event.id} style={panelStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <strong>{event.title}</strong>
                    <span
                      style={{
                        color: event.registrations_open ? "#4ade80" : "#facc15",
                        fontWeight: 700,
                      }}
                    >
                      {event.registrations_open ? "Aperte" : "Chiuse"}
                    </span>
                  </div>

                  {event.description && (
                    <p style={{ opacity: 0.85 }}>{event.description}</p>
                  )}

                  <p style={{ opacity: 0.85 }}>
                    📅 {new Date(event.event_date).toLocaleString()}
                  </p>

                  <p style={{ opacity: 0.85 }}>
                    👥 Iscritti: {eventRegistrations.length}/{event.max_players}
                  </p>

                  {event.registrations_open_at && (
                    <p style={{ opacity: 0.85 }}>
                      🟡 Apertura iscrizioni:{" "}
                      {new Date(event.registrations_open_at).toLocaleString()}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                    {!event.registrations_open && (
                      <button
                        onClick={() => openRegistrations(event.id, event.title)}
                        style={smallButtonStyle}
                      >
                        Apri iscrizioni
                      </button>
                    )}

                    <button
                      onClick={() => generateTeams(event.id, event.title)}
                      disabled={generatingForEvent === event.id}
                      style={smallButtonStyle}
                    >
                      {generatingForEvent === event.id
                        ? "Generazione..."
                        : "Genera squadre"}
                    </button>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <strong>Iscritti</strong>

                    {eventRegistrations.length === 0 ? (
                      <p style={{ opacity: 0.7, marginTop: 8 }}>
                        Nessun iscritto per ora.
                      </p>
                    ) : (
                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        {eventRegistrations.map((registration, index) => {
                          const profile = getProfile(registration.user_id);

                          return (
                            <div
                              key={`${registration.event_id}-${registration.user_id}`}
                              style={subCardStyle}
                            >
                              <div style={{ fontWeight: 700 }}>
                                {profile?.display_name || `Giocatore #${index + 1}`}
                              </div>

                              <div style={{ opacity: 0.75, marginTop: 4 }}>
                                Email: {profile?.email || registration.user_id}
                              </div>

                              <div style={{ opacity: 0.75, marginTop: 4 }}>
                                Ubisoft: {profile?.ubisoft_name || "Non impostato"}
                              </div>

                              <div style={{ opacity: 0.75, marginTop: 4 }}>
                                Iscritto il:{" "}
                                {new Date(registration.created_at).toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <strong>Squadre</strong>

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
                            <div key={team.id} style={subCardStyle}>
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
      </section>
    </main>
  );
}

const backButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #444",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  cursor: "pointer",
  marginBottom: 16,
};

const actionButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid #444",
  cursor: "pointer",
};

const smallButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #444",
  cursor: "pointer",
};

const panelStyle: React.CSSProperties = {
  border: "1px solid #444",
  borderRadius: 14,
  padding: 20,
  background: "rgba(255,255,255,0.02)",
};

const subCardStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid #333",
};

function card(): React.CSSProperties {
  return {
    border: "1px solid #444",
    borderRadius: 14,
    padding: 14,
    textDecoration: "none",
    color: "inherit",
    background: "rgba(255,255,255,0.02)",
  };
}