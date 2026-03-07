"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data: dealsData } = await supabase.from("deals").select("*");
      setDeals(dealsData ?? []);
    };
    fetchDeals();
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>🎮 Offerte e giochi gratis</h1>

      {deals.length === 0 && <p>Nessuna offerta disponibile.</p>}

      {deals.map((deal) => (
        <div key={deal.deal_id} style={{ padding: 10, border: "1px solid #444", borderRadius: 10, marginTop: 20 }}>
          <h2>{deal.title}</h2>
          <p>💰 Prezzo: {deal.price_new}€</p>
          <p>
            <a href={deal.url} target="_blank" style={{ color: "#0070f3" }}>
              Vai all'offerta
            </a>
          </p>
        </div>
      ))}
    </main>
  );
}