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

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [counts, setCounts] = useState<RegistrationCountMap>({});
  const [registered, setRegistered] = useState<RegisteredMap>({});
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

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
    setLoading(false);
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
          Partecipa agli eventi del server, entra nelle squadre e gioca con la community.
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
                  <div
                    style={{
                      marginTop: 12,
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
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}