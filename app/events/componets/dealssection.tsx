"use client";

import { useEffect, useMemo, useState } from "react";

type DealItem = {
  id: string;
  title: string;
  image: string | null;
  url: string;
  end_date: string | null;
  store: string | null;
};

type CountdownMap = {
  [dealId: string]: string;
};

export default function DealsSection() {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      const aTime = a.end_date ? new Date(a.end_date).getTime() : Infinity;
      const bTime = b.end_date ? new Date(b.end_date).getTime() : Infinity;
      return aTime - bTime;
    });
  }, [deals]);

  const loadDeals = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/deals");
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || "Errore caricamento deals");
        setDeals([]);
        return;
      }

      setDeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore caricamento deals:", error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
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

  return (
    <section
      style={{
        marginTop: 40,
        padding: 24,
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(23,23,38,0.98), rgba(14,14,24,0.98))",
        boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ marginBottom: 20 }}>
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

        <h2 style={{ margin: 0, fontSize: 30 }}>🎁 Deals del momento</h2>

        <p style={{ color: "#b8b8d0", marginTop: 10, marginBottom: 0 }}>
          Giochi gratis e offerte attive raccolte nel tuo Gaming Hub.
        </p>
      </div>

      {loading ? (
        <div
          style={{
            padding: 30,
            borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}
        >
          Caricamento deals...
        </div>
      ) : sortedDeals.length === 0 ? (
        <div
          style={{
            padding: 30,
            borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}
        >
          Nessun deal disponibile al momento.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 20,
          }}
        >
          {sortedDeals.map((deal) => {
            const countdown = countdowns[deal.id] || getCountdownLabel(deal.end_date);
            const expired = countdown === "Offerta terminata";

            return (
              <div
                key={deal.id}
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 170,
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
                      display: "inline-block",
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: "rgba(88,101,242,0.14)",
                      color: "#c7d2fe",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    {deal.store || "Store"}
                  </div>

                  <h3 style={{ margin: 0, marginBottom: 10, fontSize: 20 }}>
                    {deal.title}
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      marginBottom: 14,
                      color: "#d4d4f7",
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
  );
}