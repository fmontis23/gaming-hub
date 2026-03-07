"use client";

import { useRouter } from "next/navigation";
import { events } from "../../data/events";

export default function EventsPage() {
  const router = useRouter();

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
      </section>

      {events.length === 0 ? (
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
                }}
              >
                <span style={{ color: "#9aa4ff", fontWeight: "bold" }}>
                  {event.game}
                </span>

                <span
                  style={{
                    color: event.status === "Aperto" ? "#4ade80" : "#f87171",
                    fontWeight: "bold",
                  }}
                >
                  {event.status}
                </span>
              </div>

              <h3>{event.title}</h3>

              <p style={{ color: "#b8b8d0" }}>{event.date}</p>

              <p style={{ color: "#b8b8d0" }}>Posti: {event.slots}</p>

              <button
                disabled={event.status !== "Aperto"}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background:
                    event.status === "Aperto" ? "#5865f2" : "#333",
                  color: "white",
                  cursor:
                    event.status === "Aperto" ? "pointer" : "not-allowed",
                }}
              >
                {event.status === "Aperto"
                  ? "Partecipa"
                  : "Evento pieno"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}