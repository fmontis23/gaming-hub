"use client"; // Aggiungi questa linea all'inizio del file

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    // Logica per ottenere i deals
    const fetchDeals = async () => {
      const { data, error } = await supabase.from("deals").select("*");
      if (error) {
        console.error("Errore nel recupero delle offerte:", error);
        return;
      }
      setDeals(data);
    };

    fetchDeals();
  }, []);

  return (
    <div>
      <h1>Offerte Disponibili</h1>
      {deals.length === 0 ? (
        <p>Non ci sono offerte al momento.</p>
      ) : (
        <ul>
          {deals.map((deal, index) => (
            <li key={index}>
              <h2>{deal.title}</h2>
              <p>{deal.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
