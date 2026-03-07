"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAIL = "fmontis23@gmail.com";

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

export default function AdminDashboard() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

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
      setLoadingEvents(false);
      return;
    }

    const eventsList = eventsData || [];
    setEvents(eventsList);

    if (eventsList.length === 0) {
      setRegistrations([]);
      setProfiles([]);
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
      setLoadingEvents(false);
      return;
    }

    const registrationsList = registrationsData || [];
    setRegistrations(registrationsList);

    const uniqueUserIds = [...new Set(registrationsList.map((r) => r.user_id))];

    if (uniqueUserIds.length === 0) {
      setProfiles([]);
      setLoadingEvents(false);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, display_name, ubisoft_name")
      .in("id", uniqueUserIds);

    if (profilesError) {
      console.error("Errore caricamento profili:", profilesError.message);
      setProfiles([]);
      setLoadingEvents(false);
      return;
    }

    setProfiles(profilesData || []);
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
        Area privata moderatore. Da qui gestisci eventi, iscrizioni e annunci Discord.
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

                  {!event.registrations_open && (
                    <button
                      onClick={() => openRegistrations(event.id, event.title)}
                      style={{
                        marginTop: 12,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #444",
                        cursor: "pointer",
                      }}
                    >
                      Apri iscrizioni
                    </button>
                  )}

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
                              style={{
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid #333",
                              }}
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

const panelStyle: React.CSSProperties = {
  border: "1px solid #444",
  borderRadius: 14,
  padding: 20,
  background: "rgba(255,255,255,0.02)",
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