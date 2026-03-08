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
        setDeals((data.deals || []).slice(0, 6));
      } catch (error) {
        console.error("Errore home deals:", error);
        setDeals([]);
      }
    };

    loadDeals();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(88,101,242,0.18), transparent 30%), linear-gradient(180deg, #0a0a12 0%, #11111b 100%)",
        color: "white",
      }}
    >
      <section
        style={{
          padding: "70px 40px 30px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: 32,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(135deg, rgba(88,101,242,0.16), rgba(124,58,237,0.10))",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(88,101,242,0.18)",
              color: "#c7d2fe",
              fontWeight: 700,
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            GAMING HUB
          </div>

          <h1
            style={{
              fontSize: 52,
              margin: 0,
              marginBottom: 12,
              lineHeight: 1.1,
            }}
          >
            🎮 Gaming Hub
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#c7c9e0",
              maxWidth: 760,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Il punto d’incontro della tua community gaming: eventi, squadre,
            offerte PC e collegamento diretto al server Discord.
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://discord.gg/4NrqDfgP"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "14px 22px",
                borderRadius: 14,
                textDecoration: "none",
                background: "linear-gradient(90deg, #5865f2, #7c3aed)",
                color: "white",
                fontWeight: 800,
                boxShadow: "0 12px 30px rgba(88,101,242,0.35)",
              }}
            >
              Unisciti alla Community
            </a>

            <a
              href="/events"
              style={{
                display: "inline-block",
                padding: "14px 22px",
                borderRadius: 14,
                textDecoration: "none",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
                fontWeight: 800,
              }}
            >
              Scopri gli Eventi
            </a>

            <a
              href="/deals"
              style={{
                display: "inline-block",
                padding: "14px 22px",
                borderRadius: 14,
                textDecoration: "none",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
                fontWeight: 800,
              }}
            >
              Vedi i Deals
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "10px 40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          <a
            href="/events"
            style={{
              textDecoration: "none",
              color: "white",
              padding: 22,
              borderRadius: 20,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 12 }}>📅</div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Eventi</h2>
            <p style={{ color: "#b8b8d0", margin: 0, lineHeight: 1.6 }}>
              Partecipa agli eventi della community e unisciti alle squadre.
            </p>
          </a>

          <a
            href="/deals"
            style={{
              textDecoration: "none",
              color: "white",
              padding: 22,
              borderRadius: 20,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 12 }}>🔥</div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Deals</h2>
            <p style={{ color: "#b8b8d0", margin: 0, lineHeight: 1.6 }}>
              Scopri giochi gratis e offerte aggiornate direttamente dal sito.
            </p>
          </a>

          <a
            href="https://discord.gg/4NrqDfgP"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "white",
              padding: 22,
              borderRadius: 20,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 12 }}>💬</div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Discord Community</h2>
            <p style={{ color: "#b8b8d0", margin: 0, lineHeight: 1.6 }}>
              Entra nel server, resta aggiornato e gioca insieme alla community.
            </p>
          </a>
        </div>
      </section>

      <section
        style={{
          padding: "10px 40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: 24,
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(23,23,38,0.98), rgba(14,14,24,0.98))",
            boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
            display: "grid",
            gridTemplateColumns: "1.3fr 0.9fr",
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(88,101,242,0.18)",
                color: "#c7d2fe",
                fontWeight: 700,
                marginBottom: 10,
                fontSize: 13,
              }}
            >
              DISCORD HUB
            </div>

            <h2 style={{ margin: 0, fontSize: 30, marginBottom: 12 }}>
              💬 La community vive su Discord
            </h2>

            <p
              style={{
                color: "#b8b8d0",
                lineHeight: 1.7,
                marginTop: 0,
                marginBottom: 18,
                maxWidth: 650,
              }}
            >
              Il sito e il server lavorano insieme: eventi, notifiche, squadre,
              aggiornamenti e community gaming tutto nello stesso ecosistema.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <a
                href="https://discord.gg/4NrqDfgP"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "14px 20px",
                  borderRadius: 14,
                  textDecoration: "none",
                  background: "linear-gradient(90deg, #5865f2, #7c3aed)",
                  color: "white",
                  fontWeight: 800,
                  boxShadow: "0 12px 30px rgba(88,101,242,0.35)",
                }}
              >
                Entra su Discord
              </a>

              <a
                href="/events"
                style={{
                  display: "inline-block",
                  padding: "14px 20px",
                  borderRadius: 14,
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "white",
                  fontWeight: 800,
                }}
              >
                Vai agli Eventi
              </a>
            </div>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: 20,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: 14,
              alignContent: "start",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 4 }}>📣 Annunci evento</div>
              <div style={{ color: "#b8b8d0", lineHeight: 1.6 }}>
                Apertura iscrizioni e aggiornamenti arrivano anche su Discord.
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 4 }}>⚔️ Squadre e tornei</div>
              <div style={{ color: "#b8b8d0", lineHeight: 1.6 }}>
                Organizza partite e community nights in modo semplice e veloce.
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 4 }}>🎁 Deals e giochi gratis</div>
              <div style={{ color: "#b8b8d0", lineHeight: 1.6 }}>
                Epic e Steam in un unico hub sempre aggiornato.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "20px 40px 60px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: 24,
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(23,23,38,0.98), rgba(14,14,24,0.98))",
            boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(34,197,94,0.14)",
                  color: "#86efac",
                  fontWeight: 700,
                  marginBottom: 10,
                  fontSize: 13,
                }}
              >
                FREE GAMES
              </div>

              <h2 style={{ margin: 0, fontSize: 30 }}>🔥 Giochi Gratis Epic</h2>

              <p style={{ color: "#b8b8d0", marginTop: 10, marginBottom: 0 }}>
                Preview rapida delle offerte disponibili.
              </p>
            </div>

            <a
              href="/deals"
              style={{
                textDecoration: "none",
                color: "white",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                padding: "12px 16px",
                borderRadius: 12,
                fontWeight: 800,
              }}
            >
              Vedi tutto
            </a>
          </div>

          {deals.length === 0 ? (
            <div
              style={{
                padding: 24,
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
                color: "#b8b8d0",
              }}
            >
              Nessun deal disponibile al momento.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: 18,
              }}
            >
              {deals.map((deal, index) => (
                <a
                  key={index}
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "white",
                    borderRadius: 18,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    display: "block",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 160,
                      background: "#111827",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={deal.image}
                      alt={deal.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>

                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "5px 10px",
                        borderRadius: 999,
                        background: "rgba(34,197,94,0.14)",
                        color: "#86efac",
                        fontWeight: 800,
                        fontSize: 12,
                        marginBottom: 10,
                      }}
                    >
                      FREE
                    </div>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: 18,
                        lineHeight: 1.4,
                      }}
                    >
                      {deal.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}