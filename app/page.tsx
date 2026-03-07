export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">🎮 Gaming Hub</h1>

          <p className="hero-subtitle">
            Offerte PC, tornei community e squadre automatiche per giocare insieme.
          </p>

          <div className="hero-buttons">
            <a
              href="https://discord.gg/4NrqDfgP"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-discord"
            >
              Unisciti alla Community
            </a>

            <a href="/events" className="hero-events">
              Scopri gli Eventi
            </a>
          </div>
        </div>
      </section>

      <section className="home-sections">
        <div className="home-cards">
          <a href="/events" className="home-card">
            <div className="home-card-icon">📅</div>
            <h2>Eventi</h2>
            <p>Partecipa agli eventi della community e unisciti alle squadre.</p>
          </a>

          <a href="/deals" className="home-card">
            <div className="home-card-icon">🔥</div>
            <h2>Offerte Epic</h2>
            <p>Scopri giochi gratis e offerte aggiornate direttamente dal sito.</p>
          </a>

          <a
            href="https://discord.gg/4NrqDfgP"
            target="_blank"
            rel="noopener noreferrer"
            className="home-card"
          >
            <div className="home-card-icon">💬</div>
            <h2>Discord Community</h2>
            <p>Entra nel server, resta aggiornato e gioca insieme alla community.</p>
          </a>
        </div>
      </section>
    </main>
  );
}