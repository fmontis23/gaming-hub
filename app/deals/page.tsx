"use client";

import { useEffect, useMemo, useState } from "react";

type Deal = {
  id: string;
  title: string;
  image: string;
  url: string;
  price: string;
  store: string;
  platform: string;
  start_date: string | null;
  end_date: string | null;
};

type CountdownMap = {
  [dealId: string]: string;
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("Tutte");
  const [countdowns, setCountdowns] = useState<CountdownMap>({});

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const next: CountdownMap = {};

      for (const deal of deals) {
        next[deal.id] = getCountdownLabel(deal.end_date);
      }

      setCountdowns(next);
    }, 1000);

    return () => clearInterval(interval);
  }, [deals]);

  const loadDeals = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/deals/sync", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Errore nel caricamento deals");
      }

      setDeals(Array.isArray(data.deals) ? data.deals : []);
    } catch (error) {
      console.error("Errore pagina deals:", error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (platform !== "Tutte") {
      result = result.filter((deal) => deal.platform === platform);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((deal) => deal.title.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const aTime = a.end_date ? new Date(a.end_date).getTime() : Infinity;
      const bTime = b.end_date ? new Date(b.end_date).getTime() : Infinity;
      return aTime - bTime;
    });

    return result;
  }, [deals, search, platform]);

  const formatDate = (date: string | null) => {
    if (!date) return "Non disponibile";

    return new Date(date).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCountdownLabel = (endDate: string | null) => {
    if (!endDate) return "Scadenza non disponibile";

    const now = new Date().getTime();
    const end = new Date(endDate).getTime();

    if (Number.isNaN(end)) return "Scadenza non disponibile";
    if (now >= end) return "Offerta terminata";

    const diff = end - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) {
      return `${days}g ${hours}h ${minutes}m ${seconds}s`;
    }

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background:
          "radial-gradient(circle at top, rgba(88,101,242,0.18), transparent 30%), linear-gradient(180deg, #0a0a12 0%, #11111b 100%)",
        color: "white",
      }}
    >
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto 24px",
          padding: 24,
          borderRadius: 22,
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
            background: "rgba(34,197,94,0.14)",
            color: "#86efac",
            fontWeight: 700,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          FREE GAMES
        </div>

        <h1 style={{ margin: 0, fontSize: 42 }}>🔥 Deals Gaming</h1>

        <p style={{ color: "#c7c9e0", marginTop: 10, marginBottom: 0 }}>
          Cerca offerte, filtra per piattaforma e controlla il countdown live.
        </p>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto 24px",
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) minmax(180px, 220px)",
          gap: 16,
        }}
      >
        <input
          type="text"
          placeholder="Cerca un gioco..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "white",
            outline: "none",
            fontSize: 15,
          }}
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "#1a1a28",
            color: "white",
            outline: "none",
            fontSize: 15,
          }}
        >
          <option value="Tutte">Tutte le piattaforme</option>
          <option value="Epic">Epic</option>
          <option value="Steam">Steam</option>
        </select>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <div
            style={{
              padding: 30,
              borderRadius: 18,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center",
            }}
          >
            Caricamento deals...
          </div>
        ) : filteredDeals.length === 0 ? (
          <div
            style={{
              padding: 30,
              borderRadius: 18,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center",
              color: "#b8b8d0",
            }}
          >
            Nessun deal trovato con i filtri attuali.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: 20,
            }}
          >
            {filteredDeals.map((deal) => {
              const countdown =
                countdowns[deal.id] || getCountdownLabel(deal.end_date);
              const expired = countdown === "Offerta terminata";

              return (
                <div
                  key={deal.id}
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 180,
                      background: "#111827",
                      overflow: "hidden",
                    }}
                  >
                    {deal.image ? (
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
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#9ca3af",
                          fontWeight: 700,
                        }}
                      >
                        Nessuna immagine
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: 999,
                          background: "rgba(88,101,242,0.14)",
                          color: "#c7d2fe",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {deal.store}
                      </span>

                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: 999,
                          background: "rgba(34,197,94,0.14)",
                          color: "#86efac",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {deal.price}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: 0,
                        marginBottom: 12,
                        fontSize: 20,
                        lineHeight: 1.4,
                      }}
                    >
                      {deal.title}
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gap: 8,
                        color: "#d4d4f7",
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        ⏳ <strong>Countdown:</strong>{" "}
                        <span style={{ color: expired ? "#fca5a5" : "#86efac" }}>
                          {countdown}
                        </span>
                      </div>

                      <div>
                        📅 <strong>Scade:</strong> {formatDate(deal.end_date)}
                      </div>
                    </div>

                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        width: "100%",
                        textAlign: "center",
                        padding: "12px 14px",
                        borderRadius: 12,
                        textDecoration: "none",
                        background: expired
                          ? "#3f3f46"
                          : "linear-gradient(90deg, #5865f2, #7c3aed)",
                        color: "white",
                        fontWeight: 800,
                        pointerEvents: expired ? "none" : "auto",
                        opacity: expired ? 0.7 : 1,
                      }}
                    >
                      {expired ? "Offerta scaduta" : "Apri deal"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}