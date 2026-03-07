export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Rainbow Six Squad Night",
      game: "Rainbow Six Siege",
      date: "15 Marzo 2026 - 21:30",
      slots: "8/10",
      status: "Aperto",
    },
    {
      id: 2,
      title: "Valorant Team Battle",
      game: "Valorant",
      date: "18 Marzo 2026 - 22:00",
      slots: "10/10",
      status: "Pieno",
    },
    {
      id: 3,
      title: "Fortnite Community Event",
      game: "Fortnite",
      date: "22 Marzo 2026 - 18:00",
      slots: "5/10",
      status: "Aperto",
    },
  ];

  return (
    <main className="events-page">
      <section className="events-hero">
        <h1 className="events-title">📅 Eventi Community</h1>
        <p className="events-subtitle">
          Partecipa agli eventi del server, entra nelle squadre e gioca con la community.
        </p>
      </section>

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
    </main>
  );
}