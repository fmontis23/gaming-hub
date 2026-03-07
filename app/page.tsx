"use client";

import { useEffect, useState } from "react";

type Deal = {
  title: string;
  image: string;
  url: string;
};

export default function Home() {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const res = await fetch("/api/deals/sync");

        if (!res.ok) {
          throw new Error("Errore nel caricamento deals");
        }

        const data = await res.json();
        setDeals((data.deals || []).slice(0, 3));
      } catch (error) {
        console.error("Errore home deals:", error);
        setDeals([]);
      }
    };

    loadDeals();
  }, []);

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

      <section className="home-deals-preview">
        <div className="section-header">
          <h2>🔥 Giochi Gratis Epic</h2>
          <a href="/deals" className="section-link">
            Vedi tutto
          </a>
        </div>

        {deals.length === 0 ? (
          <div className="empty-preview">
            Nessun deal disponibile al momento.
          </div>
        ) : (
          <div className="deals-preview-grid">
            {deals.map((deal, index) => (
              <a
                key={index}
                href={deal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="deal-preview-card"
              >
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="deal-preview-image"
                />

                <div className="deal-preview-content">
                  <h3>{deal.title}</h3>
                  <span className="deal-free-badge">FREE</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}