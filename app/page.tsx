"use client";

export default function HomePage() {
  return (
    <main>

      <section className="hero">

        <h1>Gaming Hub</h1>

        <p>
          Offerte PC • Giochi Gratis • Eventi Community
        </p>

      </section>

      <section className="cards">

        <div className="card">
          <h3>💸 Offerte PC</h3>
          <p>
            Scopri le migliori offerte Steam, Epic e GOG.
          </p>
        </div>

        <div className="card">
          <h3>🎮 Eventi</h3>
          <p>
            Partecipa agli eventi e forma squadre con la community.
          </p>
        </div>

        <div className="card">
          <h3>🏆 Tornei</h3>
          <p>
            Sfida altri player nei tornei organizzati.
          </p>
        </div>

        <div className="card">
          <h3>👤 Profilo Player</h3>
          <p>
            Collega Discord e completa il tuo profilo.
          </p>
        </div>

      </section>

    </main>
  );
}