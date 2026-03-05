"use client";

export default function AdminDashboard() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>🛠 Dashboard Moderatore</h1>
      <p style={{ opacity: 0.85 }}>
        Da qui gestisci eventi/tornei e offerte PC.
      </p>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <a href="/admin/events" style={card()}>
          <b>🎮 Gestisci Eventi</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Crea, elimina e controlla gli eventi
          </div>
        </a>

        <a href="/admin/deals" style={card()}>
          <b>💸 Gestisci Deals</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Aggiungi / elimina offerte e giochi gratis
          </div>
        </a>

        <a href="/events" style={card()}>
          <b>🏆 Eventi (pubblico)</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Visualizza come un utente
          </div>
        </a>

        <a href="/deals" style={card()}>
          <b>🎁 Deals (pubblico)</b>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Visualizza offerte sul sito
          </div>
        </a>
      </div>
    </main>
  );
}

function card(): React.CSSProperties {
  return {
    border: "1px solid #444",
    borderRadius: 14,
    padding: 14,
    textDecoration: "none",
    color: "inherit",
    background: "rgba(255,255,255,0.02)",
  };
}
