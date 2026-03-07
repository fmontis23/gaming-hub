export default function Home() {
  return (
    <main>

      <section className="hero">

        <div className="hero-content">

          <h1 className="hero-title">
            🎮 Gaming Hub
          </h1>

          <p className="hero-subtitle">
            Offerte PC, tornei community e squadre automatiche per giocare insieme.
          </p>

          <div className="hero-buttons">

            <a
              href="https://discord.gg/4NrqDfgP"
              target="_blank"
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

    </main>
  );
}