"use client";

import Link from "next/link";

function cardStyle(image: string): React.CSSProperties {
  return {
    position: "relative",
    overflow: "hidden",
    borderRadius: 18,
    minHeight: 220,
    border: "1px solid rgba(255,255,255,0.10)",
    backgroundImage: `
      linear-gradient(180deg, rgba(7,10,18,0.10), rgba(7,10,18,0.88)),
      url('${image}')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 14px 40px rgba(0,0,0,0.28)",
  };
}

export default function HomePage() {
  return (
    <main style={{ paddingBottom: 48 }}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          minHeight: 420,
          padding: "56px 40px",
          display: "flex",
          alignItems: "center",
          backgroundImage:
            "linear-gradient(90deg, rgba(7,10,18,0.92) 0%, rgba(7,10,18,0.72) 45%, rgba(7,10,18,0.38) 100%), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.34)",
        }}
      >
        <div style={{ maxWidth: 700 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 14,
              marginBottom: 18,
            }}
          >
            🎮 Community gaming • Eventi • Deals • Discord
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.4rem, 5vw, 4.6rem)",
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            Gaming Hub
          </h1>

          <p
            style={{
              marginTop: 16,
              fontSize: 18,
              maxWidth: 620,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.84)",
            }}
          >
            Il punto di ritrovo della community: giochi gratis, offerte gaming,
            eventi competitivi, squadre e integrazione Discord in un solo posto.
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <Link href="/events" className="home-cta-primary">
              Vai agli Eventi
            </Link>

            <Link href="/deals" className="home-cta-secondary">
              Scopri i Deals
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: 22,
              flexWrap: "wrap",
              marginTop: 28,
              color: "rgba(255,255,255,0.78)",
              fontSize: 14,
            }}
          >
            <span>⚡ Accesso rapido</span>
            <span>🏆 Tornei community</span>
            <span>🎁 Giochi gratis Epic</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 36 }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 30 }}>Esplora il portale</h2>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.72)" }}>
            Tutto quello che serve alla tua community gaming, in un’unica home.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 20,
          }}
        >
          <Link href="/events" style={cardStyle("https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80")}>
            <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 14, opacity: 0.82 }}>🎮 Community Events</div>
              <h3 style={{ margin: "8px 0 6px", fontSize: 28 }}>Eventi</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.84)", lineHeight: 1.5 }}>
                Accedi agli eventi, partecipa con il tuo profilo gaming e segui le iscrizioni.
              </p>
            </div>
          </Link>

          <Link href="/deals" style={cardStyle("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80")}>
            <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 14, opacity: 0.82 }}>💸 Gaming Deals</div>
              <h3 style={{ margin: "8px 0 6px", fontSize: 28 }}>Offerte</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.84)", lineHeight: 1.5 }}>
                Scopri i giochi gratis e le promo migliori direttamente dal portale.
              </p>
            </div>
          </Link>

          <Link href="/admin" style={cardStyle("https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=1200&q=80")}>
            <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 14, opacity: 0.82 }}>🏆 Competitive Hub</div>
              <h3 style={{ margin: "8px 0 6px", fontSize: 28 }}>Tornei</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.84)", lineHeight: 1.5 }}>
                Dashboard admin, gestione bracket, team e controlli per moderatori.
              </p>
            </div>
          </Link>

          <Link href="/profile" style={cardStyle("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80")}>
            <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 14, opacity: 0.82 }}>👤 Player Identity</div>
              <h3 style={{ margin: "8px 0 6px", fontSize: 28 }}>Profilo</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.84)", lineHeight: 1.5 }}>
                Collega il profilo, completa i dati Ubisoft e sblocca l’accesso agli eventi.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section
        style={{
          marginTop: 38,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
        }}
      >
        <div className="home-stat-card">
          <div className="home-stat-value">Epic</div>
          <div className="home-stat-label">Deals automatici</div>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-value">Discord</div>
          <div className="home-stat-label">Notifiche evento attive</div>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-value">5v5</div>
          <div className="home-stat-label">Gestione team e squadre</div>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-value">Admin</div>
          <div className="home-stat-label">Controllo eventi e deals</div>
        </div>
      </section>
    </main>
  );
}