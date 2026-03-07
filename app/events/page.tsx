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

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, description, event_date, max_players, registrations_open, registrations_open_at"
        )
        .order("event_date", { ascending: true });

      if (error) {
        console.error("Errore caricamento eventi:", error.message);
        setEvents([]);
        setLoading(false);
        return;
      }

      setEvents(data || []);
      setLoading(false);
    };

    loadEvents();
  }, []);

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
          {events.map((event) => (
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
                👥 Max giocatori: {event.max_players}
              </p>

              {event.registrations_open_at && (
                <p style={{ color: "#b8b8d0" }}>
                  🟡 Apertura iscrizioni:{" "}
                  {new Date(event.registrations_open_at).toLocaleString()}
                </p>
              )}

              <button
                disabled={!event.registrations_open}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: event.registrations_open ? "#5865f2" : "#333",
                  color: "white",
                  cursor: event.registrations_open ? "pointer" : "not-allowed",
                }}
              >
                {event.registrations_open
                  ? "Partecipa"
                  : "Iscrizioni non ancora aperte"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}