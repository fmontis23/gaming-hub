"use client";

import { useEffect, useState } from "react";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    const loadDeals = async () => {
      const res = await fetch("/api/deals/sync");
      const data = await res.json();
      setDeals(data.deals || []);
    };

    loadDeals();
  }, []);

  return (
    <main style={{ padding: 40 }}>
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
            style={{
              textDecoration: "none",
              color: "white",
              background: "#111",
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid #333",
              transition: "0.2s",
            }}
          >
            <img
              src={deal.image}
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