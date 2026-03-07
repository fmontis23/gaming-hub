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
      <h1>🎮 Giochi Gratis Epic Games</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {deals.map((deal, i) => (
          <a
            key={i}
            href={deal.url}
            target="_blank"
            style={{
              border: "1px solid #444",
              borderRadius: 10,
              padding: 10,
              textDecoration: "none",
              color: "white",
              background: "#111",
            }}
          >
            <img
              src={deal.image}
              style={{
                width: "100%",
                borderRadius: 8,
              }}
            />

            <h3 style={{ marginTop: 10 }}>{deal.title}</h3>

            <p style={{ color: "#00ff9c" }}>FREE</p>
          </a>
        ))}
      </div>
    </main>
  );
}