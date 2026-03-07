"use client"; // Aggiungi questa direttiva

import { useState, useEffect } from "react";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const res = await fetch("/api/deals/sync");
      const data = await res.json();
      setDeals(data.deals);
    };

    fetchDeals();
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>Offerte Disponibili</h1>

      {deals.length === 0 ? (
        <p>Nessuna offerta disponibile.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
          {deals.map((deal: any, index: number) => (
            <div key={index} style={{ border: "1px solid #444", borderRadius: "10px", padding: "15px", background: "#1c1c1c" }}>
              {deal.image_url && (
                <img
                  src={deal.image_url}
                  alt={deal.title}
                  style={{ width: "100%", height: "auto", borderRadius: "10px" }}
                />
              )}
              <h3>{deal.title}</h3>
              <p>{deal.store}</p>
              <p>{deal.deal_type}</p>
              <p>
                <strong>Prezzo: </strong>
                {deal.price_old ? (
                  <>
                    <span style={{ textDecoration: "line-through", marginRight: "5px" }}>
                      {deal.price_old} {deal.currency}
                    </span>
                    <span style={{ color: "red" }}>
                      {deal.price_new} {deal.currency}
                    </span>
                  </>
                ) : (
                  <span>{deal.price_new} {deal.currency}</span>
                )}
              </p>
              <p><strong>Scadenza:</strong> {new Date(deal.ends_at).toLocaleString()}</p>
              <a href={deal.url} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
                Vai alla offerta
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}