"use client";

import { useEffect, useState } from "react";

type Deal = {
  title: string;
  storeID: string;
  price: string;
  oldPrice: string;
  savings: string;
  url: string;
  image: string;
  dealEnds: string;
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const res = await fetch("/api/deals/sync");
      const data = await res.json();
      setDeals(data.deals);
    };
    fetchDeals();
  }, []);

  if (deals.length === 0) {
    return <div>Caricamento offerte...</div>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🎮 Offerte e giochi gratis</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
        {deals.map((deal, index) => (
          <div key={index} style={{ border: "1px solid #444", borderRadius: 10, padding: 20 }}>
            <img src={deal.image} alt={deal.title} style={{ width: "100%", height: "auto", borderRadius: 10 }} />
            <h3>{deal.title}</h3>
            <p><strong>Prezzo:</strong> {deal.price}</p>
            <p><strong>Prezzo precedente:</strong> {deal.oldPrice}</p>
            <p><strong>Risparmi:</strong> {deal.savings}</p>
            <a href={deal.url} target="_blank" style={{ color: "#1e90ff", textDecoration: "none" }}>
              Vai allo store
            </a>
            <p><em>Scade il: {new Date(deal.dealEnds).toLocaleString()}</em></p>
          </div>
        ))}
      </div>
    </main>
  );
}