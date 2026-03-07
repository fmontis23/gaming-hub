import { useEffect, useState } from "react";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const response = await fetch("/api/deals/sync");
      const data = await response.json();
      if (data.success) {
        setDeals(data.deals);
      } else {
        console.error("Errore nel recupero delle offerte");
      }
    };
    fetchDeals();
  }, []);

  return (
    <div>
      <h1>Offerte & Giochi Gratis</h1>
      <div className="deals-container">
        {deals.length > 0 ? (
          deals.map((deal) => (
            <div key={deal.id} className="deal">
              <h2>{deal.title}</h2>
              <p>{deal.store}</p>
              <p>Prezzo: {deal.price_new}</p>
              <a href={deal.url} target="_blank" rel="noopener noreferrer">
                Vai al gioco
              </a>
            </div>
          ))
        ) : (
          <p>Nessuna offerta disponibile al momento.</p>
        )}
      </div>
    </div>
  );
}