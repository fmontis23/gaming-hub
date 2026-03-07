export default function EventsPage() {
  const events: {
    id: number;
    title: string;
    game: string;
    date: string;
    slots: string;
    status: string;
  }[] = [];

  return (
    <main className="events-page">
      <section className="events-hero">
        <h1 className="events-title">📅 Eventi Community</h1>

        <p className="events-subtitle">
          Partecipa agli eventi del server, entra nelle squadre e gioca con la community.
        </p>

        <div className="events-create">
          <a href="/create-event" className="create-event-button">
            + Crea Evento
          </a>
        </div>
      </section>

      {events.length === 0 ? (
        <section className="events-empty">
          <div className="events-empty-box">
            <h2>Nessun evento disponibile</h2>

            <p>
              Al momento non ci sono eventi pubblicati. Torna presto oppure entra
              nel Discord per restare aggiornato.
            </p>

            <div className="events-empty-actions">
              <a
                href="https://discord.gg/4NrqDfgP"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-discord"
              >
                Entra nel Discord
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section className="events-grid">
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