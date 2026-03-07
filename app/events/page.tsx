"use client";

import { useRouter } from "next/navigation";
import { events } from "../../data/events";

export default function EventsPage() {
  const router = useRouter();

  return (
    <main className="events-page" style={{ padding: 40 }}>
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

      <section className="events-hero">
        <h1 className="events-title">📅 Eventi Community</h1>

        <p className="events-subtitle">
          Partecipa agli eventi del server, entra nelle squadre e gioca con la community.
        </p>

        <div style={{ marginTop: 20 }}>
          <a
            href="/create-event"
            style={{
              display: "inline-block",
              background: "#5865f2",
              color: "white",
              padding: "12px 22px",
              borderRadius: 10,
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            + Crea Evento
          </a>
        </div>
      </section>

      {events.length === 0 ? (
        <section style={{ marginTop: 40 }}>
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
        </section>
      ) : (
        <section className="events-grid" style={{ marginTop: 40 }}>
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-top">
                <span className="event-game">{event.game}</span>
                <span
                  className={
                    event.status === "Aperto"
                      ? "event-status open"
                      : "event-status full"
                  }
                >
                  {event.status}
                </span>
              </div>

              <h2 className="event-title">{event.title}</h2>
              <p className="event-date">{event.date}</p>
              <p className="event-slots">Posti: {event.slots}</p>

              <button
                className={
                  event.status === "Aperto"
                    ? "event-button"
                    : "event-button disabled"
                }
                disabled={event.status !== "Aperto"}
              >
                {event.status === "Aperto" ? "Partecipa" : "Evento pieno"}
              </button>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}