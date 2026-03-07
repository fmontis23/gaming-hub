"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Deal = {
  title: string;
  image: string;
  url: string;
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const res = await fetch("/api/deals/sync");

        if (!res.ok) {
          throw new Error("Errore nel caricamento deals");
        }

        const data = await res.json();
        setDeals(data.deals || []);
      } catch (error) {
        console.error("Errore deals:", error);
        setDeals([]);
      }
    };

    loadDeals();
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <button
        onClick={() => router.back()}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #444",
          background: "rgba(255,255,255,0.05)",
          color: "white",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ← Indietro
      </button>

      <h1 style={{ marginBottom: 20 }}>🎮 Giochi Gratis Epic Games</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
          gap: 24,
        }}
      >
        {deals.map((deal, i) => (
          <a
            key={i}
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "white",
              background: "#111",
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid #333",
              transition: "0.2s",
              display: "block",
            }}
          >
            <img
              src={deal.image}
              alt={deal.title}
              style={{
                width: "100%",
                height: 160,
                objectFit: "cover",
              }}
            />

            <div style={{ padding: 14 }}>
              <h3 style={{ margin: 0 }}>{deal.title}</h3>

              <div
                style={{
                  marginTop: 10,
                  color: "#00ff9c",
                  fontWeight: "bold",
                }}
              >
                FREE
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}