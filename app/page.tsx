export default function Home() {
  return (
    <main>

      <section className="hero">

        <h1 className="hero-title">
          Benvenuto su Gaming Hub
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
            Entra nel Discord
          </a>

          <a href="/events" className="hero-events">
            Guarda gli Eventi
          </a>

        </div>

      </section>

    </main>
  );
}