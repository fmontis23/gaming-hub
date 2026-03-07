"use client";

import { useEffect, useState } from "react";
import { fetchEpicDeals } from "../api/deals/sync/epic";
import { fetchSteamDeals } from "../api/deals/sync/steam";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const epicDeals = await fetchEpicDeals();
        const steamDeals = await fetchSteamDeals();

        // Verifica che i dati siano validi prima di usarli
        const validDeals = [
          ...((epicDeals || []) as any[]),
          ...((steamDeals || []) as any[]),
        ];

        setDeals(validDeals);
      } catch (error) {
        console.error("Errore nel caricamento delle offerte", error);
      }
    };

    loadDeals();
  }, []);

  return (
    <div>
      <h1>Offerte Disponibili</h1>
      <ul>
        {deals.length === 0 ? (
          <p>Non ci sono offerte al momento.</p>
        ) : (
          deals.map((deal, index) => (
            <li key={index}>
              {deal.title} - {deal.price}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}